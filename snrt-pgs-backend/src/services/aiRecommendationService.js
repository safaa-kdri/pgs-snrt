// src/services/aiRecommendationService.js
// ✅ SERVICE DE RECOMMANDATION DE STAGES AVEC IA

const Offer = require('../models/Offer');
const Application = require('../models/Application');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Document = require('../models/Document');
const logger = require('../utils/logger');
const OpenAI = require('openai');
const fs = require('fs/promises');
const { PDFParse } = require('pdf-parse');
const { pipeline } = require('@huggingface/transformers');
const gridfsService = require('./gridfsService');

// ============================================
// CONFIGURATION
// ============================================

const SIMILARITY_THRESHOLD = 0.3;
const MAX_RECOMMENDATIONS = 10;
const AI_MODEL = process.env.GROQ_MODEL || process.env.OPENAI_MODEL || 'groq/compound-mini';
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
let embeddingPipelinePromise = null;

const getAIClient = () => {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return null;
    }

    return new OpenAI({
        apiKey,
        baseURL: process.env.GROQ_API_KEY
            ? 'https://api.groq.com/openai/v1'
            : undefined,
    });
};

const getEmbeddingPipeline = () => {
    if (!embeddingPipelinePromise) {
        embeddingPipelinePromise = pipeline('feature-extraction', EMBEDDING_MODEL, {
            dtype: 'fp32',
        });
    }
    return embeddingPipelinePromise;
};

const cosineSimilarity = (firstVector, secondVector) => {
    let dotProduct = 0;
    let firstMagnitude = 0;
    let secondMagnitude = 0;

    for (let index = 0; index < firstVector.length; index += 1) {
        dotProduct += firstVector[index] * secondVector[index];
        firstMagnitude += firstVector[index] ** 2;
        secondMagnitude += secondVector[index] ** 2;
    }

    if (!firstMagnitude || !secondMagnitude) return 0;
    return dotProduct / (Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude));
};

const embedText = async (text) => {
    const extractor = await getEmbeddingPipeline();
    const output = await extractor(text.slice(0, 6000), {
        pooling: 'mean',
        normalize: true,
    });
    return Array.from(output.data);
};

const emptyCvAnalysis = (status, message) => ({
    status,
    message,
    skills: [],
    experiences: [],
    projects: [],
});

const normalizeSkill = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/html5/g, 'html')
    .replace(/css3/g, 'css')
    .trim();

const SKILL_ALIASES = Object.freeze({
    js: 'javascript',
    'java script': 'javascript',
    ts: 'typescript',
    'html 5': 'html',
    'css 3': 'css',
    'q learning': 'q-learning',
    'reinforcement-learning': 'reinforcement learning',
    'network traffic analysis': 'network analysis',
    'visual studio code': 'vs code',
});

const canonicalSkill = (value) => {
    const normalized = normalizeSkill(value);
    return SKILL_ALIASES[normalized] || normalized;
};

const normalizeSkillList = (values) => Array.from(new Set(
    (Array.isArray(values) ? values : [])
        .flatMap((value) => {
            if (typeof value === 'string') return [value];
            if (value && typeof value === 'object') {
                return [value.nom, value.name, value.skill, value.technology].filter(Boolean);
            }
            return [];
        })
        .map(canonicalSkill)
        .filter(Boolean)
));

const normalizeCvEntry = (entry, type) => {
    if (typeof entry === 'string') {
        return { title: entry.trim(), skills: [] };
    }

    if (!entry || typeof entry !== 'object') {
        return null;
    }

    return {
        title: String(entry.title || entry.titre || entry.name || '').trim(),
        company: String(entry.company || entry.organization || entry.entreprise || '').trim(),
        role: String(entry.role || entry.poste || entry.fonction || '').trim(),
        description: String(entry.description || entry.summary || '').trim(),
        skills: normalizeSkillList(entry.skills || entry.competences || entry.technologies),
        type,
    };
};

const normalizeCvEntries = (values, type) => Array.from(new Map(
    (Array.isArray(values) ? values : [])
        .map((entry) => normalizeCvEntry(entry, type))
        .filter((entry) => entry && (entry.title || entry.company || entry.description))
        .map((entry) => [`${entry.company}|${entry.title}|${entry.role}`.toLowerCase(), entry])
).values());

