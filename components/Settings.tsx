import React, { useState } from 'react';
import { useDb } from '../hooks/useDb';
import { useSettings } from '../contexts/SettingsContext';
import { toast, Toaster } from 'react-hot-toast';
import { AppLanguage, AppTheme, Currency } from '../types';
import { Cog6ToothIcon, DocumentArrowDownIcon, ExclamationTriangleIcon, HomeIcon } from './icons/Icons';
import { GlassCard, SolarButton, GlassInput, SolarBadge, PageHeader } from './ui/DesignSystem';

const Settings: React.FC = () => {
    const db = useDb();
    const { 
        language, setLanguage, 
        theme, setTheme, 
        currency, setCurrency, 
        stringRules, setStringRules,
        t 
    } = useSettings();
    
    const [activeTab, setActiveTab] = useState<'appearance' | 'rules' | 'data'>('appearance');
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // --- Actions ---

    const handleBackup = async () => {
        setIsBackingUp(true);
        toast.loading(t('loading'));
        try {
            const allData: { [key: string]: any[] } = {};
            for (const table of (db as any).tables) {
                allData[table.name] = await table.toArray();
            }
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mst-ultimate-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success(t('done'));
        } catch (error) {
            console.error(error);
            toast.error('Backup failed');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleFactoryReset = async () => {
        if (!window.confirm(`${t('resetDesc')} Are you sure?`)) return;
        setIsResetting(true);
        try {
            await (db as any).delete();
            await (db as any).open();
            toast.success('System reset complete. Reloading...');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            toast.error('Reset failed');
            setIsResetting(false);
        }
    };

    // --- Tab Content Renderers ---

    const renderAppearanceTab = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-lg font-bold text-white mb-4">{t('language')}</h3>
                    <div className="space-y-2">
                        {['cs', 'en', 'de'].map((lang) => (
                            <div 
                                key={lang}
                                onClick={() => setLanguage(lang as AppLanguage)}
                                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${language === lang ? 'bg-solar-500/10 border-solar-500 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                            >
                                <span className="uppercase font-semibold">{lang}</span>
                                {language === lang && <SolarBadge variant="warning">Active</SolarBadge>}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-bold text-white mb-4">{t('theme')}</h3>
                    <div className="flex gap-4">
                        <button 
                             onClick={() => setTheme('dark')}
                             className={`flex-1 p-4 rounded-xl border text-center transition-all ${theme === 'dark' ? 'bg-slate-800 border-solar-500 ring-1 ring-solar-500' : 'border-white/10 opacity-50'}`}
                        >
                            <div className="w-full h-20 bg-slate-900 rounded-lg mb-2 border border-white/10"></div>
                            <span className="text-white font-medium">Dark (Default)</span>
                        </button>
                        <button 
                             onClick={() => setTheme('light')}
                             className={`flex-1 p-4 rounded-xl border text-center transition-all ${theme === 'light' ? 'bg-white text-slate-900 border-solar-500 ring-1 ring-solar-500' : 'bg-white/5 border-white/10 text-slate-400 hover:opacity-80'}`}
                        >
                             <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 border border-gray-200"></div>
                             <span className="font-medium">Light</span>
                        </button>
                    </div>
                </GlassCard>

                <GlassCard>
                     <h3 className="text-lg font-bold text-white mb-4">{t('currency')}</h3>
                     <select 
                        value={currency} 
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-solar-500 focus:ring-1 focus:ring-solar-500"
                    >
                        <option value="CZK">CZK (Kč)</option>
                        <option value="EUR">EUR (€)</option>
                     </select>
                </GlassCard>
             </div>
        </div>
    );

    const renderRulesTab = () => (
        <div className="animate-fade-in">
             <GlassCard>
                <h3 className="text-lg font-bold text-white mb-2">{t('stringRules')}</h3>
                <p className="text-slate-400 text-sm mb-6">{t('stringValues')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: t('smallTable'), key: 'small' as const },
                        { label: t('mediumTable'), key: 'medium' as const },
                        { label: t('largeTable'), key: 'large' as const },
                    ].map((item) => (
                        <div key={item.key}>
                            <GlassInput 
                                label={item.label}
                                type="number" 
                                step="0.1"
                                value={stringRules[item.key]}
                                onChange={(e) => setStringRules({...stringRules, [item.key]: Number(e.target.value)})}
                            />
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );

    const renderDataTab = () => (
        <div className="space-y-6 animate-fade-in">
            <GlassCard>
                <div className="flex items-center justify-between">
                    <div>
                         <h3 className="text-lg font-bold text-white mb-1">{t('backupData')}</h3>
                         <p className="text-slate-400 text-sm max-w-md">{t('backupDesc')}</p>
                    </div>
                    <SolarButton onClick={handleBackup} disabled={isBackingUp} icon={<DocumentArrowDownIcon className="w-5 h-5"/>}>
                         {isBackingUp ? t('loading') : t('downloadBackup')}
                    </SolarButton>
                </div>
            </GlassCard>

            <GlassCard className="border-red-500/30 bg-red-500/5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-1">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                            {t('dangerZone')}
                        </h3>
                        <p className="text-red-400/60 text-sm max-w-md">{t('resetDesc')}</p>
                    </div>
                    <SolarButton variant="danger" onClick={handleFactoryReset} disabled={isResetting}>
                        {isResetting ? t('loading') : t('resetApp')}
                    </SolarButton>
                </div>
            </GlassCard>
        </div>
    );

    return (
        <div className="pb-24 max-w-5xl mx-auto">
            <Toaster position="bottom-center" />
            
            <PageHeader title={t('settings')} subtitle="Configure application preferences and manage data." />

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
                {[
                    { id: 'appearance', label: t('appearance'), icon: <HomeIcon className="w-4 h-4"/> },
                    { id: 'rules', label: 'Calculations', icon: <Cog6ToothIcon className="w-4 h-4"/> },
                    { id: 'data', label: 'Data & Backup', icon: <DocumentArrowDownIcon className="w-4 h-4"/> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300
                            ${activeTab === tab.id 
                                ? 'bg-gradient-to-r from-solar-600 to-solar-400 text-slate-900 shadow-lg shadow-solar-500/20 scale-105' 
                                : 'bg-slate-800/50 text-slate-400 hover:bg-white/10 hover:text-white border border-transparent'
                            }
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'appearance' && renderAppearanceTab()}
                {activeTab === 'rules' && renderRulesTab()}
                {activeTab === 'data' && renderDataTab()}
            </div>
        </div>
    );
};

export default Settings;