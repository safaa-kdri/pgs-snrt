// seeders/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const argon2 = require('argon2');

const connectDB = require('../src/config/database');
const logger = require('../src/utils/logger');

// Import des modèles
const Role = require('../src/models/Role');
const UtilisateurInterne = require('../src/models/UtilisateurInterne');
const UtilisateurExterne = require('../src/models/UtilisateurExterne');
const Department = require('../src/models/Department');
const Period = require('../src/models/Period');
const Offer = require('../src/models/Offer');
const Skill = require('../src/models/Skill');
const Application = require('../src/models/Application');
const Internship = require('../src/models/Internship');
const Evaluation = require('../src/models/Evaluation');
const Notification = require('../src/models/Notification');
const Favorite = require('../src/models/Favorite');

// ============================================
// DONNÉES INITIALES
// ============================================

const initialData = {
    // 1. RÔLES
    roles: [
        { nom: 'Administrateur', description: 'Super-utilisateur avec tous les droits', permissions: ['*'], actif: true },
        { nom: 'RH', description: 'Responsable des ressources humaines', permissions: ['valider_offres', 'publier_offres', 'gerer_candidatures', 'planifier_entretiens', 'gerer_stages'], actif: true },
        { nom: 'Departement', description: 'Responsable de département', permissions: ['creer_offres', 'definir_sujets', 'selectionner_candidats', 'suivre_stagiaires'], actif: true },
        { nom: 'Encadrant', description: 'Tuteur de stage', permissions: ['suivre_stagiaires', 'evaluer_stagiaires', 'valider_rapports'], actif: true },
        { nom: 'Etudiant', description: 'Stagiaire potentiel', permissions: ['consulter_offres', 'postuler', 'suivre_candidatures', 'gerer_favoris'], actif: true }
    ],

    // 2. COMPTES ADMIN
    admin: {
        nom: 'EL KADOURI',
        prenom: 'Safaa',
        email: 'admin@snrt.ma',
        motDePasse: 'SafaaAdmin@2026!SecurePassword',
        telephone: '0600000000',
        actif: true
    },

    // 3. COMPTES DE TEST (pour chaque rôle)
    users: {
        rh: {
            nom: 'BENNANI',
            prenom: 'Karim',
            email: 'rh@snrt.ma',
            motDePasse: 'RH@snrt2026!Secure',
            telephone: '0612345678',
            actif: true
        },
        department: {
            nom: 'ALAOUI',
            prenom: 'Fatima',
            email: 'departement@snrt.ma',
            motDePasse: 'Dept@snrt2026!Secure',
            telephone: '0687654321',
            actif: true
        },
        encadrant: {
            nom: 'CHERKAOUI',
            prenom: 'Mohamed',
            email: 'encadrant@snrt.ma',
            motDePasse: 'Enc@snrt2026!Secure',
            telephone: '0654321876',
            actif: true
        }
    },

    // 4. ÉTUDIANT DE TEST
    etudiant: {
        nom: 'EL HASSANI',
        prenom: 'Youssef',
        email: 'etudiant@test.ma',
        motDePasse: 'Etudiant2026!Secure',
        telephone: '0612345987',
        cin: 'AB123456',
        civilite: 'M.',
        dateNaissance: new Date('2000-01-15'),
        adresse: '12 Rue Mohammed V, Rabat',
        ville: 'Rabat',
        pays: 'Maroc',
        universite: 'Université Mohammed V',
        filiere: 'Informatique',
        niveau: 'Bac+5',
        annee: '2025-2026',
        actif: true
    },

    // 5. DÉPARTEMENTS
    departments: [
        { nom: 'Direction des Systèmes d\'Information', description: 'DSI - Gestion des infrastructures et applications' },
        { nom: 'Direction Technique', description: 'Technique - Production et diffusion' },
        { nom: 'Direction Marketing', description: 'Marketing - Communication et promotion' },
        { nom: 'Direction des Ressources Humaines', description: 'DRH - Gestion du personnel' }
    ],

    // 6. PÉRIODES
    periods: [
        {
            nom: 'Été 2026',
            dateDebut: new Date('2026-06-01'),
            dateFin: new Date('2026-08-31'),
            dateOuvertureCandidatures: new Date('2026-03-01'),
            dateFermetureCandidatures: new Date('2026-05-15'),
            actif: true
        },
        {
            nom: 'Hiver 2027',
            dateDebut: new Date('2027-01-01'),
            dateFin: new Date('2027-03-31'),
            dateOuvertureCandidatures: new Date('2026-10-01'),
            dateFermetureCandidatures: new Date('2026-11-15'),
            actif: true
        }
    ],

    // 7. COMPÉTENCES
    skills: [
        { nom: 'JavaScript', categorie: 'Technique', description: 'Développement web frontend/backend' },
        { nom: 'React', categorie: 'Technique', description: 'Framework JavaScript' },
        { nom: 'Node.js', categorie: 'Technique', description: 'Runtime JavaScript backend' },
        { nom: 'MongoDB', categorie: 'Technique', description: 'Base de données NoSQL' },
        { nom: 'Python', categorie: 'Technique', description: 'Langage de programmation' },
        { nom: 'Anglais', categorie: 'Langue', description: 'Langue professionnelle' },
        { nom: 'Français', categorie: 'Langue', description: 'Langue officielle' }
    ]
};

