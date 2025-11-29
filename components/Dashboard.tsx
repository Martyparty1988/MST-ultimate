import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDb } from '../hooks/useDb';
import { Link } from 'react-router-dom';
import { Project, Task, TimeRecord } from '../types';
import { ArrowRightIcon, BellIcon, ChartBarIcon, ClockIcon, FolderIcon, UserGroupIcon } from './icons/Icons';
import { GlassCard, SolarButton, SolarBadge, PageHeader } from './ui/DesignSystem';
import EarningsChart from './charts/EarningsChart';

const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; icon: React.ReactNode; color: string }> = ({ title, value, subtitle, icon, color }) => (
    <GlassCard className="flex items-start justify-between relative overflow-hidden group">
        <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 ring-1 ring-${color}-500/20 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        {/* Decorative background blur */}
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-${color}-500/20 rounded-full blur-3xl group-hover:bg-${color}-500/30 transition-colors`}></div>
    </GlassCard>
);

const Dashboard: React.FC = () => {
    const db = useDb();

    const data = useLiveQuery(async () => {
        const projects = await db.projects.where('status').equals('Active').limit(4).toArray();
        const tasks = await db.tasks.where('status').notEqual('done').limit(5).toArray();
        const timeRecords = await db.timeRecords.orderBy('createdAt').reverse().limit(5).toArray();
        const workers = await db.workers.toArray();
        const activeWorkers = workers.filter(w => w.active).length;
        
        // Calculate total hours this month (mock logic for demo)
        const totalHours = timeRecords.reduce((acc, curr) => acc + (curr.minutes || 0), 0) / 60;

        return { projects, tasks, timeRecords, workers, activeWorkers, totalHours };
    }, [db]);

    const getWorkerName = (workerId: number) => data?.workers.find(w => w.id === workerId)?.name || 'Unknown';
    const getProjectName = (projectId: number) => data?.projects.find(p => p.id === projectId)?.name || 'Unknown';

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-solar-600 to-solar-400 p-8 md:p-10 shadow-2xl shadow-solar-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <SolarBadge variant="neutral" className="bg-white/20 text-white border-white/30 backdrop-blur-md mb-3">
                            Welcome Back
                        </SolarBadge>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Solar Field Management</h1>
                        <p className="text-slate-900/70 font-medium max-w-xl">
                            Track progress, manage workers, and analyze performance with real-time insights from your active installation sites.
                        </p>
                    </div>
                    <Link to="/tracking">
                        <SolarButton className="bg-slate-900 text-white border-none shadow-xl hover:bg-slate-800">
                             <ClockIcon className="w-5 h-5 mr-2" />
                             Log Time
                        </SolarButton>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Projects" 
                    value={data?.projects?.length || 0} 
                    icon={<FolderIcon className="w-6 h-6" />}
                    color="indigo"
                />
                <StatCard 
                    title="Active Workers" 
                    value={data?.activeWorkers || 0} 
                    subtitle={`Total: ${data?.workers?.length || 0}`}
                    icon={<UserGroupIcon className="w-6 h-6" />}
                    color="green"
                />
                 <StatCard 
                    title="Hours Logged" 
                    value={Math.round(data?.totalHours || 0)} 
                    subtitle="Recent activity"
                    icon={<ClockIcon className="w-6 h-6" />}
                    color="blue"
                />
                 <StatCard 
                    title="Pending Tasks" 
                    value={data?.tasks?.length || 0} 
                    icon={<BellIcon className="w-6 h-6" />}
                    color="orange"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (Projects & Chart) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Projects Grid */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Active Projects</h2>
                            <Link to="/projects" className="text-sm text-solar-400 hover:text-solar-300 font-medium flex items-center">
                                View All <ArrowRightIcon className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data?.projects?.map((project: Project) => (
                                <Link to={`/projects/${project.id}`} key={project.id} className="block group">
                                    <GlassCard className="h-full hover:border-solar-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-2 rounded-xl bg-${project.color ? 'current' : 'indigo-500'}/10 text-${project.color ? 'current' : 'indigo-400'}`}>
                                                 <FolderIcon className="w-6 h-6" style={{ color: project.color }} />
                                            </div>
                                            <SolarBadge variant="success">Active</SolarBadge>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-solar-400 transition-colors">{project.name}</h3>
                                        <p className="text-sm text-slate-400 mb-4">{project.site || 'No location'}</p>
                                        
                                        {/* Fake Progress Bar for Visual */}
                                        <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2 overflow-hidden">
                                            <div className="bg-solar-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Progress</span>
                                            <span>45%</span>
                                        </div>
                                    </GlassCard>
                                </Link>
                            ))}
                            {(!data?.projects || data.projects.length === 0) && (
                                <div className="col-span-2 p-8 border border-dashed border-slate-700 rounded-2xl text-center text-slate-500">
                                    No active projects found.
                                </div>
                            )}
                        </div>
                    </section>
                    
                    {/* Chart Section */}
                    <section>
                         <h2 className="text-xl font-bold text-white mb-4">Earnings Overview</h2>
                         <EarningsChart />
                    </section>
                </div>

                {/* Right Column (Tasks & Activity) */}
                <div className="space-y-8">
                    
                    {/* Recent Activity */}
                    <GlassCard noPadding className="flex flex-col h-full">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1">
                             {data?.timeRecords?.map((record: TimeRecord) => (
                                <div key={record.id} className="flex items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white mr-3 border border-white/10">
                                        {getWorkerName(record.workerId).charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {getWorkerName(record.workerId)}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {record.minutes} min on {getProjectName(record.projectId)}
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-600 whitespace-nowrap">
                                        {new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            ))}
                             {(!data?.timeRecords || data.timeRecords.length === 0) && (
                                <p className="text-center text-slate-500 py-8">No recent activity.</p>
                            )}
                        </div>
                    </GlassCard>

                    {/* Tasks */}
                    <GlassCard>
                        <h2 className="text-lg font-bold text-white mb-4">Priority Tasks</h2>
                        <div className="space-y-3">
                            {data?.tasks?.map((task: Task) => (
                                <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                    <div className={`w-2 h-2 rounded-full ${task.status === 'doing' ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'}`}></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{task.title}</p>
                                        <p className="text-xs text-slate-500">Due: {task.due ? new Date(task.due).toLocaleDateString() : 'No date'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;