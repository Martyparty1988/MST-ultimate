import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDb } from '../hooks/useDb';
import { Project, ProjectStatus } from '../types';
import { Link } from 'react-router-dom';
import { GlassCard, SolarButton, SolarBadge, GlassInput, PageHeader } from './ui/DesignSystem';
import { FolderIcon, UserGroupIcon, ClockIcon } from './icons/Icons';

const Projects: React.FC = () => {
  const db = useDb();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSite, setNewProjectSite] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const projects = useLiveQuery(() => db.projects.toArray(), [db]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      name: newProjectName,
      site: newProjectSite,
      status: 'Active',
      createdAt: Date.now(),
      // Assign a random solar color for UI
      color: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 5)]
    };

    try {
      await db.projects.add(newProject);
      setNewProjectName('');
      setNewProjectSite('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <GlassCard className="group h-full flex flex-col hover:border-solar-500/50 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
             <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: project.color || '#f59e0b', boxShadow: `0 4px 20px -5px ${project.color || '#f59e0b'}80` }}
             >
                 <FolderIcon className="w-6 h-6" />
             </div>
             <SolarBadge variant={project.status === 'Active' ? 'success' : project.status === 'Done' ? 'info' : 'neutral'}>
                 {project.status}
             </SolarBadge>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-solar-400 transition-colors">
            {project.name}
        </h3>
        <p className="text-sm text-slate-400 mb-6 flex-grow">
            {project.site || 'Remote Site'}
        </p>

        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mb-4">
             <div className="flex items-center text-slate-400 text-xs">
                 <UserGroupIcon className="w-4 h-4 mr-2" />
                 <span>-- Workers</span>
             </div>
             <div className="flex items-center text-slate-400 text-xs">
                 <ClockIcon className="w-4 h-4 mr-2" />
                 <span>{new Date(project.createdAt).toLocaleDateString()}</span>
             </div>
        </div>

        <Link to={`/projects/${project.id}`} className="w-full">
            <SolarButton variant="secondary" className="w-full justify-center group-hover:bg-solar-500 group-hover:text-slate-900 group-hover:border-solar-500">
                View Details
            </SolarButton>
        </Link>
    </GlassCard>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Projects" 
        subtitle="Manage your installation sites and track progress."
        action={
            <SolarButton onClick={() => setShowAddForm(!showAddForm)} icon={<span>+</span>}>
                New Project
            </SolarButton>
        }
      />
      
      {showAddForm && (
        <div className="mb-8 animate-slide-down">
            <GlassCard className="border-solar-500/30">
                <h3 className="text-lg font-bold text-white mb-4">Create New Project</h3>
                <form onSubmit={handleAddProject} className="flex flex-col md:flex-row gap-4 items-end">
                    <GlassInput
                        placeholder="Project Name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        required
                    />
                    <GlassInput
                        placeholder="Location / Site (Optional)"
                        value={newProjectSite}
                        onChange={(e) => setNewProjectSite(e.target.value)}
                    />
                    <div className="flex gap-2 w-full md:w-auto">
                        <SolarButton type="submit" className="flex-1 md:flex-none whitespace-nowrap">
                            Create Project
                        </SolarButton>
                        <SolarButton type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                            Cancel
                        </SolarButton>
                    </div>
                </form>
            </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects?.map((project) => (
              <ProjectCard key={project.id} project={project} />
          ))}
          
          {/* Add New Placeholder Card */}
          <button 
            onClick={() => setShowAddForm(true)}
            className="border-2 border-dashed border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-solar-400 hover:border-solar-500/50 hover:bg-slate-800/50 transition-all duration-300 min-h-[280px]"
          >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <span className="text-3xl font-light">+</span>
              </div>
              <span className="font-medium">Create New Project</span>
          </button>
      </div>
    </div>
  );
};

export default Projects;