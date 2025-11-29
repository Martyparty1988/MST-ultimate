
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DbContext } from './contexts/DbContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { MSTUltimateDB, db } from './db';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import Workers from './components/Workers';
import Tasks from './components/Tasks';
import TimeTracking from './components/TimeTracking';
import AIInsights from './components/AIInsights';
import DataImporter from './components/DataImporter';
import Settings from './components/Settings';
import Assignments from './components/Assignments';
import Schedule from './components/Schedule';

const App: React.FC = () => {
  const [database, setDatabase] = useState<MSTUltimateDB | null>(null);

  useEffect(() => {
    setDatabase(db);
  }, []);

  if (!database) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-center">
                <svg className="mx-auto h-12 w-12 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="mt-4 text-xl font-semibold">Initializing Database...</h2>
                <p className="text-gray-400">Please wait a moment.</p>
            </div>
      </div>
    );
  }

  return (
    <SettingsProvider>
        <DbContext.Provider value={database}>
        <HashRouter>
            <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="workers" element={<Workers />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tracking" element={<TimeTracking />} />
                <Route path="insights" element={<AIInsights />} />
                <Route path="import" element={<DataImporter />} />
                <Route path="settings" element={<Settings />} />
            </Route>
            </Routes>
        </HashRouter>
        </DbContext.Provider>
    </SettingsProvider>
  );
};

export default App;