const extractCvEntrySkills = (cvAnalysis) => normalizeSkillList([
    ...(cvAnalysis?.experiences || []).flatMap((entry) => entry.skills || []),
    ...(cvAnalysis?.projects || []).flatMap((entry) => entry.skills || []),
]);

const skillAppearsInText = (skill, text) => {
    const normalizedSkill = normalizeSkill(skill);
    const normalizedText = normalizeSkill(text);
    return normalizedSkill && normalizedText.includes(normalizedSkill);
};

const skillMatches = (first, second) => {
    const firstTokens = normalizeSkill(first).split(/\s*[/,&+]\s*|\s+/).filter(Boolean);
    const secondTokens = normalizeSkill(second).split(/\s*[/,&+]\s*|\s+/).filter(Boolean);
    return firstTokens.some((token) => secondTokens.includes(token));
};

const extractCvSignals = (text) => {
    const knownSkills = [
        'python', 'java', 'javascript', 'typescript', 'sql', 'html', 'html5', 'css', 'css3',
        'react', 'flask', 'mysql', 'phpmyadmin', 'git', 'vs code', 'eclipse', 'xampp',
        'tcp/ip', 'suricata', 'q-learning', 'reinforcement learning', 'network administration',
    ];
    const skills = normalizeSkillList(
        knownSkills.filter((skill) => normalizeSkill(text).includes(normalizeSkill(skill)))
    );
    const experiences = [];
    const projects = [];

    const experienceOrganizations = ['SNRT', 'LEAR CORPORATION'];
    experienceOrganizations.forEach((organization) => {
        const organizationIndex = text.toLowerCase().indexOf(organization.toLowerCase());
        if (organizationIndex >= 0) {
            experiences.push({
                company: organization,
                title: text.slice(organizationIndex, organizationIndex + 220).trim(),
                skills: [],
            });
        }
    });

    const projectIndex = text.toLowerCase().indexOf('final year project');
    if (projectIndex >= 0) {
        projects.push({
            title: text.slice(projectIndex, projectIndex + 260).trim(),
            skills: [],
        });
    }

    return { skills, experiences, projects };
};

const readStoredDocument = async (document) => {
    if (document.gridFsId) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            const stream = gridfsService.downloadFile(document.gridFsId);
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }

    if (document.chemin) {
        return fs.readFile(document.chemin);
    }

    throw new Error('Fichier CV introuvable dans le stockage');
};

const extractPdfText = async (buffer) => {
    const parser = new PDFParse({ data: buffer });
    try {
        const result = await parser.getText();
        return (result.text || '').replace(/\s+/g, ' ').trim();
    } finally {
        await parser.destroy();
    }
};

const parseJsonResponse = (content) => {
    const normalizedContent = (content || '{}')
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
    const jsonStart = normalizedContent.indexOf('{');
    const jsonEnd = normalizedContent.lastIndexOf('}');
    return JSON.parse(
        jsonStart >= 0 && jsonEnd > jsonStart
            ? normalizedContent.slice(jsonStart, jsonEnd + 1)
            : normalizedContent
    );
};

