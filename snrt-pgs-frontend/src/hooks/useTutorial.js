import { useCallback, useEffect, useState } from 'react';

const TUTORIAL_SEEN_KEY = 'pgs-public-tutorial-seen';
const TUTORIAL_STEP_KEY = 'pgs-public-tutorial-step';
const OPEN_TUTORIAL_EVENT = 'pgs:open-public-tutorial';

const readStep = () => {
    const savedStep = Number.parseInt(localStorage.getItem(TUTORIAL_STEP_KEY), 10);
    return Number.isFinite(savedStep) && savedStep >= 0 ? savedStep : 0;
};

const useTutorial = ({ autoOpen = true } = {}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    const open = useCallback(() => {
        setStep(readStep());
        setIsOpen(true);
        localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    }, []);

    const close = useCallback(() => {
        localStorage.setItem(TUTORIAL_STEP_KEY, String(step));
        setIsOpen(false);
    }, [step]);

    const next = useCallback((totalSteps) => {
        setStep((currentStep) => {
            const nextStep = Math.min(currentStep + 1, totalSteps - 1);
            localStorage.setItem(TUTORIAL_STEP_KEY, String(nextStep));
            return nextStep;
        });
    }, []);

    const previous = useCallback(() => {
        setStep((currentStep) => {
            const previousStep = Math.max(currentStep - 1, 0);
            localStorage.setItem(TUTORIAL_STEP_KEY, String(previousStep));
            return previousStep;
        });
    }, []);

    const skip = useCallback(() => {
        localStorage.setItem(TUTORIAL_STEP_KEY, String(step));
        localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
        setIsOpen(false);
    }, [step]);

    useEffect(() => {
        const handleOpenRequest = () => open();
        window.addEventListener(OPEN_TUTORIAL_EVENT, handleOpenRequest);

        const hasSeenTutorial = localStorage.getItem(TUTORIAL_SEEN_KEY) === 'true';
        if (autoOpen && !hasSeenTutorial) {
            const timer = window.setTimeout(open, 3000);
            return () => {
                window.clearTimeout(timer);
                window.removeEventListener(OPEN_TUTORIAL_EVENT, handleOpenRequest);
            };
        }

        return () => window.removeEventListener(OPEN_TUTORIAL_EVENT, handleOpenRequest);
    }, [autoOpen, open]);

    return {
        isOpen,
        step,
        open,
        close,
        next,
        previous,
        skip,
    };
};

export { OPEN_TUTORIAL_EVENT };
export default useTutorial;
