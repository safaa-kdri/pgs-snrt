// seeders/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const argon2 = require("argon2");

const connectDB = require("../src/config/database");
const logger = require("../src/utils/logger");

// Import des modèles
const Role = require("../src/models/Role");
const UtilisateurInterne = require("../src/models/UtilisateurInterne");
const UtilisateurExterne = require("../src/models/UtilisateurExterne");
const Department = require("../src/models/Department");
const Period = require("../src/models/Period");
const Offer = require("../src/models/Offer");
const Skill = require("../src/models/Skill");
const Application = require("../src/models/Application");
const Internship = require("../src/models/Internship");
const Evaluation = require("../src/models/Evaluation");
const Notification = require("../src/models/Notification");
const Favorite = require("../src/models/Favorite");

// ============================================
// DONNÉES INITIALES
// ============================================

const initialData = {
  // 1. RÔLES
  roles: [
    {
      nom: "Administrateur",
      description: "Super-utilisateur avec tous les droits",
      permissions: ["*"],
      actif: true,
    },
    {
      nom: "RH",
      description: "Responsable des ressources humaines",
      permissions: [
        "valider_offres",
        "publier_offres",
        "gerer_candidatures",
        "planifier_entretiens",
        "gerer_stages",
      ],
      actif: true,
    },
    {
      nom: "Departement",
      description: "Responsable de département",
      permissions: [
        "creer_offres",
        "definir_sujets",
        "selectionner_candidats",
        "suivre_stagiaires",
      ],
      actif: true,
    },
    {
      nom: "Encadrant",
      description: "Tuteur de stage",
      permissions: [
        "suivre_stagiaires",
        "evaluer_stagiaires",
        "valider_rapports",
      ],
      actif: true,
    },
    {
      nom: "Etudiant",
      description: "Stagiaire potentiel",
      permissions: [
        "consulter_offres",
        "postuler",
        "suivre_candidatures",
        "gerer_favoris",
      ],
      actif: true,
    },
  ],

  // 2. COMPTES ADMIN
  admin: {
    nom: "EL KADOURI",
    prenom: "Safaa",
    email: "admin@snrt.ma",
    motDePasse: "SafaaAdmin@2026!SecurePassword",
    telephone: "0600000000",
    cin: "SA100001",
    actif: true,
  },

  // 3. COMPTES DE TEST (pour chaque rôle)
  users: {
    rh: {
      nom: "BENNANI",
      prenom: "Karim",
      email: "rh@snrt.ma",
      motDePasse: "RH@snrt2026!Secure",
      telephone: "0612345678",
      cin: "KB100002",
      actif: true,
    },
    department: {
      nom: "ALAOUI",
      prenom: "Fatima",
      email: "departement@snrt.ma",
      motDePasse: "Dept@snrt2026!Secure",
      telephone: "0687654321",
      cin: "AF100003",
      actif: true,
    },
    encadrant: {
      nom: "CHERKAOUI",
      prenom: "Mohamed",
      email: "encadrant@snrt.ma",
      motDePasse: "Enc@snrt2026!Secure",
      telephone: "0654321876",
      cin: "CM100004",
      actif: true,
    },
  },

  // 4. ÉTUDIANT DE TEST
  etudiant: {
    nom: "EL HASSANI",
    prenom: "Youssef",
    email: "etudiant@test.ma",
    motDePasse: "Etudiant2026!Secure",
    telephone: "0612345987",
    cin: "AB123456",
    civilite: "Mr",
    dateNaissance: new Date("2000-01-15"),
    adresse: "12 Rue Mohammed V, Rabat",
    ville: "Rabat",
    pays: "Maroc",
    universite: "Université Mohammed V",
    filiere: "Informatique",
    niveau: "Bac+5",
    annee: "2025-2026",
    actif: true,
    documents: [],
  },

  // 5. DÉPARTEMENTS
  departments: [
    {
      nom: "Direction des Systèmes d'Information",
      description: "DSI - Gestion des infrastructures et applications",
    },
    {
      nom: "Direction Technique",
      description: "Technique - Production et diffusion",
    },
    {
      nom: "Direction Marketing",
      description: "Marketing - Communication et promotion",
    },
    {
      nom: "Direction des Ressources Humaines",
      description: "DRH - Gestion du personnel",
    },
  ],

  // 6. PÉRIODES
  periods: [
    {
      nom: "Été 2026",
      dateDebut: new Date("2026-06-01"),
      dateFin: new Date("2026-08-31"),
      dateOuvertureCandidatures: new Date("2026-03-01"),
      dateFermetureCandidatures: new Date("2026-05-15"),
      actif: true,
    },
    {
      nom: "Hiver 2027",
      dateDebut: new Date("2027-01-01"),
      dateFin: new Date("2027-03-31"),
      dateOuvertureCandidatures: new Date("2026-10-01"),
      dateFermetureCandidatures: new Date("2026-11-15"),
      actif: true,
    },
  ],

  // 7. COMPÉTENCES
  skills: [
    {
      nom: "JavaScript",
      categorie: "Technique",
      description: "Développement web frontend/backend",
    },
    {
      nom: "React",
      categorie: "Technique",
      description: "Framework JavaScript",
    },
    {
      nom: "Node.js",
      categorie: "Technique",
      description: "Runtime JavaScript backend",
    },
    {
      nom: "MongoDB",
      categorie: "Technique",
      description: "Base de données NoSQL",
    },
    {
      nom: "Python",
      categorie: "Technique",
      description: "Langage de programmation",
    },
    {
      nom: "Anglais",
      categorie: "Langue",
      description: "Langue professionnelle",
    },
    { nom: "Français", categorie: "Langue", description: "Langue officielle" },
  ],

  // ============================================
  // 8. OFFRES SUPPLÉMENTAIRES
  // ============================================
  additionalOffers: [
    {
      titre: "Stage en Data Science",
      description: "Analyse de données, machine learning et intelligence artificielle appliqués aux données de la SNRT.",
      nbPostes: 1,
      typeStage: "PFA",
      statut: "Publiee",
      dateDebut: new Date("2026-09-01"),
      dateFin: new Date("2026-12-31"),
      dateLimiteCandidature: new Date("2026-08-15"),
      sujets: [
        {
          titre: "Analyse prédictive des audiences",
          description: "Développement de modèles de prédiction des audiences télévisuelles",
          missions: [
            "Collecte de données",
            "Nettoyage des données",
            "Modélisation",
            "Visualisation",
          ],
          profilRecherche: "Master en Data Science ou Statistiques",
          competences: [
            { nom: "Python", niveau: "Avance" },
            { nom: "MongoDB", niveau: "Intermediaire" },
            { nom: "Français", niveau: "Avance" },
          ],
        },
      ],
      documentsRequis: [
        { type: "CV", obligatoire: true },
        { type: "Lettre Motivation", obligatoire: true },
        { type: "Releve Notes", obligatoire: true },
        { type: "Portfolio", obligatoire: false },
      ],
    },
    {
      titre: "Stage en Communication Digitale",
      description: "Gestion des réseaux sociaux, création de contenu et stratégie de communication digitale.",
      nbPostes: 2,
      typeStage: "Initiation",
      statut: "Publiee",
      dateDebut: new Date("2026-07-01"),
      dateFin: new Date("2026-09-30"),
      dateLimiteCandidature: new Date("2026-06-15"),
      sujets: [
        {
          titre: "Stratégie de contenu pour les réseaux sociaux",
          description: "Élaboration d'une stratégie de contenu pour les plateformes sociales de la SNRT",
          missions: [
            "Audit des réseaux sociaux",
            "Planification éditoriale",
            "Création de contenu",
            "Analyse des performances",
          ],
          profilRecherche: "Étudiant en Communication ou Marketing Digital",
          competences: [
            { nom: "Anglais", niveau: "Intermediaire" },
            { nom: "Français", niveau: "Avance" },
          ],
        },
      ],
      documentsRequis: [
        { type: "CV", obligatoire: true },
        { type: "Lettre Motivation", obligatoire: true },
        { type: "Portfolio", obligatoire: true },
      ],
    },
    {
      titre: "Stage en Cybersécurité",
      description: "Sécurisation des infrastructures réseau et des applications web de la SNRT.",
      nbPostes: 2,
      typeStage: "PFE",
      statut: "Publiee",
      dateDebut: new Date("2026-06-15"),
      dateFin: new Date("2026-09-15"),
      dateLimiteCandidature: new Date("2026-05-30"),
      sujets: [
        {
          titre: "Audit de sécurité des applications web",
          description: "Réalisation d'un audit de sécurité complet des applications web de la SNRT",
          missions: [
            "Analyse des vulnérabilités",
            "Tests d'intrusion",
            "Rédaction de rapports de sécurité",
            "Proposition de correctifs",
          ],
          profilRecherche: "Master en Cybersécurité ou Informatique",
          competences: [
            { nom: "JavaScript", niveau: "Intermediaire" },
            { nom: "Python", niveau: "Avance" },
            { nom: "Anglais", niveau: "Intermediaire" },
          ],
        },
      ],
      documentsRequis: [
        { type: "CV", obligatoire: true },
        { type: "Lettre Motivation", obligatoire: true },
        { type: "Releve Notes", obligatoire: true },
        { type: "Certification", obligatoire: false },
      ],
    },
    {
      titre: "Stage en Marketing Digital",
      description: "Élaboration et mise en œuvre d'une stratégie marketing digitale pour la SNRT.",
      nbPostes: 1,
      typeStage: "Ete",
      statut: "Publiee",
      dateDebut: new Date("2026-07-01"),
      dateFin: new Date("2026-08-31"),
      dateLimiteCandidature: new Date("2026-06-01"),
      sujets: [
        {
          titre: "Campagne de communication sur les réseaux sociaux",
          description: "Création d'une campagne de communication pour promouvoir les stages SNRT",
          missions: [
            "Analyse de la cible",
            "Création de contenu",
            "Planification éditoriale",
            "Analyse des performances",
          ],
          profilRecherche: "Étudiant en Marketing ou Communication",
          competences: [
            { nom: "Français", niveau: "Avance" },
            { nom: "Anglais", niveau: "Intermediaire" },
          ],
        },
      ],
      documentsRequis: [
        { type: "CV", obligatoire: true },
        { type: "Lettre Motivation", obligatoire: true },
        { type: "Portfolio", obligatoire: true },
      ],
    },
    {
      titre: "Stage en DevOps",
      description: "Mise en place de pipelines CI/CD et automatisation des déploiements.",
      nbPostes: 1,
      typeStage: "PFA",
      statut: "Publiee",
      dateDebut: new Date("2026-09-01"),
      dateFin: new Date("2026-12-31"),
      dateLimiteCandidature: new Date("2026-08-01"),
      sujets: [
        {
          titre: "Automatisation des déploiements avec Docker et Kubernetes",
          description: "Mise en place d'une infrastructure de déploiement automatisée",
          missions: [
            "Dockerisation des applications",
            "Création de pipelines CI/CD",
            "Configuration de Kubernetes",
            "Monitoring et logging",
          ],
          profilRecherche: "Master en Informatique ou DevOps",
          competences: [
            { nom: "JavaScript", niveau: "Intermediaire" },
            { nom: "Python", niveau: "Intermediaire" },
            { nom: "MongoDB", niveau: "Intermediaire" },
            { nom: "Anglais", niveau: "Avance" },
          ],
        },
      ],
      documentsRequis: [
        { type: "CV", obligatoire: true },
        { type: "Lettre Motivation", obligatoire: true },
        { type: "Releve Notes", obligatoire: true },
      ],
    },
    // ✅ Offre EXPIRÉE - dateLimiteCandidature passée (SANS "(Expiré)" dans le titre)
    {
      titre: "Stage en Intelligence Artificielle",
      description: "Stage en IA - Offre avec délai de dépôt passé.",
      nbPostes: 2,
      typeStage: "PFE",
      statut: "Publiee",
      dateDebut: new Date("2026-01-01"),
      dateFin: new Date("2026-03-31"),
      dateLimiteCandidature: new Date("2025-12-15"), // ✅ Passée
      sujets: [
        {
          titre: "Modélisation NLP",
          description: "Développement de modèles NLP",
          missions: ["Data cleaning", "Modélisation", "Évaluation"],
          profilRecherche: "Master en Data Science",
          competences: [
            { nom: "Python", niveau: "Avance" },
            { nom: "Anglais", niveau: "Avance" },
          ],
        },
      ],
      documentsRequis: [
        { type: "CV", obligatoire: true },
        { type: "Lettre Motivation", obligatoire: true },
      ],
    },
    // ✅ Offre EXPIRÉE 2 (SANS "(Expiré)" dans le titre)
    {
      titre: "Stage en Réseaux",
      description: "Stage en réseaux - Offre avec délai de dépôt passé.",
      nbPostes: 1,
      typeStage: "Initiation",
      statut: "Publiee",
      dateDebut: new Date("2025-09-01"),
      dateFin: new Date("2025-12-31"),
      dateLimiteCandidature: new Date("2025-08-15"), // ✅ Passée
      sujets: [
        {
          titre: "Administration réseau",
          description: "Gestion des réseaux",
          missions: ["Configuration", "Monitoring", "Sécurité"],
          profilRecherche: "Licence en Réseaux",
          competences: [
            { nom: "Anglais", niveau: "Intermediaire" },
            { nom: "Français", niveau: "Avance" },
          ],
        },
      ],
      documentsRequis: [
        { type: "CV", obligatoire: true },
        { type: "Lettre Motivation", obligatoire: true },
      ],
    },
  ],
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

async function findOrCreateRole(roleData) {
  let role = await Role.findOne({ nom: roleData.nom });
  if (!role) {
    role = await Role.create(roleData);
    logger.info(`✅ Rôle créé: ${role.nom}`);
  } else {
    logger.info(`⏭️ Rôle existant: ${role.nom}`);
  }
  return role;
}

async function findOrCreateSkill(skillData) {
  let skill = await Skill.findOne({ nom: skillData.nom });
  if (!skill) {
    skill = await Skill.create(skillData);
    logger.info(`✅ Compétence créée: ${skill.nom}`);
  } else {
    logger.info(`⏭️ Compétence existante: ${skill.nom}`);
  }
  return skill;
}

async function findOrCreateDepartment(deptData, responsableId) {
  let department = await Department.findOne({ nom: deptData.nom });
  if (!department) {
    department = await Department.create({
      ...deptData,
      responsableId: responsableId,
      actif: true,
      membres: [responsableId],
    });
    logger.info(`✅ Département créé: ${department.nom}`);
  } else {
    logger.info(`⏭️ Département existant: ${department.nom}`);
  }
  return department;
}

async function findOrCreatePeriod(periodData) {
  let period = await Period.findOne({ nom: periodData.nom });
  if (!period) {
    period = await Period.create(periodData);
    logger.info(`✅ Période créée: ${period.nom}`);
  } else {
    logger.info(`⏭️ Période existante: ${period.nom}`);
  }
  return period;
}

async function findOrCreateUserInternal(userData, roleId, departmentId = null) {
  let user = await UtilisateurInterne.findOne({ email: userData.email });
  if (!user) {
    const hashedPassword = await argon2.hash(userData.motDePasse, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
    user = await UtilisateurInterne.create({
      ...userData,
      motDePasse: hashedPassword,
      roleId: roleId,
      departementId: departmentId,
      dateInscription: new Date(),
      twoFactor: { codeHash: null, expiresAt: null },
      passwordReset: { tokenHash: null, expiresAt: null },
      security: { failedLoginAttempts: 0, lockUntil: null },
      derniereConnexion: null,
      refreshTokens: [],
      isDeleted: false,
    });
    logger.info(`✅ Utilisateur interne créé: ${user.email} (${userData.nom} ${userData.prenom})`);
  } else {
    logger.info(`⏭️ Utilisateur interne existant: ${user.email}`);
  }
  return user;
}

async function findOrCreateUserExternal(userData) {
  let user = await UtilisateurExterne.findOne({ email: userData.email });
  if (!user) {
    const hashedPassword = await argon2.hash(userData.motDePasse, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
    user = await UtilisateurExterne.create({
      ...userData,
      motDePasse: hashedPassword,
      dateInscription: new Date(),
      twoFactor: { codeHash: null, expiresAt: null },
      passwordReset: { tokenHash: null, expiresAt: null },
      security: { failedLoginAttempts: 0, lockUntil: null },
      derniereConnexion: null,
      refreshTokens: [],
      isDeleted: false,
    });
    logger.info(`✅ Étudiant créé: ${user.email} (${userData.nom} ${userData.prenom})`);
  } else {
    logger.info(`⏭️ Étudiant existant: ${user.email}`);
  }
  return user;
}

async function findOrCreateOffer(offerData, departementId, createurId, validateurId, periodeId) {
  // Vérifier si l'offre existe déjà par son titre
  let offer = await Offer.findOne({ 
    titre: offerData.titre,
    departementId: departementId
  });
  
  if (!offer) {
    offer = await Offer.create({
      ...offerData,
      departementId: departementId,
      createurId: createurId,
      validateurId: validateurId,
      periodeId: periodeId,
      datePublication: new Date(),
    });
    logger.info(`✅ Offre créée: ${offer.titre}`);
  } else {
    logger.info(`⏭️ Offre existante: ${offer.titre}`);
  }
  return offer;
}

// ✅ Fonction modifiée avec paramètre force
async function addResultToOffer(offerToUpdate, fileName, daysAgo = 0, publieParId, force = false) {
  if (!offerToUpdate) return null;
  
  // ✅ Si force = true, on supprime d'abord l'ancien résultat
  if (force) {
    offerToUpdate.documentsConcours = offerToUpdate.documentsConcours.filter(
      doc => doc.type !== 'ResultatConcours'
    );
  }
  
  // Vérifier si un résultat existe déjà (sauf si force = true)
  const hasResult = offerToUpdate.documentsConcours.some(
    doc => doc.type === 'ResultatConcours'
  );
  
  if (hasResult && !force) {
    logger.info(`⏭️ Résultat déjà existant pour: ${offerToUpdate.titre}`);
    return null;
  }
  
  const resultatDoc = {
    type: 'ResultatConcours',
    nomOriginal: fileName,
    nomStocke: `resultat_${offerToUpdate._id}_${Date.now()}.pdf`,
    chemin: `/uploads/concours/resultat_${offerToUpdate._id}.pdf`,
    url: `/uploads/concours/resultat_${offerToUpdate._id}.pdf`,
    mimeType: 'application/pdf',
    taille: Math.floor(100000 + Math.random() * 300000),
    datePublication: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    publieParId: publieParId,
  };

  offerToUpdate.documentsConcours.push(resultatDoc);
  await offerToUpdate.save();
  logger.info(`✅ Nouveau résultat ajouté à: ${offerToUpdate.titre}`);
  return offerToUpdate;
}

// ============================================
// FONCTION DE SEED PRINCIPALE
// ============================================

const seed = async () => {
  try {
    await connectDB();
    logger.info("🔍 Vérification des données existantes...");
    logger.info("=".repeat(60));

    // ============ 1. RÔLES ============
    logger.info("\n📋 Vérification des rôles...");
    const roles = {};
    for (const roleData of initialData.roles) {
      const role = await findOrCreateRole(roleData);
      roles[role.nom] = role;
    }

    // ============ 2. COMPÉTENCES ============
    logger.info("\n📋 Vérification des compétences...");
    const skills = [];
    for (const skillData of initialData.skills) {
      const skill = await findOrCreateSkill(skillData);
      skills.push(skill);
    }

    // ============ 3. ADMIN ============
    logger.info("\n📋 Vérification de l'administrateur...");
    const admin = await findOrCreateUserInternal(
      initialData.admin,
      roles["Administrateur"]._id
    );

    // ============ 4. AUTRES UTILISATEURS ============
    logger.info("\n📋 Vérification des utilisateurs...");
    
    const rh = await findOrCreateUserInternal(
      initialData.users.rh,
      roles["RH"]._id
    );

    const deptUser = await findOrCreateUserInternal(
      initialData.users.department,
      roles["Departement"]._id
    );

    const encadrant = await findOrCreateUserInternal(
      initialData.users.encadrant,
      roles["Encadrant"]._id
    );

    // ============ 5. DÉPARTEMENTS ============
    logger.info("\n📋 Vérification des départements...");
    const departments = [];
    for (const deptData of initialData.departments) {
      const department = await findOrCreateDepartment(deptData, deptUser._id);
      departments.push(department);
    }

    if (deptUser.departementId !== departments[0]._id) {
      await UtilisateurInterne.findByIdAndUpdate(deptUser._id, {
        departementId: departments[0]._id,
      });
      logger.info(`✅ Département assigné à ${deptUser.email}`);
    }

    // ============ 6. PÉRIODES ============
    logger.info("\n📋 Vérification des périodes...");
    const periods = [];
    for (const periodData of initialData.periods) {
      const period = await findOrCreatePeriod(periodData);
      periods.push(period);
    }

    // ============ 7. ÉTUDIANT ============
    logger.info("\n📋 Vérification de l'étudiant...");
    const etudiant = await findOrCreateUserExternal(initialData.etudiant);

    // ============ 8. OFFRE PRINCIPALE ============
    logger.info("\n📋 Vérification de l'offre principale...");
    const offer = await findOrCreateOffer(
      {
        titre: "Stage en Developpement Web",
        description: "Developpement d'applications web avec React et Node.js",
        nbPostes: 2,
        typeStage: "PFE",
        statut: "Publiee",
        datePublication: new Date(),
        dateDebut: new Date("2026-06-01"),
        dateFin: new Date("2026-08-31"),
        dateLimiteCandidature: new Date("2026-05-15"),
        sujets: [
          {
            titre: "Developpement d'une application de gestion",
            description: "Creer une application web fullstack",
            missions: ["Analyse des besoins", "Developpement", "Tests"],
            profilRecherche: "Etudiant en informatique",
            competences: [
              { nom: "JavaScript", niveau: "Avance" },
              { nom: "React", niveau: "Avance" },
              { nom: "Node.js", niveau: "Intermediaire" },
              { nom: "MongoDB", niveau: "Intermediaire" },
            ],
          },
        ],
        documentsRequis: [
          { type: "CV", obligatoire: true },
          { type: "Lettre Motivation", obligatoire: true },
          { type: "Releve Notes", obligatoire: true },
        ],
      },
      departments[0]._id,
      deptUser._id,
      rh._id,
      periods[0]._id
    );

    // ============ 9. OFFRES SUPPLÉMENTAIRES ============
    logger.info("\n📋 Vérification des offres supplémentaires...");
    const additionalOffers = [];
    for (const offerData of initialData.additionalOffers) {
      const newOffer = await findOrCreateOffer(
        offerData,
        departments[1]._id,
        deptUser._id,
        rh._id,
        periods[0]._id
      );
      additionalOffers.push(newOffer);
    }

    // ============================================
    // 🆕 10. RÉSULTATS DE CONCOURS - UNIQUEMENT 2 RÉSULTATS
    // ============================================
    logger.info("\n📋 Vérification des résultats de concours...");

    // Récupérer le RH pour l'assignation
    const rhUser = await UtilisateurInterne.findOne({ email: initialData.users.rh.email });
    if (!rhUser) {
      logger.error("❌ RH non trouvé !");
    } else {
      let resultsAdded = 0;

      // ✅ 1. Ajouter un résultat à l'offre "Stage en Developpement Web" (force = true)
      const result1 = await addResultToOffer(offer, 'Resultat_Stage_Developpement_Web.pdf', 7, rhUser._id, true);
      if (result1) resultsAdded++;

      // ✅ 2. Ajouter un résultat à l'offre "Stage en Communication Digitale" (force = true)
      const commOffer = await Offer.findOne({ 
        titre: "Stage en Communication Digitale",
        departementId: departments[1]._id
      });
      
      if (commOffer) {
        const result2 = await addResultToOffer(commOffer, 'Resultat_Communication_Digitale.pdf', 5, rhUser._id, true);
        if (result2) resultsAdded++;
      } else {
        logger.warn("⏭️ Offre 'Stage en Communication Digitale' non trouvée");
      }

      logger.info(`✅ ${resultsAdded} résultats ajoutés (Stage en Developpement Web + Stage en Communication Digitale)`);
    }

    // ============ 11. CANDIDATURE ============
    logger.info("\n📋 Vérification de la candidature...");
    let application = await Application.findOne({
      etudiantId: etudiant._id,
      offreId: offer._id
    });
    
    if (!application) {
      application = await Application.create({
        dateSoumission: new Date(),
        statut: "Soumise",
        commentaire: "Candidature pour le stage de developpement",
        etudiantId: etudiant._id,
        offreId: offer._id,
        traiteurId: rh._id,
        documents: [],
        historique: [
          {
            date: new Date(),
            ancienStatut: "Brouillon",
            nouveauStatut: "Soumise",
            commentaire: "Candidature soumise",
            auteurId: etudiant._id,
          },
        ],
      });
      logger.info(`✅ Candidature créée pour ${etudiant.email}`);
    } else {
      logger.info(`⏭️ Candidature existante pour ${etudiant.email}`);
    }

    // ============ 12. STAGE ============
    logger.info("\n📋 Vérification du stage...");
    let internship = await Internship.findOne({
      etudiantId: etudiant._id,
      offreId: offer._id
    });
    
    if (!internship && application) {
      internship = await Internship.create({
        dateDebut: new Date("2026-06-01"),
        dateFin: new Date("2026-08-31"),
        statut: "EnCours",
        etudiantId: etudiant._id,
        encadrantId: encadrant._id,
        offreId: offer._id,
        applicationId: application._id,
        livrables: [
          {
            nom: "Rapport_de_stage.pdf",
            type: "Rapport",
            chemin: "/uploads/rapports/rapport_test.pdf",
            dateDepot: new Date(),
            valide: false,
            commentaire: "",
          },
        ],
        remarquesEncadrant: [
          {
            date: new Date(),
            message: "Bienvenue dans l'equipe !",
            auteurId: encadrant._id,
          },
        ],
      });
      logger.info(`✅ Stage créé pour ${etudiant.email}`);
    } else if (internship) {
      logger.info(`⏭️ Stage existant pour ${etudiant.email}`);
    } else {
      logger.info(`⏭️ Stage non créé (candidature manquante)`);
    }

    // ============ 13. ÉVALUATION ============
    logger.info("\n📋 Vérification de l'évaluation...");
    let evaluation = null;
    if (internship) {
      evaluation = await Evaluation.findOne({ stageId: internship._id });
      if (!evaluation) {
        evaluation = await Evaluation.create({
          stageId: internship._id,
          stagiaireId: etudiant._id,
          encadrantId: encadrant._id,
          dateEvaluation: new Date(),
          note: 15,
          commentaires: "Excellent travail, bonne autonomie et grande capacite d'adaptation.",
          competencesEvaluees: [
            { nom: "JavaScript", niveau: "Avance", note: 4 },
            { nom: "React", niveau: "Avance", note: 4 },
            { nom: "Node.js", niveau: "Intermediaire", note: 3 },
            { nom: "MongoDB", niveau: "Intermediaire", note: 3 },
            { nom: "Anglais", niveau: "Intermediaire", note: 3 },
          ],
          criteres: {
            autonomie: 4,
            qualiteTravail: 5,
            respectDelais: 4,
            communication: 4,
            integration: 5,
            initiative: 4,
          },
          pointsForts: "Tres bonne maitrise technique, grande autonomie, excellent esprit d'equipe",
          pointsFaibles: "Peu d'experience en production, peut ameliorer la communication ecrite",
          recommandations: "Continuer a developper les competences en backend et DevOps",
          statut: "Validee",
          dateSoumission: new Date(),
          dateValidation: new Date(),
        });
        logger.info(`✅ Évaluation créée (note: ${evaluation.note}/20)`);
      } else {
        logger.info(`⏭️ Évaluation existante (note: ${evaluation.note}/20)`);
      }
    }

    // ============ 14. FAVORI ============
    logger.info("\n📋 Vérification du favori...");
    let favorite = await Favorite.findOne({
      etudiantId: etudiant._id,
      offreId: offer._id
    });
    
    if (!favorite) {
      favorite = await Favorite.create({
        etudiantId: etudiant._id,
        offreId: offer._id,
        dateAjout: new Date(),
        notes: "Offre tres interessante pour un stage en developpement",
      });
      logger.info(`✅ Favori créé pour ${etudiant.email}`);
    } else {
      logger.info(`⏭️ Favori existant pour ${etudiant.email}`);
    }

    // ============ 15. NOTIFICATION ============
    logger.info("\n📋 Vérification de la notification...");
    let notification = await Notification.findOne({
      userId: etudiant._id,
      type: "InApp",
      titre: "Candidature Soumise"
    });
    
    if (!notification && application) {
      notification = await Notification.create({
        type: "InApp",
        titre: "Candidature Soumise",
        message: `Votre candidature pour l'offre "${offer.titre}" a ete soumise avec succes.`,
        dateEnvoi: new Date(),
        lue: false,
        lien: `/applications/${application._id}`,
        userId: etudiant._id,
        userModel: "UtilisateurExterne",
      });
      logger.info(`✅ Notification créée pour ${etudiant.email}`);
    } else if (notification) {
      logger.info(`⏭️ Notification existante pour ${etudiant.email}`);
    } else {
      logger.info(`⏭️ Notification non créée (candidature manquante)`);
    }

    // ============ RÉCAPITULATIF ============
    logger.info("\n" + "=".repeat(60));
    logger.info("✅ SEED TERMINE AVEC SUCCES");
    logger.info("=".repeat(60));
    logger.info("📊 STATISTIQUES:");
    logger.info(`   ${await Role.countDocuments()} rôles`);
    logger.info(`   ${await UtilisateurInterne.countDocuments()} utilisateurs internes`);
    logger.info(`   ${await UtilisateurExterne.countDocuments()} utilisateurs externes`);
    logger.info(`   ${await Department.countDocuments()} départements`);
    logger.info(`   ${await Period.countDocuments()} périodes`);
    logger.info(`   ${await Skill.countDocuments()} compétences`);
    logger.info(`   ${await Offer.countDocuments()} offres`);
    logger.info(`   ${await Application.countDocuments()} candidatures`);
    logger.info(`   ${await Internship.countDocuments()} stages`);
    logger.info(`   ${await Evaluation.countDocuments()} évaluations`);
    logger.info(`   ${await Favorite.countDocuments()} favoris`);
    logger.info(`   ${await Notification.countDocuments()} notifications`);
    logger.info("=".repeat(60));

    // Informations de connexion
    logger.info("\n🔑 INFORMATIONS DE CONNEXION:");
    logger.info("");
    logger.info("ADMINISTRATEUR:");
    logger.info(`   Email: ${initialData.admin.email}`);
    logger.info(`   Mot de passe: ${initialData.admin.motDePasse}`);
    logger.info(`   CIN: ${initialData.admin.cin}`);
    logger.info("");
    logger.info("RESPONSABLE RH:");
    logger.info(`   Email: ${initialData.users.rh.email}`);
    logger.info(`   Mot de passe: ${initialData.users.rh.motDePasse}`);
    logger.info(`   CIN: ${initialData.users.rh.cin}`);
    logger.info("");
    logger.info("RESPONSABLE DEPARTEMENT:");
    logger.info(`   Email: ${initialData.users.department.email}`);
    logger.info(`   Mot de passe: ${initialData.users.department.motDePasse}`);
    logger.info(`   CIN: ${initialData.users.department.cin}`);
    logger.info("");
    logger.info("ENCADRANT:");
    logger.info(`   Email: ${initialData.users.encadrant.email}`);
    logger.info(`   Mot de passe: ${initialData.users.encadrant.motDePasse}`);
    logger.info(`   CIN: ${initialData.users.encadrant.cin}`);
    logger.info("");
    logger.info("ETUDIANT:");
    logger.info(`   Email: ${initialData.etudiant.email}`);
    logger.info(`   Mot de passe: ${initialData.etudiant.motDePasse}`);
    logger.info(`   CIN: ${initialData.etudiant.cin}`);
    logger.info("=".repeat(60));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Erreur lors du seed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
};

// Exécuter le seed
seed();