const analyzeCvText = async (text) => {
    if (!text || text.length < 40) {
        return emptyCvAnalysis('no_information', 'Aucune information exploitable n’a été extraite du CV déposé.');
    }

    const aiClient = getAIClient();
    if (!aiClient) {
        return emptyCvAnalysis('ai_unavailable', 'Le texte du CV a été lu, mais l’analyse IA est indisponible.');
    }

    const cvSignals = extractCvSignals(text);
    const response = await aiClient.chat.completions.create({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: 'Analyse un CV et réponds uniquement avec un objet JSON valide, sans markdown.',
            },
            {
                role: 'user',
                content: [
                    'Extrait uniquement les informations explicites du CV.',
                    'Ne déduis pas une compétence qui n’est pas écrite. Normalise seulement les variantes évidentes comme HTML5 vers HTML, CSS3 vers CSS et JS vers JavaScript.',
                    'Retourne exactement ce format : {"skills":[],"experiences":[{"company":"","role":"","description":"","skills":[]}],"projects":[{"title":"","description":"","skills":[]}]}.',
                    `Texte du CV : ${text.slice(0, 12000)}`,
                ].join('\n\n'),
            },
        ],
    });

    const parsed = parseJsonResponse(response.choices?.[0]?.message?.content);
    const skills = normalizeSkillList([
        ...cvSignals.skills,
        ...(Array.isArray(parsed.skills) ? parsed.skills : [])
            .filter((item) => typeof item === 'string')
            .filter((item) => skillAppearsInText(item, text))
    ]);
    const experiences = cvSignals.experiences.length > 0
        ? normalizeCvEntries(cvSignals.experiences, 'experience')
        : normalizeCvEntries(parsed.experiences, 'experience');
    const projects = cvSignals.projects.length > 0
        ? normalizeCvEntries(cvSignals.projects, 'project')
        : normalizeCvEntries(parsed.projects, 'project');

    if (skills.length === 0 && experiences.length === 0 && projects.length === 0) {
        return emptyCvAnalysis('no_information', 'Aucune compétence, expérience ou projet exploitable n’a été extrait du CV déposé.');
    }

    return {
        status: 'extracted',
        message: 'Les compétences et expériences ont été extraites du CV déposé.',
        skills,
        experiences,
        projects,
    };
};

const analyzeStudentCv = async (studentId) => {
    try {
        const document = await Document.findOne({ candidatId: studentId, type: 'CV' })
            .sort({ createdAt: -1 });

        if (!document) {
            return emptyCvAnalysis('not_found', 'Aucun CV n’a été déposé.');
        }

        if (!document.mimeType?.includes('pdf') && !document.nomOriginal?.toLowerCase().endsWith('.pdf')) {
            return emptyCvAnalysis('unsupported_format', 'Le CV déposé n’est pas au format PDF.');
        }

        const buffer = await readStoredDocument(document);
        const text = await extractPdfText(buffer);
        return await analyzeCvText(text);
    } catch (error) {
        logger.warn(`[AIRecommendationService] Lecture du CV impossible: ${error.message}`);
        return emptyCvAnalysis('not_readable', 'Le CV déposé n’a pas pu être lu ou analysé.');
    }
};

// ============================================
// EXTRACTION DES COMPÉTENCES
// ============================================

/**
 * Extraire les compétences d'un étudiant depuis son profil
 */
const extractStudentSkills = (student) => {
    const skills = new Set();

    const addSkill = (value) => {
        if (typeof value === 'string' && value.trim()) {
            skills.add(canonicalSkill(value));
        }
    };
    
    // Compétences explicites
    if (student.competences && Array.isArray(student.competences)) {
        student.competences.forEach(comp => {
            addSkill(comp.nom);
        });
    }
    
    // Compétences depuis les expériences
    if (student.experiences && Array.isArray(student.experiences)) {
        student.experiences.forEach(exp => {
            if (exp.competences && Array.isArray(exp.competences)) {
                exp.competences.forEach(skill => addSkill(skill.nom || skill));
            }
        });
    }
    
    // Compétences depuis les projets
    if (student.projets && Array.isArray(student.projets)) {
        student.projets.forEach(projet => {
            if (projet.technologies && Array.isArray(projet.technologies)) {
                projet.technologies.forEach(skill => addSkill(skill.nom || skill));
            }
        });
    }

    // Le profil existant ne contient pas toujours une liste de compétences.
    // La filière et le niveau restent des signaux utiles pour le classement.
    addSkill(student.filiere);
    addSkill(student.niveau);
    
    return Array.from(skills);
};

/**
 * Extraire les compétences d'une offre
 */
