import React from 'react';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useTheme } from '../../hooks/useTheme';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={styles.container}>
            <span className={styles.label}>Thème</span>
            <button
                className={styles.toggle}
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
                onClick={toggleTheme}
            >
                <span className={`${styles.slider} ${isDark ? styles.active : ''}`}>
                    <LightMode className={styles.lightIcon} aria-hidden="true" />
                    <DarkMode className={styles.darkIcon} aria-hidden="true" />
                </span>
            </button>
        </div>
    );
};

export default ThemeToggle;