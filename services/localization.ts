
import { AppLanguage } from '../types';

type Translations = {
  [key: string]: {
    cs: string;
    en: string;
    de: string;
  };
};

const dictionary: Translations = {
  // General
  dashboard: { cs: 'Nástěnka', en: 'Dashboard', de: 'Instrumententafel' },
  projects: { cs: 'Projekty', en: 'Projects', de: 'Projekte' },
  workers: { cs: 'Pracovníci', en: 'Workers', de: 'Arbeiter' },
  settings: { cs: 'Nastavení', en: 'Settings', de: 'Einstellungen' },
  loading: { cs: 'Načítání...', en: 'Loading...', de: 'Laden...' },
  save: { cs: 'Uložit', en: 'Save', de: 'Speichern' },
  cancel: { cs: 'Zrušit', en: 'Cancel', de: 'Abbrechen' },
  delete: { cs: 'Smazat', en: 'Delete', de: 'Löschen' },
  edit: { cs: 'Upravit', en: 'Edit', de: 'Bearbeiten' },
  
  // Settings
  appearance: { cs: 'Vzhled', en: 'Appearance', de: 'Aussehen' },
  language: { cs: 'Jazyk', en: 'Language', de: 'Sprache' },
  theme: { cs: 'Motiv', en: 'Theme', de: 'Thema' },
  light: { cs: 'Světlý', en: 'Light', de: 'Hell' },
  dark: { cs: 'Tmavý', en: 'Dark', de: 'Dunkel' },
  currency: { cs: 'Měna', en: 'Currency', de: 'Währung' },
  stringRules: { cs: 'Pravidla pro stringy', en: 'String Rules', de: 'String-Regeln' },
  stringValues: { cs: 'Hodnoty stolů (počet stringů)', en: 'Table Values (String count)', de: 'Tischwerte (String-Anzahl)' },
  smallTable: { cs: 'Malý stůl', en: 'Small Table', de: 'Kleiner Tisch' },
  mediumTable: { cs: 'Střední stůl', en: 'Medium Table', de: 'Mittlerer Tisch' },
  largeTable: { cs: 'Velký stůl', en: 'Large Table', de: 'Großer Tisch' },
  backupData: { cs: 'Záloha dat', en: 'Backup Data', de: 'Datensicherung' },
  backupDesc: { cs: 'Stáhněte si kompletní zálohu vaší lokální databáze.', en: 'Download a complete backup of your local database.', de: 'Laden Sie eine vollständige Sicherung Ihrer lokalen Datenbank herunter.' },
  downloadBackup: { cs: 'Stáhnout zálohu', en: 'Download Backup', de: 'Sicherung herunterladen' },
  importData: { cs: 'Import dat', en: 'Import Data', de: 'Datenimport' },
  factoryReset: { cs: 'Tovární nastavení', en: 'Factory Reset', de: 'Werksreset' },
  dangerZone: { cs: 'Nebezpečná zóna', en: 'Danger Zone', de: 'Gefahrenzone' },
  resetApp: { cs: 'Resetovat aplikaci', en: 'Reset App', de: 'App zurücksetzen' },
  resetDesc: { cs: 'Tato akce vymaže všechna data v prohlížeči.', en: 'This action will wipe all data in the browser.', de: 'Diese Aktion löscht alle Daten im Browser.' },
  
  // Statuses
  pending: { cs: 'Čeká', en: 'Pending', de: 'Ausstehend' },
  in_progress: { cs: 'V procesu', en: 'In Progress', de: 'In Bearbeitung' },
  done: { cs: 'Hotovo', en: 'Done', de: 'Fertig' },
};

export const translate = (key: string, lang: AppLanguage): string => {
  const entry = dictionary[key];
  if (!entry) return key;
  return entry[lang] || entry['en'];
};