const extractOfferSkills = (offer) => {
    const skills = new Set();

    const addSkill = (value) => {
        if (typeof value === 'string' && value.trim()) {
            skills.add(canonicalSkill(value));
        }
    };
    
    // Compétences requises
    if (offer.competences && Array.isArray(offer.competences)) {
        offer.competences.forEach(comp => {
            addSkill(comp.nom);
        });
    }

    // Les compétences des offres sont stockées dans leurs sujets.
    (offer.sujets || []).forEach(subject => {
        addSkill(subject.titre);
        addSkill(subject.profilRecherche);
        (subject.missions || []).forEach(mission => addSkill(mission));
        (subject.competences || []).forEach(competence => addSkill(competence.nom));
    });
    
    // Extraire du titre et de la description
    const text = `${offer.titre || ''} ${offer.description || ''}`.toLowerCase();
    const commonSkills = [
        'python', 'javascript', 'react', 'node.js', 'mongodb', 'sql', 
        'docker', 'kubernetes', 'aws', 'azure', 'git', 'linux',
        'java', 'c++', 'php', 'laravel', 'spring', 'angular',
        'vue.js', 'typescript', 'postgresql', 'mysql', 'redis',
        'elasticsearch', 'kafka', 'rabbitmq', 'jenkins', 'ansible',
        'terraform', 'prometheus', 'grafana', 'nginx', 'apache',
        'sécurité', 'réseau', 'devops', 'data science', 'machine learning',
        'ia', 'cloud', 'fullstack', 'frontend', 'backend', 'mobile',
        'flutter', 'react native', 'swift', 'kotlin', 'go', 'rust'
    ];
    
    commonSkills.forEach(skill => {
        if (text.includes(skill)) {
            addSkill(skill);
        }
    });
    
    return Array.from(skills);
};

// ============================================
// CALCUL DU SCORE DE MATCH
// ============================================

/**
 * Calculer le score de compatibilité entre étudiant et offre
 */
const calculateMatchScore = (studentSkills, offerSkills, student, offer) => {
    if (studentSkills.length === 0 || offerSkills.length === 0) {
        return 0;
    }
    
    const studentSkillsSet = new Set(studentSkills.map(s => s.toLowerCase()));
    const offerSkillsSet = new Set(offerSkills.map(s => s.toLowerCase()));
    
    // Compétences communes
    const commonSkills = [...studentSkillsSet].filter(studentSkill =>
        [...offerSkillsSet].some(offerSkill => skillMatches(studentSkill, offerSkill))
    );
    const commonCount = commonSkills.length;
    
    // Compétences manquantes de l'offre
    const missingSkills = [...offerSkillsSet].filter(offerSkill =>
        ![...studentSkillsSet].some(studentSkill => skillMatches(studentSkill, offerSkill))
    );
    
    // Score basé sur les compétences communes (poids principal)
    const skillScore = offerSkillsSet.size > 0 ? commonCount / offerSkillsSet.size : 0;
    
    // Bonus pour la filière
    let filiereBonus = 0;
    if (student.filiere && offer.typeStage) {
        const filiereMap = {
            'informatique': ['PFE', 'PFA', 'Stage'],
            'réseaux': ['PFE', 'Stage'],
            'sécurité': ['PFE', 'Stage'],
            'data': ['PFE', 'PFA'],
            'génie logiciel': ['PFE', 'PFA'],
        };
        const matchingTypes = filiereMap[student.filiere.toLowerCase()] || [];
        if (matchingTypes.includes(offer.typeStage)) {
            filiereBonus = 0.1;
        }
    }
    
    // Bonus pour le niveau d'étude
    let niveauBonus = 0;
    if (student.niveau) {
        const niveauMap = {
            'master': ['PFE', 'Stage'],
            'licence': ['PFA', 'Stage'],
            'ingenieur': ['PFE', 'Stage'],
        };
        const matchingNiveaux = niveauMap[student.niveau.toLowerCase()] || [];
        if (matchingNiveaux.includes(offer.typeStage)) {
            niveauBonus = 0.05;
        }
    }
    
    // Pénalité pour trop de compétences manquantes
    let missingPenalty = 0;
    if (missingSkills.length > 3) {
        missingPenalty = 0.1 * Math.min(missingSkills.length - 3, 5) / 5;
    }
    
    // Score final
    let finalScore = skillScore + filiereBonus + niveauBonus - missingPenalty;
    
    // Normalisation entre 0 et 1
    finalScore = Math.max(0, Math.min(1, finalScore));
    
    return Math.round(finalScore * 100);
};

// ============================================
// GÉNÉRATION D'EXPLICATIONS
// ============================================

