import React, { useState, useMemo } from 'react';
import { useDb } from '../hooks/useDb';
import { useLiveQuery } from 'dexie-react-hooks';
import { Project, Worker, WorkerSchedule } from '../types';
import { toast, Toaster } from 'react-hot-toast';
import { ExclamationTriangleIcon } from './icons/Icons';

// Helper to get week days
const getWeekDays = (date: Date): Date[] => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    start.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
    });
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const ProjectPill: React.FC<{ project: Project; scheduleId: number; onDelete: () => void; onDragStart: (e: React.DragEvent) => void }> = ({ project, onDelete, onDragStart }) => {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="w-full text-left p-2 rounded-lg text-white text-sm font-semibold cursor-grab active:cursor-grabbing flex justify-between items-center"
            style={{ backgroundColor: project.color || '#4f46e5' }}
        >
            <span>{project.name}</span>
            <button onClick={onDelete} className="text-white/70 hover:text-white/100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};


const Schedule: React.FC = () => {
    const db = useDb();
    const [currentDate, setCurrentDate] = useState(new Date());

    const { workers, projects, schedules } = useLiveQuery(async () => {
        // FIX: Dexie indexes booleans as numbers (1 for true, 0 for false). Changed .equals(true) to .equals(1).
        const workers = await db.workers.where('active').equals(1).toArray();
        const projects = await db.projects.where('status').equals('Active').toArray();
        const schedules = await db.workerSchedules.toArray();
        return { workers, projects, schedules };
    }, [db]) ?? {};

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    const scheduleMap = useMemo(() => {
        const map = new Map<string, WorkerSchedule[]>();
        if (!schedules) return map;
        schedules.forEach(s => {
            const key = `${s.workerId}-${s.date}`;
            const existing = map.get(key) || [];
            map.set(key, [...existing, s]);
        });
        return map;
    }, [schedules]);

    const projectsMap = useMemo(() => {
        const map = new Map<number, Project>();
        if (!projects) return map;
        projects.forEach(p => map.set(p.id!, p));
        return map;
    }, [projects]);


    const changeWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };
    
    const handleDragStart = (e: React.DragEvent, type: 'new' | 'move', data: { projectId?: number; scheduleId?: number }) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type, ...data }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-gray-600/50');
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('bg-gray-600/50');
    }

    const handleDrop = async (e: React.DragEvent, workerId: number, date: string) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-600/50');
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        
        try {
            if (data.type === 'new') {
                const existingSchedules = scheduleMap.get(`${workerId}-${date}`) || [];
                if (existingSchedules.some(s => s.projectId === data.projectId)) {
                    toast.error('Tento projekt je již pro tento den přiřazen.');
                    return;
                }
                await db.workerSchedules.add({ workerId, date, projectId: data.projectId });
                toast.success('Projekt přiřazen.');
            } else if (data.type === 'move') {
                await db.workerSchedules.update(data.scheduleId, { workerId, date });
                toast.success('Přiřazení přesunuto.');
            }
        } catch(error) {
            console.error("Failed to update schedule:", error);
            toast.error('Aktualizace se nezdařila.');
        }
    };
    
    const handleDelete = async (scheduleId: number) => {
        await db.workerSchedules.delete(scheduleId);
        toast.success('Přiřazení smazáno.');
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6">
            <Toaster position="bottom-center" />
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-white">Týdenní plán</h1>
                    <div className="flex items-center gap-4">
                         <h2 className="text-xl font-semibold text-white">
                            {weekDays[0].toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })} - {weekDays[6].toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                         </h2>
                        <button onClick={() => changeWeek('prev')} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600">&lt;</button>
                        <button onClick={() => changeWeek('next')} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600">&gt;</button>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                    <div className="grid grid-cols-[150px_repeat(7,1fr)] min-w-[900px]">
                        {/* Header */}
                        <div className="sticky left-0 bg-gray-800 z-10"></div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="text-center font-semibold p-3 border-b border-gray-700">
                                <div className="text-white capitalize">{day.toLocaleDateString('cs-CZ', { weekday: 'long' })}</div>
                                <div className="text-gray-400 text-sm">{day.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}</div>
                            </div>
                        ))}

                        {/* Body */}
                        {workers?.map(worker => (
                            <React.Fragment key={worker.id}>
                                <div className="sticky left-0 bg-gray-800 p-3 border-r border-b border-gray-700 z-10 font-bold text-white flex items-center">
                                    <div style={{ backgroundColor: worker.color }} className="w-3 h-3 rounded-full mr-2"></div>
                                    {worker.name}
                                </div>
                                {weekDays.map(day => {
                                    const dateStr = formatDate(day);
                                    const schedulesForCell = scheduleMap.get(`${worker.id}-${dateStr}`) || [];
                                    
                                    return (
                                        <div 
                                            key={dateStr}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, worker.id!, dateStr)}
                                            className="h-24 border-b border-r border-gray-700 p-1 transition-colors duration-200 relative"
                                        >
                                            {schedulesForCell.length > 1 && (
                                                <div className="absolute top-1 right-1" title="Více projektů v jeden den">
                                                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                                                </div>
                                            )}
                                            <div className="space-y-1 h-full overflow-y-auto pr-1">
                                                {schedulesForCell.map(schedule => {
                                                    const project = projectsMap.get(schedule.projectId);
                                                    if (!project) return null;
                                                    
                                                    return (
                                                        <ProjectPill
                                                            key={schedule.id}
                                                            project={project}
                                                            scheduleId={schedule.id!}
                                                            onDelete={() => handleDelete(schedule.id!)}
                                                            onDragStart={(e) => handleDragStart(e, 'move', { scheduleId: schedule.id! })}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-full">
                    <h2 className="text-xl font-semibold text-white mb-4">Projekty</h2>
                    <div className="space-y-2">
                        {projects?.map(project => (
                            <div 
                                key={project.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, 'new', { projectId: project.id })}
                                className="p-2 rounded-lg text-white text-sm font-semibold cursor-grab"
                                style={{ backgroundColor: project.color || '#4f46e5' }}
                            >
                                {project.name}
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default Schedule;