// ============================================
// FONCTION DE SEED
// ============================================

const seed = async () => {
    try {
        await connectDB();
        logger.info('🗑️ Nettoyage des collections...');

        // Nettoyer toutes les collections
        await Role.deleteMany({});
        await UtilisateurInterne.deleteMany({});
        await UtilisateurExterne.deleteMany({});
        await Department.deleteMany({});
        await Period.deleteMany({});
        await Offer.deleteMany({});
        await Skill.deleteMany({});
        await Application.deleteMany({});
        await Internship.deleteMany({});
        await Evaluation.deleteMany({});
        await Notification.deleteMany({});
        await Favorite.deleteMany({});

        logger.info('✅ Collections nettoyées');

        // ============ 1. RÔLES ============
        logger.info('📥 Insertion des rôles...');
        const roles = await Role.insertMany(initialData.roles);
        logger.info(`✅ ${roles.length} rôles créés`);

        const roleAdmin = roles.find(r => r.nom === 'Administrateur');
        const roleRH = roles.find(r => r.nom === 'RH');
        const roleDepartement = roles.find(r => r.nom === 'Departement');
        const roleEncadrant = roles.find(r => r.nom === 'Encadrant');
        const roleEtudiant = roles.find(r => r.nom === 'Etudiant');

        // ============ 2. COMPÉTENCES ============
        logger.info('📥 Insertion des compétences...');
        const skills = await Skill.insertMany(initialData.skills);
        logger.info(`✅ ${skills.length} compétences créées`);

        // ============ 3. ADMIN ============
        logger.info('👤 Création de l\'administrateur...');
        const adminPassword = await argon2.hash(initialData.admin.motDePasse, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });

        const admin = await UtilisateurInterne.create({
            ...initialData.admin,
            motDePasse: adminPassword,
            roleId: roleAdmin._id,
            dateInscription: new Date()
        });
        logger.info(`✅ Admin créé: ${admin.email}`);

        // ============ 4. AUTRES UTILISATEURS ============
        logger.info('👥 Création des utilisateurs...');

        // RH
        const rhPassword = await argon2.hash(initialData.users.rh.motDePasse, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
        const rh = await UtilisateurInterne.create({
            ...initialData.users.rh,
            motDePasse: rhPassword,
            roleId: roleRH._id,
            dateInscription: new Date()
        });
        logger.info(`✅ RH créé: ${rh.email}`);

        // Département
        const deptPassword = await argon2.hash(initialData.users.department.motDePasse, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
        const deptUser = await UtilisateurInterne.create({
            ...initialData.users.department,
            motDePasse: deptPassword,
            roleId: roleDepartement._id,
            dateInscription: new Date()
        });
        logger.info(`✅ Département créé: ${deptUser.email}`);

        // Encadrant
        const encPassword = await argon2.hash(initialData.users.encadrant.motDePasse, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
        const encadrant = await UtilisateurInterne.create({
            ...initialData.users.encadrant,
            motDePasse: encPassword,
            roleId: roleEncadrant._id,
            dateInscription: new Date()
        });
        logger.info(`✅ Encadrant créé: ${encadrant.email}`);

        // ============ 5. DÉPARTEMENTS ============
        logger.info('🏢 Création des départements...');
        const departments = [];
        for (const dept of initialData.departments) {
            const department = await Department.create({
                ...dept,
                responsableId: deptUser._id,
                actif: true
            });
            departments.push(department);
        }
        logger.info(`✅ ${departments.length} départements créés`);

        // Assigner le département au responsable
        await UtilisateurInterne.findByIdAndUpdate(deptUser._id, {
            departementId: departments[0]._id
        });

        // ============ 6. PÉRIODES ============
        logger.info('📅 Création des périodes...');
        const periods = await Period.insertMany(initialData.periods);
        logger.info(`✅ ${periods.length} périodes créées`);

        // ============ 7. ÉTUDIANT ============
        logger.info('🎓 Création de l\'étudiant...');
        const etudiantPassword = await argon2.hash(initialData.etudiant.motDePasse, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });

        const etudiant = await UtilisateurExterne.create({
            ...initialData.etudiant,
            motDePasse: etudiantPassword,
            dateInscription: new Date()
        });
        logger.info(`✅ Étudiant créé: ${etudiant.email}`);

        // ============ 8. OFFRE DE STAGE ============
        logger.info('📋 Création d\'une offre de test...');
        const offer = await Offer.create({
            titre: 'Stage en Développement Web',
            description: 'Développement d\'applications web avec React et Node.js',
            nbPostes: 2,
            typeStage: 'PFE',
            statut: 'Publiee',
            datePublication: new Date(),
            dateDebut: new Date('2026-06-01'),
            dateFin: new Date('2026-08-31'),
            dateLimiteCandidature: new Date('2026-05-15'),
            departementId: departments[0]._id,
            createurId: deptUser._id,
            validateurId: rh._id,
            periodeId: periods[0]._id,
            sujets: [{
                titre: 'Développement d\'une application de gestion',
                description: 'Créer une application web fullstack',
                missions: ['Analyse des besoins', 'Développement', 'Tests'],
                profilRecherche: 'Étudiant en informatique',
                competences: [
                    { nom: 'JavaScript', niveau: 'Avance' },
                    { nom: 'React', niveau: 'Avance' },
                    { nom: 'Node.js', niveau: 'Intermediaire' },
                    { nom: 'MongoDB', niveau: 'Intermediaire' }
                ]
            }],
            documentsRequis: [
                { type: 'CV', obligatoire: true },
                { type: 'Lettre Motivation', obligatoire: true },
                { type: 'Releve Notes', obligatoire: true }
            ]
        });
        logger.info(`✅ Offre créée: ${offer.titre}`);

        // ============ 9. CANDIDATURE ============
        logger.info('📄 Création d\'une candidature de test...');
        const application = await Application.create({
            dateSoumission: new Date(),
            statut: 'Soumise',
            commentaire: 'Candidature pour le stage de développement',
            etudiantId: etudiant._id,
            offreId: offer._id,
            traiteurId: rh._id,
            documents: [{
                nom: 'CV_Youssef_EL_HASSANI.pdf',
                type: 'CV',
                chemin: '/uploads/cv_youssef.pdf',
                dateUpload: new Date()
            }],
            historique: [{
                date: new Date(),
                ancienStatut: 'Brouillon',
                nouveauStatut: 'Soumise',
                commentaire: 'Candidature soumise',
                auteurId: etudiant._id
            }]
        });
        logger.info(`✅ Candidature créée`);

        // ============ 10. STAGE ============
        logger.info('📚 Création d\'un stage de test...');
        const internship = await Internship.create({
            dateDebut: new Date('2026-06-01'),
            dateFin: new Date('2026-08-31'),
            statut: 'EnCours',
            etudiantId: etudiant._id,
            encadrantId: encadrant._id,
            offreId: offer._id,
            applicationId: application._id,
            livrables: [{
                nom: 'Rapport_de_stage.pdf',
                type: 'Rapport',
                chemin: '/uploads/rapports/rapport_test.pdf',
                dateDepot: new Date(),
                valide: false,
                commentaire: ''
            }],
            remarquesEncadrant: [{
                date: new Date(),
                message: 'Bienvenue dans l\'équipe !',
                auteurId: encadrant._id
            }]
        });
        logger.info(`✅ Stage créé`);

        // ============ 11. ÉVALUATION ============
        logger.info('📝 Création d\'une évaluation de test...');
        const evaluation = await Evaluation.create({
            stageId: internship._id,
            stagiaireId: etudiant._id,
            encadrantId: encadrant._id,
            dateEvaluation: new Date(),
            note: 15,
            commentaires: 'Excellent travail, bonne autonomie et grande capacité d\'adaptation.',
            competencesEvaluees: [
                { nom: 'JavaScript', niveau: 'Avancé', note: 4 },
                { nom: 'React', niveau: 'Avancé', note: 4 },
                { nom: 'Node.js', niveau: 'Intermédiaire', note: 3 },
                { nom: 'MongoDB', niveau: 'Intermédiaire', note: 3 },
                { nom: 'Anglais', niveau: 'Intermédiaire', note: 3 }
            ],
            criteres: {
                autonomie: 4,
                qualiteTravail: 5,
                respectDelais: 4,
                communication: 4,
                integration: 5,
                initiative: 4
            },
            pointsForts: 'Très bonne maîtrise technique, grande autonomie, excellent esprit d\'équipe',
            pointsFaibles: 'Peu d\'expérience en production, peut améliorer la communication écrite',
            recommandations: 'Continuer à développer les compétences en backend et DevOps',
            statut: 'Validee',
            dateSoumission: new Date(),
            dateValidation: new Date()
        });
        logger.info(`✅ Évaluation créée (note: ${evaluation.note}/20)`);

        // ============ 12. FAVORI ============
        logger.info('⭐ Création d\'un favori...');
        await Favorite.create({
            etudiantId: etudiant._id,
            offreId: offer._id,
            dateAjout: new Date(),
            notes: 'Offre très intéressante pour un stage en développement'
        });
        logger.info(`✅ Favori créé`);

        // ============ 13. NOTIFICATION ============
        logger.info('🔔 Création d\'une notification de test...');
        await Notification.create({
            type: 'InApp',
            message: `Votre candidature pour l'offre "${offer.titre}" a été soumise avec succès.`,
            dateEnvoi: new Date(),
            lue: false,
            lien: `/applications/${application._id}`,
            userId: etudiant._id,
            userModel: 'UtilisateurExterne'
        });
        logger.info(`✅ Notification créée`);

        // ============ RÉCAPITULATIF ============
        logger.info('\n' + '='.repeat(60));
        logger.info('🎉 SEED TERMINÉ AVEC SUCCÈS !');
        logger.info('='.repeat(60));
        logger.info('📋 INFORMATIONS DE CONNEXION:');
        logger.info('');

        logger.info('👤 ADMINISTRATEUR:');
        logger.info(`   📧 Email: ${admin.email}`);
        logger.info(`   🔑 Mot de passe: ${initialData.admin.motDePasse}`);
        logger.info(`   👤 Rôle: ${roleAdmin.nom}`);
        logger.info('');

        logger.info('👤 RESPONSABLE RH:');
        logger.info(`   📧 Email: ${rh.email}`);
        logger.info(`   🔑 Mot de passe: ${initialData.users.rh.motDePasse}`);
        logger.info(`   👤 Rôle: ${roleRH.nom}`);
        logger.info('');

        logger.info('👤 RESPONSABLE DÉPARTEMENT:');
        logger.info(`   📧 Email: ${deptUser.email}`);
        logger.info(`   🔑 Mot de passe: ${initialData.users.department.motDePasse}`);
        logger.info(`   👤 Rôle: ${roleDepartement.nom}`);
        logger.info('');

        logger.info('👤 ENCADRANT:');
        logger.info(`   📧 Email: ${encadrant.email}`);
        logger.info(`   🔑 Mot de passe: ${initialData.users.encadrant.motDePasse}`);
        logger.info(`   👤 Rôle: ${roleEncadrant.nom}`);
        logger.info('');

        logger.info('👤 ÉTUDIANT:');
        logger.info(`   📧 Email: ${etudiant.email}`);
        logger.info(`   🔑 Mot de passe: ${initialData.etudiant.motDePasse}`);
        logger.info(`   👤 Rôle: ${roleEtudiant.nom}`);
        logger.info('');

        logger.info('='.repeat(60));
        logger.info('📊 STATISTIQUES:');
        logger.info(`   🏢 ${departments.length} départements`);
        logger.info(`   📅 ${periods.length} périodes`);
        logger.info(`   📋 ${skills.length} compétences`);
        logger.info(`   📄 1 offre de test`);
        logger.info(`   📝 1 candidature`);
        logger.info(`   📚 1 stage`);
        logger.info(`   📊 1 évaluation (note: ${evaluation.note}/20)`);
        logger.info(`   ⭐ 1 favori`);
        logger.info(`   🔔 1 notification`);
        logger.info('='.repeat(60));

        process.exit(0);
    } catch (error) {
        logger.error(`❌ Erreur lors du seed: ${error.message}`);
        logger.error(error.stack);
        process.exit(1);
    }
};

// Exécuter le seed
seed();