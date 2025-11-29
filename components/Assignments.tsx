import React, { useState, useMemo } from 'react';
import { useDb } from '../hooks/useDb';
import { useLiveQuery } from 'dexie-react-hooks';
import PlanCanvas from './plan/PlanCanvas';
import { toast, Toaster } from 'react-hot-toast';

const Assignments: React.FC = () => {
    const db = useDb();
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const projects = useLiveQuery(() => db.projects.toArray(), [db]);
    // FIX: Dexie indexes booleans as numbers (1 for true, 0 for false). Changed .equals(true) to .equals(1).
    const workers = useLiveQuery(() => db.workers.where('active').equals(1).toArray(), [db]);

    const projectData = useLiveQuery(async () => {
        if (!selectedProjectId) return null;
        const tables = await db.solarTables.where('projectId').equals(selectedProjectId).sortBy('baseNumber');
        const tableIds = tables.map(t => t.id!);
        const assignments = await db.tableAssignments.where('tableId').anyOf(tableIds).toArray();
        return { tables, assignments };
    }, [db, selectedProjectId]);
    
    const filteredTables = useMemo(() => {
        if (!projectData?.tables) return [];
        if (!searchQuery.trim()) {
            return projectData.tables;
        }
        return projectData.tables.filter(table => {
            const tableIdentifier = `${table.baseNumber}${table.variant || ''}`;
            return tableIdentifier.toLowerCase().includes(searchQuery.trim().toLowerCase());
        });
    }, [projectData?.tables, searchQuery]);


    const selectedTable = useMemo(() => {
        if (!selectedTableId || !projectData?.tables) return null;
        return projectData.tables.find(t => t.id === selectedTableId);
    }, [selectedTableId, projectData?.tables]);

    const selectedTableAssignments = useMemo(() => {
        if (!selectedTableId || !projectData?.assignments) return [];
        return projectData.assignments.find(a => a.tableId === selectedTableId)?.workerIds || [];
    }, [selectedTableId, projectData?.assignments]);
    
    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        setSelectedProjectId(id || null);
        setSelectedTableId(null);
        setSearchQuery('');
    };
    
    const handleTableSelect = (tableId: number) => {
        setSelectedTableId(prevId => prevId === tableId ? null : tableId);
    };

    const handleWorkerToggle = async (workerId: number) => {
        if (!selectedTableId) return;

        try {
            const existingAssignment = await db.tableAssignments.where('tableId').equals(selectedTableId).first();
            
            if (existingAssignment) {
                const newWorkerIds = existingAssignment.workerIds.includes(workerId)
                    ? existingAssignment.workerIds.filter(id => id !== workerId)
                    : [...existingAssignment.workerIds, workerId];

                if (newWorkerIds.length > 0) {
                    await db.tableAssignments.update(existingAssignment.id!, { workerIds: newWorkerIds, updatedAt: Date.now() });
                } else {
                    await db.tableAssignments.delete(existingAssignment.id!);
                }
            } else {
                await db.tableAssignments.add({
                    tableId: selectedTableId,
                    workerIds: [workerId],
                    updatedAt: Date.now()
                });
            }
            toast.success('Přiřazení aktualizováno.');
        } catch (error) {
            console.error("Failed to update assignment:", error);
            toast.error('Aktualizace se nezdařila.');
        }
    };
    
    return (
        <div>
            <Toaster position="bottom-center" />
            <h1 className="text-3xl font-bold mb-6 text-white">Přiřazení stolů</h1>
            
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                <select 
                    onChange={handleProjectChange} 
                    className="w-full md:w-auto flex-grow bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4 focus:ring-indigo-500"
                    value={selectedProjectId || ''}
                >
                    <option value="">-- Vyberte projekt --</option>
                    {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="relative w-full md:w-auto md:flex-grow-[2]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Vyhledat stůl (např. '28.1')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4 pl-10 focus:ring-indigo-500"
                        disabled={!selectedProjectId}
                    />
                </div>
            </div>

            {!selectedProjectId && (
                <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">Pro zobrazení plánu a přiřazení vyberte projekt.</p>
                </div>
            )}

            {selectedProjectId && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {projectData && workers ? (
                            <PlanCanvas
                                tables={filteredTables}
                                workers={workers}
                                assignments={projectData.assignments}
                                selectedTableId={selectedTableId}
                                onTableSelect={handleTableSelect}
                            />
                        ) : (
                             <div className="w-full h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
                                 <p className="text-gray-400">Načítání plánu...</p>
                             </div>
                        )}
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        {selectedTable ? (
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    Stůl {selectedTable.baseNumber}{selectedTable.variant || ''}
                                </h2>
                                <p className={`mb-4 text-sm capitalize px-2 py-0.5 rounded-full inline-block ${
                                    selectedTable.status === 'done' ? 'bg-green-500/20 text-green-300' :
                                    selectedTable.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-gray-500/20 text-gray-300'
                                }`}>{selectedTable.status.replace('_', ' ')}</p>
                                
                                <h3 className="text-lg font-semibold text-white mb-3">Přiřazení pracovníci</h3>
                                <div className="space-y-2">
                                    {workers?.map(worker => (
                                        <div 
                                            key={worker.id}
                                            onClick={() => handleWorkerToggle(worker.id!)}
                                            className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${selectedTableAssignments.includes(worker.id!) ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                readOnly
                                                checked={selectedTableAssignments.includes(worker.id!)}
                                                className="w-4 h-4 text-indigo-500 bg-gray-600 border-gray-500 rounded focus:ring-indigo-400 pointer-events-none"
                                            />
                                            <div className="ml-3 flex items-center">
                                                 <div
                                                    style={{ backgroundColor: worker.color }}
                                                    className="w-4 h-4 rounded-full mr-2 border-2 border-gray-800"
                                                ></div>
                                                <span className="text-white font-medium">{worker.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400 text-center">Vyberte stůl z plánu pro zobrazení detailů a přiřazení pracovníků.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Assignments;