/**
 * Générer des explications pour le score
 */
const generateExplanations = (studentSkills, offerSkills, commonSkills, missingSkills, score) => {
    const explanations = [];
    const positive = [];
    const negative = [];
    
    if (commonSkills.length > 0) {
        positive.push(`Vous maîtrisez ${commonSkills.length} compétence${commonSkills.length > 1 ? 's' : ''} clé${commonSkills.length > 1 ? 's' : ''} : ${commonSkills.slice(0, 5).join(', ')}${commonSkills.length > 5 ? ` et ${commonSkills.length - 5} autre(s)` : ''}`);
    }
    
    if (missingSkills.length > 0) {
        const topMissing = missingSkills.slice(0, 3);
        negative.push(`Il manque ${topMissing.length} compétence${topMissing.length > 1 ? 's' : ''} : ${topMissing.join(', ')}${missingSkills.length > 3 ? ` et ${missingSkills.length - 3} autre(s)` : ''}`);
    }
    
    if (score >= 80) {
        explanations.push('Votre profil correspond parfaitement aux attentes de cette offre.');
    } else if (score >= 60) {
        explanations.push('Votre profil est solide. Quelques compétences supplémentaires pourraient renforcer votre candidature.');
    } else if (score >= 40) {
        explanations.push('Votre profil présente des bases intéressantes. Une mise à niveau sur les compétences clés serait bénéfique.');
    } else {
        explanations.push('Votre profil pourrait être renforcé pour correspondre davantage à cette offre.');
    }
    
    return {
        positive,
        negative,
        summary: explanations[0] || '',
    };
};

const buildOfferContext = (offer) => ({
    id: offer._id.toString(),
    titre: offer.titre,
    description: offer.description,
    typeStage: offer.typeStage,
    departement: offer.departementId?.nom || 'Non spécifié',
    sujets: (offer.sujets || []).map((subject) => ({
        titre: subject.titre,
        description: subject.description,
        missions: subject.missions || [],
        profilRecherche: subject.profilRecherche,
        competences: (subject.competences || []).map((competence) => competence.nom),
    })),
});

const buildStudentSemanticText = (student, studentSkills, cvAnalysis) => [
    `Filière : ${student.filiere || ''}`,
    `Niveau : ${student.niveau || ''}`,
    `Compétences : ${studentSkills.join(', ')}`,
    `Expériences : ${(cvAnalysis?.experiences || []).map((entry) => entry.description || entry.title || '').join('. ')}`,
    `Projets : ${(cvAnalysis?.projects || []).map((entry) => entry.description || entry.title || '').join('. ')}`,
].join('\n');

const buildOfferSemanticText = (offer, offerSkills) => [
    `Offre : ${offer.titre || ''}`,
    `Description : ${offer.description || ''}`,
    `Type : ${offer.typeStage || ''}`,
    `Compétences : ${offerSkills.join(', ')}`,
    ...(offer.sujets || []).flatMap((subject) => [
        subject.titre || '',
        subject.description || '',
        ...(subject.missions || []),
        subject.profilRecherche || '',
    ]),
].join('\n');

const calculateSemanticScores = async (student, studentSkills, cvAnalysis, offers) => {
    try {
        const studentVector = await embedText(buildStudentSemanticText(student, studentSkills, cvAnalysis));
        const offerVectors = await Promise.all(offers.map(async (offer) => {
            const offerSkills = extractOfferSkills(offer);
            const vector = await embedText(buildOfferSemanticText(offer, offerSkills));
            return [offer._id.toString(), cosineSimilarity(studentVector, vector)];
        }));
        return new Map(offerVectors);
    } catch (error) {
        logger.warn(`[AIRecommendationService] Embeddings indisponibles, score explicite utilisé: ${error.message}`);
        return null;
    }
};

