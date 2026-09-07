import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';

export const ThemeContext = createContext(undefined);

const STORAGE_KEY = 'snrt-theme';

const getSystemTheme = () => (
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
);

const getInitialTheme = () => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }

    return getSystemTheme();
};

const applyThemeToDocument = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    document.body.style.backgroundColor = theme === 'dark' ? '#12121e' : '#ffffff';
    document.body.style.color = theme === 'dark' ? '#e8e8f0' : '#20242b';
};

const initialTheme = getInitialTheme();
applyThemeToDocument(initialTheme);

const isLightColor = (color) => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match || (match[4] !== undefined && Number(match[4]) === 0)) return false;

    return Number(match[1]) > 230 && Number(match[2]) > 230 && Number(match[3]) > 230;
};

const isDarkColor = (color) => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match || (match[4] !== undefined && Number(match[4]) === 0)) return false;

    return Number(match[1]) < 100 && Number(match[2]) < 110 && Number(match[3]) < 120;
};

const syncLightSurfaces = (theme) => {
    const elements = document.body.querySelectorAll('*');

    elements.forEach((element) => {
        if (theme !== 'dark') {
            element.removeAttribute('data-theme-light-surface');
            element.removeAttribute('data-theme-dark-text');
            return;
        }

        const computedStyle = window.getComputedStyle(element);
        const hasLightBackground = isLightColor(computedStyle.backgroundColor);
        const hasDarkText = isDarkColor(computedStyle.color);

        if (hasLightBackground) {
            const tagName = element.tagName.toLowerCase();
            const className = typeof element.className === 'string' ? element.className : '';
            const isFormControl = ['input', 'textarea', 'select'].includes(tagName)
                || className.includes('InputBase')
                || className.includes('OutlinedInput');
            const isSurface = className.includes('Paper')
                || className.includes('Card')
                || className.includes('Dialog')
                || className.includes('Menu');

            element.setAttribute(
                'data-theme-light-surface',
                isFormControl ? 'input' : isSurface ? 'card' : 'page',
            );
        } else {
            element.removeAttribute('data-theme-light-surface');
        }

        if (hasDarkText) {
            element.setAttribute('data-theme-dark-text', 'true');
        } else {
            element.removeAttribute('data-theme-dark-text');
        }
    });
};

export const ThemeProvider = ({ children }) => {
    const hasUserPreference = useRef(Boolean(window.localStorage.getItem(STORAGE_KEY)));
    const [theme, setTheme] = useState(initialTheme);
    const [isThemeReady, setIsThemeReady] = useState(false);

    useEffect(() => {
        applyThemeToDocument(theme);
        window.localStorage.setItem(STORAGE_KEY, theme);
        setIsThemeReady(true);

        const sync = () => window.requestAnimationFrame(() => syncLightSurfaces(theme));
        sync();
        const observer = new MutationObserver(sync);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

        return () => observer.disconnect();
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (event) => {
            if (!hasUserPreference.current) {
                setTheme(event.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener?.('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener?.('change', handleSystemThemeChange);
    }, []);

    const value = useMemo(() => ({
        theme,
        isThemeReady,
        toggleTheme: () => {
            hasUserPreference.current = true;
            setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light');
        },
    }), [theme, isThemeReady]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};