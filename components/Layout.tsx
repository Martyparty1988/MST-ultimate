
import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import AICommandBar from './AICommandBar';
import { 
  HomeIcon, FolderIcon, UserGroupIcon, ClockIcon, ChartBarIcon, 
  DocumentArrowDownIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon, 
  LightBulbIcon, ClipboardDocumentListIcon, CalendarDaysIcon 
} from './icons/Icons';
import { useSettings } from '../contexts/SettingsContext';

// Navigation configuration
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Workers', href: '/workers', icon: UserGroupIcon },
  { name: 'Assignments', href: '/assignments', icon: ClipboardDocumentListIcon },
  { name: 'Schedule', href: '/schedule', icon: CalendarDaysIcon },
  { name: 'Time Tracking', href: '/tracking', icon: ClockIcon },
  { name: 'Tasks', href: '/tasks', icon: ChartBarIcon },
  { name: 'AI Insights', href: '/insights', icon: LightBulbIcon },
  { name: 'Data Import', href: '/import', icon: DocumentArrowDownIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface NavLinkItemProps {
    item: typeof navItems[0];
    onClick?: () => void;
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({ item, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(item.href);
    return (
    <NavLink
        to={item.href}
        onClick={onClick}
        className={`
        group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
        ${isActive 
            ? 'bg-gradient-to-r from-solar-600/20 to-solar-400/10 text-solar-400 border border-solar-500/20 shadow-lg shadow-solar-500/5' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }
        `}
    >
        <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-solar-400' : 'text-slate-500 group-hover:text-white'}`} />
        {item.name}
    </NavLink>
    );
};

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { enableAdminMode } = useSettings();
    const [logoClickCount, setLogoClickCount] = useState(0);

    const handleLogoClick = () => {
        setLogoClickCount(prev => {
            const newCount = prev + 1;
            if (newCount === 5) {
                enableAdminMode();
                setLogoClickCount(0);
            }
            return newCount;
        });
    };

    return (
      <div className="h-screen w-full flex overflow-hidden bg-slate-950 relative">
        
        {/* GLOBAL BACKGROUND EFFECTS */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Top Right Solar Glow */}
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-solar-600/5 blur-[120px]"></div>
          {/* Bottom Left Cool Glow */}
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-slate-800/10 blur-[100px]"></div>
        </div>

        {/* MOBILE SIDEBAR (Drawer) */}
        <div className={`fixed inset-0 flex z-50 md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-white/10 shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setSidebarOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-6 mb-6" onClick={handleLogoClick}>
                 <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-solar-500 to-solar-700 mr-3 flex items-center justify-center shadow-lg shadow-solar-500/30">
                    <span className="text-slate-900 font-bold text-lg">M</span>
                 </div>
                 <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                   MST Ultimate
                 </span>
              </div>
              <nav className="px-3 space-y-1">
                {navItems.map((item) => (
                   <NavLinkItem key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:flex md:flex-shrink-0 z-20">
          <div className="flex flex-col w-72">
            <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border-r border-white/5">
              
              {/* Logo Area */}
              <div className="flex items-center h-20 flex-shrink-0 px-6 border-b border-white/5 cursor-pointer" onClick={handleLogoClick}>
                 <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-solar-400 to-solar-600 flex items-center justify-center shadow-lg shadow-solar-500/20 mr-3">
                    <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <span className="text-lg font-bold text-white tracking-tight">MST Ultimate</span>
              </div>

              {/* Nav Items */}
              <div className="flex-1 flex flex-col overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                {navItems.map((item) => (
                  <NavLinkItem key={item.name} item={item} />
                ))}
              </div>

              {/* User Profile / Footer (Optional) */}
              <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="h-8 w-8 rounded-full bg-slate-700 border border-white/10"></div>
                    <div>
                        <p className="text-xs font-medium text-white">Admin User</p>
                        <p className="text-[10px] text-slate-500">Pro Version</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden z-10">
          
          {/* Mobile Header */}
          <div className="md:hidden pl-4 pt-4 pb-2 flex items-center justify-between pr-4 bg-slate-950/80 backdrop-blur-lg sticky top-0 z-40 border-b border-white/5">
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <span className="font-semibold text-white">MST Ultimate</span>
             </div>
          </div>

          <main className="flex-1 relative overflow-y-auto focus:outline-none custom-scrollbar scroll-smooth">
            {/* Added pb-32 for mobile bottom nav + AI bar space */}
            <div className="py-8 px-4 sm:px-8 lg:px-10 pb-40 md:pb-24 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
          
          {/* AI Command Bar - Positioned fixed above bottom nav on mobile */}
          <div className="fixed bottom-20 left-4 right-4 md:sticky md:bottom-0 md:left-0 md:right-0 z-40">
               <AICommandBar />
          </div>

          {/* MOBILE BOTTOM NAVIGATION */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
               {[navItems[0], navItems[1], navItems[2], navItems[9]].map((item) => (
                   <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => `
                       flex flex-col items-center justify-center w-full h-full space-y-1
                       ${isActive ? 'text-solar-400' : 'text-slate-500 hover:text-slate-300'}
                    `}
                   >
                     <item.icon className="h-6 w-6" />
                     <span className="text-[10px] font-medium">{item.name}</span>
                   </NavLink>
               ))}
            </div>
          </div>

        </div>
      </div>
    );
};

export default Layout;