const requestOpenAIRecommendations = async (student, studentSkills, cvAnalysis, offers, limit) => {
    const aiClient = getAIClient();
    if (!aiClient || offers.length === 0) {
        return null;
    }

    const input = [
        'Tu es un conseiller expert en stages universitaires.',
        'Analyse le profil et les offres ci-dessous.',
        `Retourne au maximum ${limit} offres, uniquement parmi les identifiants fournis.`,
        'Le score doit être un entier entre 0 et 100.',
        'Classe les offres par pertinence décroissante.',
        'Les explications doivent être en français, courtes et concrètes.',
        'Réponds uniquement avec un objet JSON valide au format {"recommendations":[{"offerId":"...","score":0,"matchingSkills":[],"missingSkills":[],"explanation":"..."}]}. N utilise pas de bloc markdown.',
        JSON.stringify({
            profil: {
                filiere: student.filiere || null,
                niveau: student.niveau || null,
                universite: student.universite || null,
                competences: studentSkills,
                experiencesCv: cvAnalysis?.experiences || [],
                projetsCv: cvAnalysis?.projects || [],
            },
            offres: offers.map(buildOfferContext),
        }),
    ].join('\n\n');

    const response = await aiClient.chat.completions.create({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: 'Tu es un conseiller expert en stages universitaires. Réponds uniquement avec un objet JSON valide, sans markdown ni texte avant ou après.',
            },
            { role: 'user', content: input },
        ],
    });

    const content = response.choices?.[0]?.message?.content || '{}';
    const normalizedContent = content
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
    const jsonStart = normalizedContent.indexOf('{');
    const jsonEnd = normalizedContent.lastIndexOf('}');
    const parsed = JSON.parse(
        jsonStart >= 0 && jsonEnd > jsonStart
            ? normalizedContent.slice(jsonStart, jsonEnd + 1)
            : normalizedContent
    );
    return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
};

// ============================================
// SERVICE PRINCIPAL
// ============================================

class AIRecommendationService {
    
