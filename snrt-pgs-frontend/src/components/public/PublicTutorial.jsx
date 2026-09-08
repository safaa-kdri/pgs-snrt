import React, { useEffect } from 'react';
import { OPEN_TUTORIAL_EVENT } from '../../hooks/useTutorial';
import styles from './PublicTutorial.module.css';

const steps = [
    {
        route: '/',
        title: 'Trouvez votre stage',
        text: 'Parcourez les offres publiées par la SNRT et utilisez les filtres pour trouver une opportunité adaptée à votre profil.',
        tip: 'Astuce : consultez régulièrement les nouvelles offres, car les dates limites peuvent varier.',
    },
    {
        route: '/register',
        title: 'Créez votre compte',
        text: 'Inscrivez-vous avec vos informations personnelles, puis connectez-vous pour accéder à votre espace candidat.',
        tip: 'Astuce : préparez votre CIN, votre adresse e-mail et un mot de passe sécurisé.',
    },
    {
        route: '/offres',
        title: 'Déposez votre candidature',
        text: 'Choisissez une offre, complétez les informations demandées et ajoutez les documents nécessaires avant de soumettre votre dossier.',
        tip: 'Astuce : vérifiez chaque fichier et assurez-vous qu’il est lisible avant l’envoi.',
    },
    {
        route: '/login',
        title: 'Suivez votre candidature',
        text: 'Retrouvez l’état de vos candidatures, vos notifications et les prochaines étapes directement dans votre espace personnel.',
        tip: 'Astuce : activez vos notifications pour ne manquer aucune mise à jour de la SNRT.',
    },
];

const PublicTutorial = ({ tutorial }) => {
    const { isOpen, step, close, next, previous, skip } = tutorial;
    const currentStep = steps[step] || steps[0];

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') close();
            if (event.key === 'ArrowRight' && step < steps.length - 1) next(steps.length);
            if (event.key === 'ArrowLeft' && step > 0) previous();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, step, close, next, previous]);

    if (!isOpen) return null;

    return (
        <section className={styles.tutorialPanel} aria-labelledby="tutorial-title">
                <button className={styles.closeButton} type="button" onClick={close} aria-label="Fermer le tutoriel">Fermer</button>
                <div className={styles.eyebrow}>Guide de la plateforme</div>
                <div className={styles.progressHeader}>
                    <span>Étape {step + 1} sur {steps.length}</span>
                    <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
                </div>
                <div className={styles.progressTrack} aria-label={`Progression : étape ${step + 1} sur ${steps.length}`}>
                    <div className={styles.progressValue} style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
                </div>

                <div className={styles.screenFrame}>
                    <iframe title={`Aperçu de l’étape : ${currentStep.title}`} src={`${currentStep.route}${currentStep.route.includes('?') ? '&' : '?'}tutorialPreview=1`} />
                </div>
                <h2 id="tutorial-title" className={styles.title}>{currentStep.title}</h2>
                <p className={styles.text}>{currentStep.text}</p>
                <div className={styles.tip}><strong>Astuce</strong><span>{currentStep.tip.replace('Astuce : ', '')}</span></div>

                <div className={styles.stepDots} aria-label="Étapes du tutoriel">
                    {steps.map((item, index) => (
                        <span key={item.title} className={`${styles.dot} ${index === step ? styles.activeDot : ''}`} />
                    ))}
                </div>

                <div className={styles.actions}>
                    <button className={styles.skipButton} type="button" onClick={skip}>Passer le tutoriel</button>
                    <div className={styles.navigation}>
                        <button className={styles.previousButton} type="button" onClick={previous} disabled={step === 0}>Précédent</button>
                        <button className={styles.nextButton} type="button" onClick={() => step === steps.length - 1 ? close() : next(steps.length)}>
                            {step === steps.length - 1 ? 'Terminer' : 'Suivant'}
                        </button>
                    </div>
                </div>
        </section>
    );
};

export const requestPublicTutorial = () => window.dispatchEvent(new Event(OPEN_TUTORIAL_EVENT));
export default PublicTutorial;
