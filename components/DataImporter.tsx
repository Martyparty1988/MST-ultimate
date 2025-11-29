import React, { useState } from 'react';
import { useDb } from '../hooks/useDb';
import { processFileForImport } from '../services/geminiService';
import { DocumentArrowUpIcon } from './icons/Icons';
import { toast, Toaster } from 'react-hot-toast';
import { Project, SolarTable, Worker } from '../types';
// FIX: Added missing import for useLiveQuery
import { useLiveQuery } from 'dexie-react-hooks';


interface ExtractedData {
    workers?: Partial<Worker>[];
    projects?: Partial<Project>[];
    solarTables?: Partial<SolarTable>[];
}


const DataImporter: React.FC = () => {
    const db = useDb();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeProject, setActiveProject] = useState<number | null>(null);

    const projects = useLiveQuery(() => db.projects.toArray(), [db]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setExtractedData(null);
        }
    };

    const handleAnalyzeFile = async () => {
        if (!selectedFile) return;
        setIsLoading(true);
        const loadingToast = toast.loading('Analyzuji soubor pomocí AI...');
        try {
            const data = await processFileForImport(selectedFile);
            setExtractedData(data);
            toast.success('Analýza dokončena. Zkontrolujte data a importujte.');
        } catch (error) {
            console.error('File analysis failed:', error);
            toast.error('Během analýzy souboru došlo k chybě.');
        } finally {
            setIsLoading(false);
            toast.dismiss(loadingToast);
        }
    };

    const handleImportData = async () => {
        if (!extractedData) return;
        
        if (extractedData.solarTables && !activeProject) {
            toast.error("Pro import solárních stolů musíte vybrat projekt.");
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Importuji data do databáze...');

        try {
            await (db as any).transaction('rw', db.workers, db.projects, db.solarTables, async () => {
                if (extractedData.workers) {
                    await db.workers.bulkPut(extractedData.workers as Worker[]);
                }
                if (extractedData.projects) {
                    await db.projects.bulkPut(extractedData.projects as Project[]);
                }
                if (extractedData.solarTables && activeProject) {
                    const tablesWithProjectId = extractedData.solarTables.map(t => ({...t, projectId: activeProject}))
                    await db.solarTables.bulkPut(tablesWithProjectId as SolarTable[]);
                }
            });
            toast.success('Data byla úspěšně importována!');
            setExtractedData(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Import failed:', error);
            toast.error('Během importu došlo k chybě.');
        } finally {
            setIsLoading(false);
            toast.dismiss(loadingToast);
        }
    };

    const renderPreview = () => {
        if (!extractedData) return null;
        return (
            <div className="space-y-4">
                {extractedData.workers && (
                    <div>
                        <h3 className="text-lg font-semibold text-white">Pracovníci ({extractedData.workers.length})</h3>
                        <pre className="bg-gray-900 p-2 rounded-md text-xs text-gray-300 max-h-40 overflow-auto">{JSON.stringify(extractedData.workers, null, 2)}</pre>
                    </div>
                )}
                 {extractedData.projects && (
                    <div>
                        <h3 className="text-lg font-semibold text-white">Projekty ({extractedData.projects.length})</h3>
                        <pre className="bg-gray-900 p-2 rounded-md text-xs text-gray-300 max-h-40 overflow-auto">{JSON.stringify(extractedData.projects, null, 2)}</pre>
                    </div>
                )}
                 {extractedData.solarTables && (
                    <div>
                        <h3 className="text-lg font-semibold text-white">Solární stoly ({extractedData.solarTables.length})</h3>
                        <select onChange={(e) => setActiveProject(Number(e.target.value))} className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4 mb-2">
                            <option>Vyberte projekt pro import stolů</option>
                            {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <pre className="bg-gray-900 p-2 rounded-md text-xs text-gray-300 max-h-40 overflow-auto">{JSON.stringify(extractedData.solarTables, null, 2)}</pre>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            <Toaster position="bottom-center" />
            <h1 className="text-3xl font-bold mb-6 text-white">Inteligentní import dat</h1>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <DocumentArrowUpIcon className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Klikněte pro nahrání</span> nebo přetáhněte soubor</p>
                            <p className="text-xs text-gray-400">CSV, XLSX, PDF, PNG, JPG</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                    {selectedFile && <p className="mt-4 text-white">Vybraný soubor: {selectedFile.name}</p>}
                </div>
                
                <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <button onClick={handleAnalyzeFile} disabled={!selectedFile || isLoading} className="flex-1 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed transition">
                        Analyzovat soubor
                    </button>
                    <button onClick={handleImportData} disabled={!extractedData || isLoading} className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed transition">
                        Importovat data
                    </button>
                </div>

                {extractedData && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">Náhled extrahovaných dat</h2>
                        {renderPreview()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataImporter;