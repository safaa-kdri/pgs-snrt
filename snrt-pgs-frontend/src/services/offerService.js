// src/services/offerService.js
import api from './api';

// ============================================
// DONNÉES MOCKÉES (en attendant Badr)
// ============================================

const mockOffers = [
    {
        _id: '1',
        titre: 'Stage Développeur Full Stack React/Node.js',
        description: "Développement d'applications web modernes avec React et Node.js. Participation à la conception et au déploiement d'une plateforme de gestion interne.",
        typeStage: 'PFE',
        nbPostes: 2,
        statut: 'Publiée',
        dateDebut: '2026-09-01',
        dateFin: '2026-12-31',
        dateLimiteCandidature: '2026-08-15',
        departementId: { _id: 'd1', nom: 'IT' },
        createurId: { _id: 'u1', nom: 'EL KADOURI', prenom: 'Safaa' },
        sujets: [
            { 
                titre: 'Dashboard interactif', 
                description: 'Création d’un tableau de bord avec des métriques en temps réel.',
                missions: ['Conception des interfaces', 'Intégration des API', 'Optimisation des performances'],
                profilRecherche: 'Bac+5 en informatique, maîtrise de React et Node.js'
            }
        ],
        documentsRequis: [
            { type: 'CV', obligatoire: true }, 
            { type: 'Lettre de motivation', obligatoire: true }
        ]
    },
    {
        _id: '2',
        titre: 'Stage en Audiovisuel - Production et Montage',
        description: 'Production et montage vidéo pour les émissions de la SNRT. Participation aux tournages et à la post-production.',
        typeStage: 'Initiation',
        nbPostes: 1,
        statut: 'Publiée',
        dateDebut: '2026-10-01',
        dateFin: '2026-11-30',
        dateLimiteCandidature: '2026-09-15',
        departementId: { _id: 'd2', nom: 'Audiovisuel' },
        createurId: { _id: 'u2', nom: 'NAHAL', prenom: 'Aya' },
        sujets: [
            { 
                titre: 'Montage vidéo', 
                description: 'Montage des épisodes pour les programmes jeunesse.',
                missions: ['Montage des rushes', 'Étalonnage', 'Gestion des archives'],
                profilRecherche: 'Étudiant en audiovisuel, maîtrise de Premiere Pro'
            }
        ],
        documentsRequis: [
            { type: 'CV', obligatoire: true }, 
            { type: 'Portfolio', obligatoire: false }
        ]
    },
    {
        _id: '3',
        titre: 'Stage en Communication et Réseaux Sociaux',
        description: 'Gestion des réseaux sociaux et création de contenu pour la communication interne et externe de la SNRT.',
        typeStage: 'Ete',
        nbPostes: 3,
        statut: 'Publiée',
        dateDebut: '2026-07-01',
        dateFin: '2026-08-31',
        dateLimiteCandidature: '2026-06-15',
        departementId: { _id: 'd3', nom: 'Communication' },
        createurId: { _id: 'u3', nom: 'HOUARTI', prenom: 'Badr' },
        sujets: [
            { 
                titre: 'Stratégie digitale', 
                description: 'Élaboration d’une stratégie pour les réseaux sociaux.',
                missions: ['Création de contenu', 'Community management', 'Analyse des performances'],
                profilRecherche: 'Bac+3 en communication, bonne connaissance des réseaux sociaux'
            }
        ],
        documentsRequis: [
            { type: 'CV', obligatoire: true }, 
            { type: 'Lettre de motivation', obligatoire: true },
            { type: 'Portfolio', obligatoire: false }
        ]
    },
    {
        _id: '4',
        titre: 'Stage en Gestion de Projet IT',
        description: 'Assistance à la gestion des projets IT, coordination des équipes de développement, suivi des plannings et des budgets.',
        typeStage: 'PFA',
        nbPostes: 1,
        statut: 'Publiée',
        dateDebut: '2026-11-01',
        dateFin: '2027-01-31',
        dateLimiteCandidature: '2026-10-15',
        departementId: { _id: 'd1', nom: 'IT' },
        createurId: { _id: 'u4', nom: 'AROUI', prenom: 'Mohammed' },
        sujets: [
            { 
                titre: 'Gestion de projet', 
                description: 'Coordination des équipes de développement.',
                missions: ['Planification des sprints', 'Suivi des deadlines', 'Reporting'],
                profilRecherche: 'Bac+5 en gestion de projet, connaissance de la méthode agile'
            }
        ],
        documentsRequis: [
            { type: 'CV', obligatoire: true }, 
            { type: 'Lettre de motivation', obligatoire: true }
        ]
    }
];

// ============================================
// SERVICE
// ============================================

export const offerService = {
    // Récupérer les offres (mock)
    getOffers: async (params = {}) => {
        console.log('🔵 [MOCK] getOffers:', params);
        await new Promise(resolve => setTimeout(resolve, 600));

        let filtered = [...mockOffers];

        if (params.statut) {
            filtered = filtered.filter(o => o.statut === params.statut);
        }
        if (params.typeStage) {
            filtered = filtered.filter(o => o.typeStage === params.typeStage);
        }
        if (params.departementId) {
            filtered = filtered.filter(o => o.departementId._id === params.departementId);
        }
        if (params.search) {
            const s = params.search.toLowerCase();
            filtered = filtered.filter(o =>
                o.titre.toLowerCase().includes(s) ||
                o.description.toLowerCase().includes(s)
            );
        }

        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);

        return {
            success: true,
            offers: paginated,
            pagination: {
                page,
                limit,
                total: filtered.length,
                pages: Math.ceil(filtered.length / limit)
            }
        };
    },

    // Récupérer une offre par ID (mock)
    getOfferById: async (id) => {
        console.log('🔵 [MOCK] getOfferById:', id);
        await new Promise(resolve => setTimeout(resolve, 400));

        const offer = mockOffers.find(o => o._id === id);
        if (!offer) throw new Error('Offre non trouvée');
        return { success: true, offer };
    },

    // Récupérer les départements (mock)
    getDepartments: async () => {
        console.log('🔵 [MOCK] getDepartments');
        await new Promise(resolve => setTimeout(resolve, 300));

        return {
            departments: [
                { _id: 'd1', nom: 'IT' },
                { _id: 'd2', nom: 'Audiovisuel' },
                { _id: 'd3', nom: 'Communication' },
                { _id: 'd4', nom: 'Gestion' },
                { _id: 'd5', nom: 'Ressources Humaines' }
            ]
        };
    },

    // Récupérer les types (mock)
    getTypes: async () => {
        console.log('🔵 [MOCK] getTypes');
        await new Promise(resolve => setTimeout(resolve, 300));
        return ['PFE', 'PFA', 'Initiation', 'Ete', 'Master', 'Licence', 'Technicien'];
    }
};