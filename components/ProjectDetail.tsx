
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDb } from '../hooks/useDb';
import PlanCanvas from './plan/PlanCanvas';
import SolarTableComponent from './plan/SolarTableComponent';
import { SolarTable, SolarTableStatus } from '../types';
import ProgressChart from './charts/ProgressChart';
import { toast, Toaster } from 'react-hot-toast';

const statusOptions: { value: SolarTableStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Čeká', color: 'bg-gray-500' },
    { value: 'in_progress', label: 'V procesu', color: 'bg-yellow-500' },
    { value: 'done', label: 'Hotovo', color: 'bg-green-500' },
];

const ProjectDetail: React.FC = () => {
    const { id } = useParams();
    const db = useDb();
    const projectId = Number(id);
    const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
    const [statusFilter, setStatusFilter] = useState<SolarTableStatus[]>(['pending', 'in_progress', 'done']);

    const project = useLiveQuery(() => db.projects.get(projectId), [db, projectId]);
    const tables = useLiveQuery(() => db.solarTables.where('projectId').equals(projectId).sortBy('baseNumber'), [db, projectId]);

    const stats = useMemo(() => {
        if (!tables) return { total: 0, done: 0, in_progress: 0, pending: 0, percentage: 0 };
        const total = tables.length;
        const done = tables.filter(t => t.status === 'done').length;
        const in_progress = tables.filter(t => t.status === 'in_progress').length;
        const pending = tables.filter(t => t.status === 'pending').length;
        const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
        return { total, done, in_progress, pending, percentage };
    }, [tables]);

    const handleStatusFilterChange = (status: SolarTableStatus) => {
        setStatusFilter(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const handleTableStatusChange = async (table: SolarTable) => {
        if (!table.id) return;
        const statusCycle: SolarTableStatus[] = ['pending', 'in_progress', 'done'];
        const currentStatusIndex = statusCycle.indexOf(table.status);
        const nextStatus = statusCycle[(currentStatusIndex + 1) % statusCycle.length];

        try {
            await db.solarTables.update(table.id, {
                status: nextStatus,
                statusUpdatedAt: Date.now()
            });
            toast.success(`Stůl ${table.baseNumber}${table.variant || ''} změněn na: ${nextStatus.replace('_', ' ')}`);
        } catch (error) {
            console.error("Failed to update table status:", error);
            toast.error('Změna statusu se nezdařila.');
        }
    };

    const chartData = useMemo(() => {
        if (!tables || !project || tables.length === 0) return [];

        const doneTables = tables
            .filter(t => t.status === 'done' && t.statusUpdatedAt)
            .sort((a, b) => a.statusUpdatedAt! - b.statusUpdatedAt!);

        if (doneTables.length === 0) {
             const projectStartDate = new Date(project.createdAt);
             projectStartDate.setHours(0, 0, 0, 0);
             return [{ date: projectStartDate.toISOString().split('T')[0], count: 0 }];
        }

        const dailyCounts = new Map<string, number>();
        for (const table of doneTables) {
            const dateStr = new Date(table.statusUpdatedAt!).toISOString().split('T')[0];
            dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + 1);
        }

        const projectStartDate = new Date(project.createdAt);
        projectStartDate.setHours(0, 0, 0, 0);

        const lastCompletionDate = new Date(doneTables[doneTables.length - 1].statusUpdatedAt!);
        lastCompletionDate.setHours(0,0,0,0);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const endDate = lastCompletionDate > today ? lastCompletionDate : today;

        const data: { date: string, count: number }[] = [];
        let cumulativeCount = 0;

        for (let d = new Date(projectStartDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            cumulativeCount += dailyCounts.get(dateStr) || 0;
            data.push({
                date: dateStr,
                count: cumulativeCount
            });
        }

        return data;
    }, [tables, project]);

    const filteredTables = useMemo(() => {
        if (!tables) return [];
        return tables.filter(table => statusFilter.includes(table.status));
    }, [tables, statusFilter]);

    if (!project) {
        return <div className="text-center text-white">Načítání projektu...</div>;
    }

    return (
        <div>
            <Toaster position="bottom-center" />
            <h1 className="text-3xl font-bold mb-2 text-white">{project.name}</h1>
            <p className="text-gray-400 mb-6">{project.site}</p>

            {/* Stats */}
            <div className="mb-8 p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Přehled</h2>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                    <div className="bg-green-500 h-4 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
                </div>
                <div className="text-right text-lg font-bold text-white mb-4">{stats.percentage}% Hotovo</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                        <p className="text-sm text-gray-400">Celkem stolů</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-green-400">{stats.done}</p>
                        <p className="text-sm text-gray-400">Hotovo</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-yellow-400">{stats.in_progress}</p>
                        <p className="text-sm text-gray-400">V procesu</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-gray-300">{stats.pending}</p>
                        <p className="text-sm text-gray-400">Čeká</p>
                    </div>
                </div>
            </div>
            
            {/* Progress Over Time */}
            <div className="mb-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Postup v čase</h2>
                <ProgressChart data={chartData} total={stats.total} />
            </div>

            {/* Plan Renderer */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold text-white">Plán instalace</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                             <span className="text-gray-400 mr-2">Filtr:</span>
                             {statusOptions.map(option => (
                                 <button
                                     key={option.value}
                                     onClick={() => handleStatusFilterChange(option.value)}
                                     className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${statusFilter.includes(option.value) ? 'bg-opacity-100 text-white' : 'bg-opacity-20 text-gray-300 hover:bg-opacity-40'} ${option.color}`}
                                 >
                                     <div className={`w-2 h-2 rounded-full ${option.color} ring-1 ring-white/50`}></div>
                                     {option.label}
                                 </button>
                             ))}
                        </div>
                        <div className="flex bg-gray-700 rounded-lg p-1">
                            <button 
                                className={`px-3 py-1 rounded-md text-sm font-medium transition ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow' : 'text-gray-300 hover:text-white'}`}
                                onClick={() => setViewMode('map')}
                            >
                                Mapa
                            </button>
                            <button 
                                className={`px-3 py-1 rounded-md text-sm font-medium transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-gray-300 hover:text-white'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                Mřížka
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'map' ? (
                    <PlanCanvas tables={filteredTables || []} />
                ) : (
                    <div className="bg-gray-900 p-4 rounded-md overflow-auto min-h-[400px]">
                        <div className="flex flex-wrap gap-4">
                            {filteredTables?.map(table => (
                                <div key={table.id} onClick={() => handleTableStatusChange(table)} className="cursor-pointer" title="Kliknutím změnit status">
                                    <SolarTableComponent table={table} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetail;
