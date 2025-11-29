
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, AppLanguage, AppTheme, Currency, StringRules } from '../types';
import { translate } from '../services/localization';

interface SettingsContextType extends AppSettings {
    setLanguage: (lang: AppLanguage) => void;
    setTheme: (theme: AppTheme) => void;
    setCurrency: (currency: Currency) => void;
    setStringRules: (rules: StringRules) => void;
    t: (key: string) => string;
    isAdminMode: boolean;
    enableAdminMode: () => void;
}

const defaultSettings: AppSettings = {
    language: 'cs',
    theme: 'dark',
    currency: 'CZK',
    stringRules: {
        small: 1,
        medium: 1.5,
        large: 2
    }
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const saved = localStorage.getItem('mst_settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            console.error("Failed to parse settings from localStorage:", e);
            return defaultSettings;
        }
    });
    
    const [isAdminMode, setIsAdminMode] = useState(false);

    useEffect(() => {
        localStorage.setItem('mst_settings', JSON.stringify(settings));
        
        // Apply theme to body
        const body = document.body;
        if (settings.theme === 'dark') {
            body.classList.add('bg-gray-900', 'text-gray-100');
            body.classList.remove('bg-gray-50', 'text-gray-900');
        } else {
            body.classList.add('bg-gray-50', 'text-gray-900');
            body.classList.remove('bg-gray-900', 'text-gray-100');
        }
    }, [settings]);

    const setLanguage = (language: AppLanguage) => setSettings(prev => ({ ...prev, language }));
    const setTheme = (theme: AppTheme) => setSettings(prev => ({ ...prev, theme }));
    const setCurrency = (currency: Currency) => setSettings(prev => ({ ...prev, currency }));
    const setStringRules = (stringRules: StringRules) => setSettings(prev => ({ ...prev, stringRules }));

    const enableAdminMode = () => {
        setIsAdminMode(true);
        console.log("Admin mode enabled");
    };

    const t = (key: string) => translate(key, settings.language);

    return (
        <SettingsContext.Provider value={{ 
            ...settings, 
            setLanguage, 
            setTheme, 
            setCurrency, 
            setStringRules, 
            t,
            isAdminMode,
            enableAdminMode
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};