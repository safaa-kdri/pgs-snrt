// seeders/seed.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const argon2 = require('argon2');

const connectDB = require('../src/config/database');
const logger = require('../src/utils/logger');
const Role = require('../src/models/Role');
const UtilisateurInterne = require('../src/models/UtilisateurInterne');

const initialData = {
    roles: [
        { nom: 'Administrateur', description: 'Super-utilisateur avec tous les droits', permissions: ['*'], actif: true },
        { nom: 'RH', description: 'Responsable des ressources humaines', permissions: ['valider_offres', 'publier_offres', 'gerer_candidatures', 'planifier_entretiens', 'gerer_stages'], actif: true },
        { nom: 'Departement', description: 'Responsable de département', permissions: ['creer_offres', 'definir_sujets', 'selectionner_candidats', 'suivre_stagiaires'], actif: true },
        { nom: 'Encadrant', description: 'Tuteur de stage', permissions: ['suivre_stagiaires', 'evaluer_stagiaires', 'valider_rapports'], actif: true },
        { nom: 'Etudiant', description: 'Stagiaire potentiel', permissions: ['consulter_offres', 'postuler', 'suivre_candidatures', 'gerer_favoris'], actif: true }
    ],
    admin: {
        nom: 'EL KADOURI',
        prenom: 'Safaa',
        email: 'admin@snrt.ma',
        motDePasse: 'SafaaAdmin@2026!SecurePassword',
        telephone: '0600000000',
        actif: true
    }
};

const seed = async () => {
    try {
        await connectDB();
        logger.info('🗑️ Nettoyage des collections...');

        await Role.deleteMany({});
        await UtilisateurInterne.deleteMany({});
        logger.info('✅ Collections nettoyées');

        logger.info('📥 Insertion des rôles...');
        const roles = await Role.insertMany(initialData.roles);
        logger.info(`✅ ${roles.length} rôles créés`);

        const adminRole = roles.find(r => r.nom === 'Administrateur');

        const hashedPassword = await argon2.hash(initialData.admin.motDePasse, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });

        const admin = await UtilisateurInterne.create({
            ...initialData.admin,
            motDePasse: hashedPassword,
            roleId: adminRole._id,
            dateInscription: new Date(),
            twoFactorEnabled: false,
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLogin: null
        });

        logger.info('🎉 SEED TERMINÉ AVEC SUCCÈS !');
        logger.info('📋 INFORMATIONS DE CONNEXION:');
        logger.info(`   📧 Email: ${admin.email}`);
        logger.info(`   🔑 Mot de passe: ${initialData.admin.motDePasse}`);
        logger.info(`   👤 Rôle: ${adminRole.nom}`);

        process.exit(0);
    } catch (error) {
        logger.error(`❌ Erreur lors du seed: ${error.message}`);
        process.exit(1);
    }
};

seed();