    /**
     * Recommander des offres pour un étudiant
     */
    static async recommendOffers(studentId, limit = MAX_RECOMMENDATIONS) {
        try {
            // 1. Récupérer l'étudiant
            const student = await UtilisateurExterne.findById(studentId);
            if (!student) {
                throw new Error('Étudiant non trouvé');
            }
            
            // 2. Récupérer les candidatures de l'étudiant (pour éviter de recommander déjà postulé)
            const applications = await Application.find({ 
                etudiantId: studentId 
            }).select('offreId');
            const appliedOfferIds = applications.map(app => app.offreId.toString());
            
            // 3. Récupérer les offres actives
            const offers = await Offer.find({
                statut: 'Publiee',
                dateLimiteCandidature: { $gt: new Date() }
            }).populate('departementId', 'nom');
            
            // 4. Extraire les compétences de l'étudiant
            const cvAnalysis = await analyzeStudentCv(studentId);
            const studentSkills = Array.from(new Set([
                ...extractStudentSkills(student),
                ...cvAnalysis.skills.map(normalizeSkill),
                ...extractCvEntrySkills(cvAnalysis),
            ]));
            const semanticScores = await calculateSemanticScores(
                student,
                studentSkills,
                cvAnalysis,
                offers
            );
            
            // 5. Calculer le score pour chaque offre
            const scoredOffers = offers.map(offer => {
                const offerSkills = extractOfferSkills(offer);
                const explicitScore = calculateMatchScore(studentSkills, offerSkills, student, offer);
                const semanticScore = semanticScores?.get(offer._id.toString());
                const score = semanticScore === undefined
                    ? explicitScore
                    : Math.round((semanticScore * 70) + (explicitScore * 0.3));
                const commonSkills = studentSkills.filter(s =>
                    offerSkills.some(os => skillMatches(s, os))
                );
                const missingSkills = offerSkills.filter(s =>
                    !studentSkills.some(st => skillMatches(st, s))
                );
                const explanations = generateExplanations(
                    studentSkills,
                    offerSkills,
                    commonSkills,
                    missingSkills,
                    score
                );
                
                const alreadyApplied = appliedOfferIds.includes(offer._id.toString());
                
                return {
                    offer: {
                        _id: offer._id,
                        titre: offer.titre,
                        description: offer.description,
                        typeStage: offer.typeStage,
                        departementId: offer.departementId?._id || offer.departementId,
                        departement: offer.departementId?.nom || 'Non spécifié',
                        nbPostes: offer.nbPostes,
                        dateLimiteCandidature: offer.dateLimiteCandidature,
                        dateDebut: offer.dateDebut,
                        dateFin: offer.dateFin,
                    },
                    score,
                    semanticScore: semanticScore === undefined ? null : Math.round(semanticScore * 100),
                    commonSkills: commonSkills.slice(0, 8),
                    missingSkills: missingSkills.slice(0, 8),
                    explanations,
                    alreadyApplied,
                };
            });
            
            // 6. Classement local de secours
            const localRecommendations = scoredOffers
                .filter(item => item.score >= SIMILARITY_THRESHOLD * 100)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            let validOffers = localRecommendations;

            // 7. Reranking sémantique avec OpenAI lorsque la clé est configurée
            if (getAIClient()) {
                try {
                    const aiRecommendations = await requestOpenAIRecommendations(
                        student,
                        studentSkills,
                        cvAnalysis,
                        offers,
                        limit
                    );
                    const scoredById = new Map(
                        scoredOffers.map(item => [item.offer._id.toString(), item])
                    );

                    const aiResults = (aiRecommendations || [])
                        .map(recommendation => {
                            const localItem = scoredById.get(String(recommendation.offerId));
                            if (!localItem) return null;

                            const score = Math.max(0, Math.min(100, Number(recommendation.score) || 0));
                            const matchingSkills = Array.from(new Set([
                                ...localItem.commonSkills,
                                ...studentSkills.filter((studentSkill) =>
                                (recommendation.matchingSkills || []).some((aiSkill) =>
                                    skillMatches(studentSkill, aiSkill)
                                )
                                ),
                            ]));
                            const missingSkills = (recommendation.missingSkills || []).filter((aiSkill) =>
                                !studentSkills.some((studentSkill) => skillMatches(studentSkill, aiSkill))
                            );

                            return {
                                ...localItem,
                                score,
                                commonSkills: matchingSkills.slice(0, 8),
                                missingSkills: missingSkills.slice(0, 8),
                                explanations: {
                                    positive: matchingSkills.length
                                        ? [`Compétences correspondantes : ${matchingSkills.slice(0, 5).join(', ')}`]
                                        : [],
                                    negative: missingSkills.length
                                        ? [`Compétences à renforcer : ${missingSkills.slice(0, 5).join(', ')}`]
                                        : [],
                                    summary: recommendation.explanation,
                                },
                            };
                        })
                        .filter(Boolean)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, limit);

                    if (aiResults.length > 0) {
                        validOffers = aiResults;
                    }
                } catch (error) {
                    logger.warn(`[AIRecommendationService] Service IA indisponible, classement local utilisé: ${error.message}`);
                }
            }
            
            return {
                success: true,
                data: validOffers,
                total: validOffers.length,
                studentSkills: studentSkills.slice(0, 20),
                cvAnalysis,
            };
            
        } catch (error) {
            logger.error(`[AIRecommendationService] Erreur: ${error.message}`);
            return {
                success: false,
                error: error.message,
                data: [],
                total: 0,
            };
        }
    }
    
    /**
     * Analyser le profil de l'étudiant
     */
    static async analyzeProfile(studentId) {
        try {
            const student = await UtilisateurExterne.findById(studentId);
            if (!student) {
                throw new Error('Étudiant non trouvé');
            }
            
            const cvAnalysis = await analyzeStudentCv(studentId);
            const skills = Array.from(new Set([
                ...extractStudentSkills(student),
                ...cvAnalysis.skills.map(normalizeSkill),
                ...extractCvEntrySkills(cvAnalysis),
            ]));
            const applications = await Application.find({ etudiantId: studentId });
            
            return {
                success: true,
                data: {
                    skills: skills.slice(0, 30),
                    skillCount: skills.length,
                    applicationCount: applications.length,
                    acceptedCount: applications.filter(a => a.statut === 'Acceptee').length,
                    hasProfile: !!student.filiere || !!student.universite,
                    cvAnalysis,
                },
            };
            
        } catch (error) {
            logger.error(`[AIRecommendationService] Analyse échouée: ${error.message}`);
            return {
                success: false,
                error: error.message,
                data: null,
            };
        }
    }
}

module.exports = AIRecommendationService;