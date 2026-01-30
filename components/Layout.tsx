import React, { useState, useEffect } from 'react';
import { User, UserRole, SchoolSettings, ApplicationStatus } from '../types.ts';
import { MockDB } from '../services/mockDb.ts';
import { 
  LayoutDashboard, BookOpen, GraduationCap, Users, DollarSign, Menu, X, LogOut, 
  CheckCircle, TrendingUp, Briefcase, Mail, Phone, MessageCircle, Facebook, User as UserIcon,
  Maximize, Minimize, Megaphone, Settings, Globe, FileSearch
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  onGoHome: () => void;
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, onGoHome, children, activePage, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [pendingAdmissionsCount, setPendingAdmissionsCount] = useState(0);
  const LOGO_URL = "https://i.ibb.co/LzfNqjW0/femac-logo.png";

  useEffect(() => {
    const loadSettings = async () => {
      const data = await MockDB.getSchoolSettings();
      setSettings(data);
    };
    loadSettings();

    const checkPending = async () => {
      if (user.role === UserRole.EXECUTIVE_ACCOUNTS) {
        try {
          const students = await MockDB.getStudents();
          const pending = students.filter(s => s.applicationStatus === ApplicationStatus.PENDING).length;
          setPendingAdmissionsCount(pending);
        } catch (err) {
          console.error("Layout Sync Error:", err);
        }
      }
    };
    
    checkPending();
    const interval = setInterval(checkPending, 15000); // Poll every 15s for "channel" feel

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearInterval(interval);
    };
  }, [user.role]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const getNavItems = (role: UserRole) => {
    switch (role) {
      case UserRole.TEACHER:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'gradebook', label: 'Gradebook', icon: BookOpen },
        ];
      case UserRole.EXAMS_OFFICE:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'approvals', label: 'Grade Approvals', icon: CheckCircle },
        ];
      case UserRole.PARENT:
        return [
          { id: 'results', label: 'Student Results', icon: GraduationCap },
          { id: 'fees', label: 'Fees Portal', icon: DollarSign },
        ];
      case UserRole.PUPIL:
        return [
          { id: 'dashboard', label: 'Student Center', icon: LayoutDashboard },
          { id: 'classes', label: 'My Classes', icon: BookOpen },
        ];
      case UserRole.EXECUTIVE_ACCOUNTS:
        return [
          { id: 'financials', label: 'Financials', icon: DollarSign },
          { id: 'admissions', label: 'Admissions', icon: FileSearch, badge: pendingAdmissionsCount },
          { id: 'messages', label: 'Executive Chat', icon: MessageCircle },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'staff', label: 'Staffing', icon: Briefcase },
          { id: 'growth', label: 'Growth', icon: TrendingUp },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    if (role === UserRole.EXECUTIVE_ACCOUNTS) return 'EXECUTIVE/ACCOUNTS';
    return role.replace('_', ' ');
  };

  const navItems = getNavItems(user.role);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="md:hidden bg-femac-900 text-white p-4 flex justify-between items-center shadow-md border-b border-femac-yellow/30">
        <button onClick={onGoHome} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img src={LOGO_URL} alt="Logo" className="h-10 w-10 object-contain" />
          <span className="font-extrabold text-xl tracking-tighter text-femac-yellow uppercase">FEMAC ACADEMY</span>
        </button>
        <div className="flex items-center space-x-4">
          <button onClick={toggleFullscreen} className="p-2 hover:bg-femac-800 rounded-lg text-femac-yellow transition-colors">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <aside className={`
        fixed md:sticky top-0 z-50 h-screen w-64 bg-femac-900 text-white transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 border-b border-femac-700 flex flex-col items-start">
          <button onClick={onGoHome} className="group flex flex-col items-start w-full text-left">
            <img src={LOGO_URL} alt="FEMAC Crest" className="h-20 w-20 mb-4 object-contain filter drop-shadow-[0_0_12px_rgba(250,204,21,0.4)] group-hover:scale-105 transition-transform" />
            <h1 className="text-3xl font-black tracking-tighter text-femac-yellow uppercase leading-tight group-hover:text-white transition-colors">
              FEMAC<br/>ACADEMY
            </h1>
            <p className="text-[10px] text-femac-400 mt-2 uppercase tracking-[0.2em] font-bold group-hover:text-femac-yellow transition-colors">Portal Services</p>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item: any) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all relative
                ${activePage === item.id 
                  ? 'bg-femac-800 text-white shadow-lg' 
                  : 'text-femac-200 hover:bg-femac-800 hover:text-white'}`}
            >
              <div className="flex items-center space-x-3">
                {activePage === item.id && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-femac-yellow rounded-r-full"></div>
                )}
                <item.icon size={20} className={activePage === item.id ? 'text-femac-yellow' : ''} />
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-femac-700 bg-femac-800/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-femac-700 w-10 h-10 rounded-full flex items-center justify-center border-2 border-femac-yellow shadow-md">
              <UserIcon size={20} className="text-femac-yellow" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none mb-1 uppercase tracking-tighter">FAIMS ACCESS</p>
              <p className="text-[10px] text-femac-300 uppercase tracking-wider font-bold">{getRoleDisplayName(user.role)}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-600/10 hover:bg-red-600 border border-red-600/30 hover:border-red-600 text-red-500 hover:text-white p-2.5 rounded-lg text-xs font-bold transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative flex flex-col">
        <div className="hidden md:flex absolute top-8 right-8 z-30">
          <button 
            onClick={toggleFullscreen} 
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-3 bg-white/80 backdrop-blur-md border border-slate-200 text-femac-900 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 active:scale-95 transition-all group"
          >
            {isFullscreen ? (
              <Minimize size={24} className="group-hover:text-femac-yellow transition-colors" />
            ) : (
              <Maximize size={24} className="group-hover:text-femac-yellow transition-colors" />
            )}
          </button>
        </div>

        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0">
          <img src={LOGO_URL} alt="" className="w-[500px] h-[500px] object-contain" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 flex-1 w-full">
           {children}
        </div>
        <footer className="mt-20 pt-8 border-t border-slate-200 relative z-10 max-w-7xl mx-auto w-full pb-8 text-center md:text-left">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <img src={LOGO_URL} alt="Footer Logo" className="h-6 w-6 object-contain opacity-50" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">FAIMS System Support • Zambia</p>
              </div>
              {settings && (
                <div className="flex flex-wrap justify-center md:justify-end gap-6">
                  <div className="flex items-center space-x-2 text-[8px] font-black uppercase text-slate-400 tracking-widest"><Phone size={10} className="text-femac-yellow"/><span>{settings.phone}</span></div>
                  <div className="flex items-center space-x-2 text-[8px] font-black uppercase text-slate-400 tracking-widest"><Mail size={10} className="text-femac-yellow"/><span>{settings.email}</span></div>
                </div>
              )}
           </div>
        </footer>
      </main>

      {isSidebarOpen && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />)}
    </div>
  );
};