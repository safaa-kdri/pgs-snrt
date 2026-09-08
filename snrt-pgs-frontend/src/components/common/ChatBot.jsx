import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './ChatBot.module.css';

const knowledgeBase = [
    {
        keywords: ['bonjour', 'salut', 'hello', 'coucou'],
        response: 'Bonjour ! Je suis l’assistant virtuel de la SNRT. Comment puis-je vous aider ?',
    },
    {
        keywords: ['stage', 'offre', 'postuler', 'candidature'],
        response: 'Pour postuler : connectez-vous, consultez les offres, cliquez sur « Postuler », déposez les documents demandés, puis suivez votre candidature dans votre espace.',
    },
    {
        keywords: ['document', 'cv', 'lettre', 'papier'],
        response: 'Les documents généralement demandés sont le CV, la lettre de motivation, les relevés de notes et l’attestation de scolarité. Les exigences peuvent varier selon l’offre.',
    },
    {
        keywords: ['convention', 'attestation', 'pdf'],
        response: 'La convention est générée après acceptation de la candidature. L’attestation est disponible à la clôture du stage, au format PDF.',
    },
    {
        keywords: ['suivi', 'avancement', 'progression', 'état'],
        response: 'Vous pouvez suivre vos candidatures et vos stages depuis votre espace personnel. Les changements d’état apparaissent également dans vos notifications.',
    },
    {
        keywords: ['entretien', 'interview', 'rencontre'],
        response: 'Les entretiens sont planifiés par le service RH. Vous recevez une notification avec la date, l’heure et le lieu ou le lien de visioconférence.',
    },
    {
        keywords: ['compte', 'inscription', 'connexion', 'login', 'mot de passe'],
        response: 'Pour créer un compte, cliquez sur « S’inscrire » et complétez le formulaire. Pour vous connecter, utilisez votre CIN et votre mot de passe avec le CAPTCHA.',
    },
    {
        keywords: ['contact', 'aide', 'support', 'problème', 'erreur'],
        response: 'Vous pouvez consulter la FAQ, contacter le service RH ou utiliser le formulaire de contact de la plateforme.',
    },
    {
        keywords: ['merci', 'thanks', 'ok'],
        response: 'Avec plaisir ! N’hésitez pas à poser une autre question.',
    },
];

const internalLoginResponse = 'Vous êtes sur l’espace de connexion interne de la SNRT. Cet espace est réservé aux utilisateurs internes : RH, département, encadrant et administrateur. Pour vous connecter, saisissez votre CIN professionnel et le mot de passe qui vous a été attribué, puis validez le CAPTCHA. Je ne peux pas connaître ni communiquer votre mot de passe. Après validation, votre rôle est reconnu automatiquement et vous êtes redirigé vers votre espace. En cas d’oubli, utilisez la procédure « Mot de passe oublié » ou contactez l’administrateur.';

const findResponse = (message, isInternalLogin) => {
    const normalizedMessage = message.toLocaleLowerCase('fr-FR');

    if (isInternalLogin && ['login', 'connexion', 'connecter', 'mot de passe', 'mdp', 'identifiant', 'cin', 'interne', 'rh', 'administrateur'].some((keyword) => normalizedMessage.includes(keyword))) {
        return internalLoginResponse;
    }

    const match = knowledgeBase.find((item) => item.keywords.some((keyword) => normalizedMessage.includes(keyword)));

    return match?.response || 'Je peux vous aider avec les offres, les candidatures, les documents, les conventions, les entretiens, votre compte et le suivi de stage.';
};

const ChatBot = () => {
    const location = useLocation();
    const isInternalLogin = location.pathname === '/login-interne';
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: isInternalLogin ? 'Bonjour ! Vous êtes sur l’espace de connexion interne de la SNRT. Je peux vous expliquer qui peut se connecter et quels identifiants utiliser.' : 'Bonjour ! Je suis l’assistant virtuel de la SNRT. Posez-moi vos questions sur les stages et les candidatures.' },
    ]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setMessages([{ id: Date.now(), type: 'bot', text: isInternalLogin ? 'Bonjour ! Vous êtes sur l’espace de connexion interne de la SNRT. Je peux vous expliquer qui peut se connecter et quels identifiants utiliser.' : 'Bonjour ! Je suis l’assistant virtuel de la SNRT. Posez-moi vos questions sur les stages et les candidatures.' }]);
    }, [isInternalLogin]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = () => {
        const message = input.trim();
        if (!message || isLoading) return;

        setMessages((current) => [...current, { id: Date.now(), type: 'user', text: message }]);
        setInput('');
        setIsLoading(true);

        window.setTimeout(() => {
            setMessages((current) => [...current, { id: Date.now() + 1, type: 'bot', text: findResponse(message, isInternalLogin) }]);
            setIsLoading(false);
        }, 350);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') handleSend();
    };

    return (
        <>
            <button
                className={styles.chatButton}
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                aria-label={isOpen ? 'Fermer l’assistant' : 'Ouvrir l’assistant'}
                aria-expanded={isOpen}
            >
                {isOpen ? '×' : '💬'}
            </button>

            {isOpen && (
                <section className={styles.chatWindow} aria-label="Assistant SNRT">
                    <header className={styles.chatHeader}>
                        <div>
                            <h2>Assistant SNRT</h2>
                            <span className={styles.chatStatus}>● En ligne</span>
                        </div>
                        <button className={styles.chatClose} type="button" onClick={() => setIsOpen(false)} aria-label="Fermer l’assistant">×</button>
                    </header>
                    <div className={styles.chatMessages} aria-live="polite">
                        {messages.map((message) => (
                            <div key={message.id} className={`${styles.message} ${message.type === 'user' ? styles.userMessage : styles.botMessage}`}>
                                <p>{message.text}</p>
                            </div>
                        ))}
                        {isLoading && <div className={`${styles.message} ${styles.botMessage}`}><p className={styles.typing}>•••</p></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className={styles.chatInput}>
                        <input
                            className={styles.inputField}
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Posez votre question..."
                            aria-label="Votre question"
                            disabled={isLoading}
                        />
                        <button className={styles.sendButton} type="button" onClick={handleSend} disabled={!input.trim() || isLoading}>Envoyer</button>
                    </div>
                </section>
            )}
        </>
    );
};

export default ChatBot;