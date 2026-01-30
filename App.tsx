import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, ApplicationStatus, Announcement, SchoolSettings } from './types.ts';
import { MOCK_USERS } from './constants.ts';
import { MockDB } from './services/mockDb.ts';
import { Layout } from './components/Layout.tsx';
import { TeacherPortal } from './pages/TeacherPortal.tsx';
import { ExamsPortal } from './pages/ExamsPortal.tsx';
import { ParentPortal } from './pages/ParentPortal.tsx';
import { StudentPortal } from './pages/StudentPortal.tsx';
import { ExecutiveAccountsPortal } from './pages/ExecutiveAccountsPortal.tsx';
import { 
  Key, ChevronRight, Award, Zap, Laptop, Bus, Trophy, Users, X, 
  DollarSign, FileText, ShieldCheck, ClipboardList, Info, Target, 
  Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, BookOpen, GraduationCap, 
  Microscope, Languages, Calculator, FlaskConical, Globe2,
  FileEdit, UserPlus, CreditCard, Smartphone, Landmark, Copy,
  User as UserIcon, Calendar, School, Phone, Mail, MapPin, Upload, Download, UploadCloud,
  Home, Lock, MessageCircle, Facebook, Hash, Map, UserCheck, Search, SearchCode,
  CheckCircle, XCircle, Clock, FileCheck, Briefcase, IdCard, Star, Timer, ShieldAlert,
  ChevronLeft, Megaphone, CalendarClock, RotateCw, Volume2, VolumeX, Loader2, Send, Cpu, Database
} from 'lucide-react';

const getRoleDisplayLabel = (role: UserRole) => {
  if (role === UserRole.EXECUTIVE_ACCOUNTS) return 'EXECUTIVE / ACCOUNTS';
  return role.replace('_', ' ');
};

const AnnouncementSlideshow: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = await MockDB.getAnnouncements();
      setAnnouncements(data);
    };
    load();
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (announcements.length > 0 ? (prev + 1) % announcements.length : 0));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <section className="py-24 px-6 bg-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="relative z-10">
            <h2 className="text-sm font-black text-femac-yellow uppercase tracking-[0.4em] mb-3">Notice Board</h2>
            <h3 className="text-5xl font-black text-white tracking-tighter leading-none uppercase">School <span className="text-femac-yellow">Broadcasts</span></h3>
          </div>
          <div className="flex items-center space-x-4 relative z-10">
             <button onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)} className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-sm active:scale-95"><ChevronLeft size={24}/></button>
             <button onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)} className="w-14 h-14 rounded-2xl bg-femac-yellow text-femac-900 flex items-center justify-center hover:bg-white transition-all shadow-xl active:scale-95"><ChevronRight size={24}/></button>
          </div>
        </div>

        <div className="relative h-[700px] rounded-[4rem] overflow-hidden shadow-2xl bg-femac-800 group" key={current.id}>
           {current.imageUrl ? (
             <>
               <img src={current.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[15s] ease-linear" alt={current.title} />
               <div className="absolute inset-0 bg-gradient-to-t from-femac-900 via-femac-900/40 to-transparent"></div>
             </>
           ) : (
             <div className="absolute inset-0 flex items-center justify-center opacity-5">
               <Megaphone size={300} className="text-white" />
             </div>
           )}

           <div className="absolute inset-0 p-12 md:p-24 flex flex-col justify-end">
              <div className="max-w-3xl animate-in slide-in-from-bottom-10 duration-700">
                <div className="flex items-center space-x-4 mb-6">
                  <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${current.priority === 'URGENT' ? 'bg-red-600 text-white animate-pulse' : 'bg-femac-yellow text-femac-900'}`}>
                    {current.priority === 'URGENT' ? 'Urgent Alert' : 'Registry Notice'}
                  </span>
                  <span className="text-xs font-black text-white/60 uppercase tracking-widest">{current.date}</span>
                </div>
                <h4 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8">
                  {current.title}
                </h4>
                <p className="text-xl md:text-3xl text-femac-100 font-medium leading-tight mb-12 opacity-90 max-w-2xl">
                  {current.content}
                </p>
                <div className="flex items-center space-x-3">
                   {announcements.map((_, idx) => (
                     <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-16 bg-femac-yellow' : 'w-4 bg-white/20 hover:bg-white/40'}`}></button>
                   ))}
                </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'website' | 'login' | 'portal'>('website');
  const [activePage, setActivePage] = useState('dashboard');
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  
  // Login Sub-States
  const [loginStep, setLoginStep] = useState<'role' | 'grade' | 'password'>('role');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // Admission States
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [activeAdmissionTab, setActiveAdmissionTab] = useState<'fees' | 'form' | 'tracker' | 'policy'>('fees');
  const [transmissionStep, setTransmissionStep] = useState<'IDLE' | 'ENCRYPTING' | 'GENERATING_CERT' | 'TRANSMITTING' | 'FINALIZING'>('IDLE');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);

  // Form Field States
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formPrevSchool, setFormPrevSchool] = useState('');
  const [formGuardianName, setFormGuardianName] = useState('');
  const [formParentNrc, setFormParentNrc] = useState('');
  const [formRelationship, setFormRelationship] = useState('');
  const [formOccupation, setFormOccupation] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formEmergencyName, setFormEmergencyName] = useState('');
  const [formEmergencyPhone, setFormEmergencyPhone] = useState('');

  // Tracker State
  const [trackerSearchTerm, setTrackerSearchTerm] = useState('');
  const [trackedApplication, setTrackedApplication] = useState<any>(null);

  const LOGO_URL = "https://i.ibb.co/LzfNqjW0/femac-logo.png";

  useEffect(() => {
    const loadData = async () => {
      const schoolSettings = await MockDB.getSchoolSettings();
      setSettings(schoolSettings);
    };
    loadData();
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    if (role === UserRole.TEACHER) {
      setLoginStep('grade');
    } else if (role === UserRole.EXAMS_OFFICE || role === UserRole.EXECUTIVE_ACCOUNTS) {
      const foundUser = MOCK_USERS.find(u => u.role === role);
      if (foundUser) {
        setPendingUser(foundUser);
        setLoginStep('password');
        setLoginError(false);
        setPassword('');
      }
    } else {
      const foundUser = MOCK_USERS.find(u => u.role === role);
      if (foundUser) {
        setUser(foundUser);
        setView('portal');
        if (role === UserRole.PARENT) {
          setActivePage('results');
        } else {
          setActivePage('dashboard');
        }
      }
    }
  };

  const handleGradeSelect = (teacherId: string) => {
    const foundUser = MOCK_USERS.find(u => u.id === teacherId);
    if (foundUser) {
      setPendingUser(foundUser);
      setLoginStep('password');
      setLoginError(false);
      setPassword('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const AUTH_KEY = 'Chikuni1';
    if (pendingUser && password === AUTH_KEY) {
      setUser(pendingUser);
      setView('portal');
      if (pendingUser.role === UserRole.EXECUTIVE_ACCOUNTS) {
        setActivePage('financials');
      } else if (pendingUser.role === UserRole.PARENT) {
        setActivePage('results');
      } else {
        setActivePage('dashboard');
      }
      setPendingUser(null);
      setLoginStep('role');
      setPassword('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    setPendingUser(null);
    setLoginStep('role');
    setPassword('');
    setShowPassword(false);
  };

  const handleGoHome = () => {
    setView('website');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransmissionStep('ENCRYPTING');
    
    await new Promise(r => setTimeout(r, 800));
    setTransmissionStep('GENERATING_CERT');
    await new Promise(r => setTimeout(r, 1200));
    setTransmissionStep('TRANSMITTING');

    try {
        const newStudent = await MockDB.createStudent({
            firstName: formFirstName,
            lastName: formLastName,
            gender: formGender,
            grade: parseInt(formGrade),
            dob: formDob,
            previousSchool: formPrevSchool,
            guardianName: formGuardianName,
            parentNrc: formParentNrc,
            relationship: formRelationship,
            occupation: formOccupation,
            phone: formPhone,
            email: formEmail,
            address: formAddress,
            emergencyName: formEmergencyName,
            emergencyPhone: formEmergencyPhone,
            parentId: 'U-PAR-PROSPECT'
        });
        
        await new Promise(r => setTimeout(r, 1500));
        setTransmissionStep('FINALIZING');
        await new Promise(r => setTimeout(r, 800));

        setLastSubmissionId(newStudent.id);
        setFormSubmitted(true);
        // Clear fields
        setFormFirstName(''); setFormLastName(''); setFormGender(''); setFormGrade(''); setFormDob(''); setFormPrevSchool('');
        setFormGuardianName(''); setFormParentNrc(''); setFormRelationship(''); setFormOccupation(''); 
        setFormPhone(''); setFormEmail(''); setFormAddress('');
        setFormEmergencyName(''); setFormEmergencyPhone('');
    } catch (err) {
        console.error(err);
        alert("Transmission to Executive Registry Failed. Check Node connection.");
    } finally {
        setTransmissionStep('IDLE');
    }
  };

  const handleTrackApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await MockDB.getStudentById(trackerSearchTerm.toUpperCase());
    setTrackedApplication(result || 'NOT_FOUND');
  };

  const closeAdmissionRegistry = () => {
    setShowAdmissionModal(false);
    setActiveAdmissionTab('fees');
    setFormSubmitted(false);
    setTrackerSearchTerm('');
    setTrackedApplication(null);
    setTransmissionStep('IDLE');
  };

  if (view === 'login') {
    const rolesToShow = [UserRole.PUPIL, UserRole.PARENT, UserRole.TEACHER, UserRole.EXAMS_OFFICE, UserRole.EXECUTIVE_ACCOUNTS];
    const teacherUserIds = ['U-TEA-G1', 'U-TEA-G2', 'U-TEA-G3', 'U-TEA-G4', 'U-TEA-G5', 'U-TEA-G6', 'U-TEA-G7', 'U-TEA-F1'];
    const teacherUsers = MOCK_USERS.filter(u => teacherUserIds.includes(u.id));
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
          <img src={LOGO_URL} alt="" className="w-[800px] h-[800px] object-contain" />
        </div>
        <div className="bg-white rounded-[3rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative z-10 border border-white/40">
           <div className="md:w-1/2 bg-femac-900 p-16 text-white flex flex-col justify-center relative overflow-hidden">
             <div className="absolute -top-24 -left-24 w-72 h-72 bg-femac-yellow opacity-10 rounded-full blur-[120px]"></div>
             <button onClick={() => { setView('website'); setPendingUser(null); setLoginStep('role'); }} className="absolute top-10 left-10 text-femac-400 hover:text-white flex items-center text-xs font-black uppercase tracking-[0.25em] transition-all group">
               <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Return Home
             </button>
             <div className="mb-12">
               <img src={LOGO_URL} alt="Logo" className="w-40 h-40 mb-10 object-contain filter drop-shadow-[0_0_24px_rgba(250,204,21,0.3)]" />
               <h1 className="text-7xl font-black mb-2 tracking-tighter relative text-femac-yellow leading-none uppercase">FAIMS<span className="text-white">.</span></h1>
               <p className="text-femac-300 text-lg font-black uppercase tracking-[0.4em] opacity-80">Portal Access</p>
             </div>
           </div>
           <div className="md:w-1/2 p-16 flex flex-col justify-center bg-white/95 backdrop-blur-sm relative">
             {loginStep === 'role' ? (
               <>
                 <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter">System Access.</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Select an authorized role to proceed</p>
                 <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                   {rolesToShow.map(role => (
                     <button key={role} onClick={() => handleRoleSelect(role)} className="w-full flex items-center justify-between p-6 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow hover:bg-yellow-50/50 transition-all group active:scale-[0.98] shadow-sm hover:shadow-lg">
                       <div className="flex items-center space-x-5">
                          <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-femac-yellow transition-colors"><Key size={22} className="text-slate-500 group-hover:text-femac-900 transition-colors"/></div>
                          <div className="text-left"><p className="font-black text-xl text-slate-800 group-hover:text-femac-900 leading-none mb-1 uppercase tracking-tight">{getRoleDisplayLabel(role)}</p><p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black">Authorized Portal</p></div>
                       </div>
                       <ChevronRight className="text-slate-300 group-hover:text-femac-900 group-hover:translate-x-1 transition-all" size={24} />
                     </button>
                   ))}
                 </div>
               </>
             ) : loginStep === 'grade' ? (
               <div className="animate-in slide-in-from-right duration-300">
                 <button onClick={() => setLoginStep('role')} className="mb-8 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-femac-900 transition-colors"><ArrowLeft size={14} className="mr-2" /> Return to Roles</button>
                 <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter uppercase leading-none">Teacher <span className="text-femac-yellow">Registry</span></h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Identify your assigned Grade Level</p>
                 <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {teacherUsers.map(u => (
                      <button key={u.id} onClick={() => handleGradeSelect(u.id)} className="w-full flex items-center justify-between p-5 border-2 border-slate-100 rounded-[1.5rem] hover:border-femac-yellow hover:bg-yellow-50/50 transition-all group active:scale-[0.98] shadow-sm">
                        <div className="flex items-center space-x-5">
                           <div className="bg-femac-900 p-3 rounded-xl group-hover:bg-femac-yellow transition-colors"><School size={18} className="text-femac-yellow group-hover:text-femac-900 transition-colors"/></div>
                           <p className="font-black text-lg text-slate-800 uppercase tracking-tight">{u.name}</p>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-femac-900" size={20} />
                      </button>
                   ))}
                 </div>
               </div>
             ) : (
               <div className="animate-in slide-in-from-right duration-300">
                 <button onClick={() => { if (pendingUser?.role === UserRole.TEACHER) setLoginStep('grade'); else setLoginStep('role'); }} className="mb-8 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-femac-900 transition-colors"><ArrowLeft size={14} className="mr-2" /> {pendingUser?.role === UserRole.TEACHER ? 'Change Grade' : 'Return to Roles'}</button>
                 <div className="flex items-center space-x-5 mb-10">
                    <div className="w-20 h-20 bg-femac-900 rounded-2xl border-4 border-femac-yellow flex items-center justify-center text-femac-yellow font-black text-2xl uppercase">
                      <UserIcon size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 leading-none mb-1 uppercase tracking-tight">{pendingUser?.name}</h2>
                      <p className="text-[10px] text-femac-500 uppercase tracking-[0.3em] font-black">Personal Registry Secure Key</p>
                    </div>
                 </div>
                 <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">
                         <Lock size={12} className="mr-1 text-femac-yellow" /> Personal Access Password
                       </label>
                       <div className="relative">
                          <input 
                            required autoFocus type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                            className={`w-full p-5 pr-14 bg-slate-50 border-2 rounded-2xl focus:ring-4 focus:ring-femac-yellow/10 outline-none font-bold text-slate-700 transition-all ${loginError ? 'border-red-500' : 'border-slate-100 focus:border-femac-yellow'}`}
                            placeholder="••••••••"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-femac-900">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                       </div>
                    </div>
                    {loginError && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2 flex items-center"><AlertCircle size={12} className="mr-1" /> Authentication Failed.</p>}
                    <button type="submit" className="w-full bg-femac-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-femac-800 transition-all transform active:scale-95 flex items-center justify-center space-x-3"><span>Grant Access</span><ShieldCheck size={20} className="text-femac-yellow" /></button>
                 </form>
               </div>
             )}
           </div>
        </div>
      </div>
    );
  }

  if (view === 'portal' && user) {
    const renderContent = () => {
      if (user.role === UserRole.TEACHER) return <TeacherPortal currentUser={user} />;
      if (user.role === UserRole.EXAMS_OFFICE) return <ExamsPortal />;
      if (user.role === UserRole.PARENT) return <ParentPortal activePage={activePage} />;
      if (user.role === UserRole.PUPIL) return <StudentPortal />;
      if (user.role === UserRole.EXECUTIVE_ACCOUNTS) return <ExecutiveAccountsPortal activePage={activePage} />;
      return <div className="p-10 text-center"><h2 className="text-3xl font-black text-slate-300 uppercase tracking-widest mt-20">Access Restricted</h2></div>;
    };
    return <Layout user={user} onLogout={handleLogout} onGoHome={handleGoHome} activePage={activePage} onNavigate={setActivePage}>{renderContent()}</Layout>;
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
        <img src={LOGO_URL} alt="" className="w-[800px] h-[800px] object-contain rotate-12" />
      </div>

      <nav className="fixed top-0 w-full bg-femac-900/95 backdrop-blur-md text-white z-50 shadow-lg border-b border-femac-yellow/20">
        <div className="px-6 py-4 flex justify-between items-center">
          <button onClick={handleGoHome} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <img src={LOGO_URL} alt="FEMAC Logo" className="h-14 w-14 object-contain" />
            <div className="flex flex-col text-left">
              <span className="text-3xl font-black tracking-tighter text-femac-yellow leading-none uppercase">FEMAC ACADEMY</span>
              <span className="text-[11px] tracking-[0.25em] text-femac-300 font-black uppercase">Dedicated to Excellence</span>
            </div>
          </button>
          <div className="hidden lg:flex items-center space-x-8 text-xs font-black uppercase tracking-widest text-femac-100">
            <button onClick={() => setShowCalendarModal(true)} className="flex items-center text-femac-yellow hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Calendar size={14} className="mr-2" /> Calendar
            </button>
          </div>
          <button onClick={() => setView(user ? 'portal' : 'login')} className="bg-femac-yellow text-femac-900 px-8 py-2.5 rounded-full font-black text-sm hover:scale-105 transition-all shadow-xl flex items-center">
            {user ? 'Back to Portal' : 'Portal Login'} <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </nav>

      <header className="pt-44 pb-24 px-6 bg-femac-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-femac-yellow/5 skew-x-12 transform translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="md:w-1/2">
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
              FEMAC <span className="text-femac-yellow">ACADEMY</span>
            </h1>
            <p className="text-xl text-femac-200 mb-12 leading-relaxed max-w-xl font-medium">
              Zambia's premier integrated learning environment combining academic rigor with world-class character development.
            </p>
            <div className="flex flex-wrap gap-6">
              <button onClick={() => setShowAdmissionModal(true)} className="bg-femac-yellow text-femac-900 px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-white transition-all transform hover:-translate-y-1">
                Enroll Your Child
              </button>
            </div>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-6">
             <div className="space-y-6">
                <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=400" className="rounded-[2.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" alt="Students" />
                <div className="bg-femac-800 p-8 rounded-[2rem] border border-femac-700 shadow-2xl">
                  <Award className="text-femac-yellow mb-3" size={44} />
                  <h4 className="font-black text-2xl text-white">Top 1% Rank</h4>
                  <p className="text-sm text-femac-400 font-bold">National Exam Excellence</p>
                </div>
             </div>
             <div className="space-y-6 mt-16">
                <div className="bg-femac-yellow text-femac-900 p-8 rounded-[2rem] shadow-2xl">
                  <Users className="mb-3" size={44} />
                  <h4 className="font-black text-2xl">2,500+ Alumni</h4>
                  <p className="text-sm font-bold opacity-70">Global Impact Network</p>
                </div>
                <img src="https://images.unsplash.com/photo-1523050335392-93851179ae22?auto=format&fit=crop&q=80&w=400" className="rounded-[2.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" alt="Campus" />
             </div>
          </div>
        </div>
      </header>

      {showAdmissionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-femac-900/90 backdrop-blur-xl animate-in fade-in duration-300">
           {transmissionStep !== 'IDLE' && (
              <div className="absolute inset-0 z-[150] flex items-center justify-center bg-femac-900/80 backdrop-blur-md text-white p-12">
                  <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 border-4 border-femac-yellow/20 rounded-full"></div>
                        <div className={`absolute inset-0 border-t-4 border-femac-yellow rounded-full animate-spin`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {transmissionStep === 'TRANSMITTING' ? <UploadCloud size={40} className="text-femac-yellow animate-bounce" /> : <Cpu size={40} className="text-femac-yellow animate-pulse" />}
                        </div>
                      </div>
                      <div>
                          <h4 className="text-3xl font-black tracking-tighter uppercase mb-2">Secure Link</h4>
                          <p className="text-femac-400 font-black uppercase text-[10px] tracking-[0.3em]">
                            {transmissionStep === 'ENCRYPTING' && 'Encrypting Application Node...'}
                            {transmissionStep === 'GENERATING_CERT' && 'Generating Virtual Registry File...'}
                            {transmissionStep === 'TRANSMITTING' && 'Uploading instantly to Executive Node...'}
                            {transmissionStep === 'FINALIZING' && 'Verifying Integrity & Syncing...'}
                          </p>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full bg-femac-yellow transition-all duration-[1s] ease-out ${transmissionStep === 'ENCRYPTING' ? 'w-1/5' : transmissionStep === 'GENERATING_CERT' ? 'w-2/5' : transmissionStep === 'TRANSMITTING' ? 'w-4/5' : 'w-full'}`}></div>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-femac-300">
                         <Database size={14} />
                         <span className="text-[8px] font-black uppercase tracking-widest">Authorized Supabase Encrypted Channel</span>
                      </div>
                  </div>
              </div>
           )}
           
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in duration-300">
              <button onClick={closeAdmissionRegistry} className="absolute top-10 right-10 z-[110] text-slate-300 hover:text-femac-900 transition-colors p-2"><X size={32} /></button>
              
              <div className="flex-1 flex flex-col md:flex-row h-full">
                <div className="md:w-1/3 bg-slate-50 border-r border-slate-100 p-12 flex flex-col">
                  <div className="flex items-center space-x-4 mb-12">
                    <img src={LOGO_URL} alt="Logo" className="w-16 h-16" />
                    <h4 className="text-2xl font-black text-femac-900 tracking-tighter uppercase leading-none">Admission<br/><span className="text-femac-yellow">Registry</span></h4>
                  </div>
                  
                  <nav className="space-y-4 flex-1">
                    {[
                      { id: 'fees', label: 'Fee Structure', icon: DollarSign },
                      { id: 'form', label: 'Apply Now', icon: UserPlus },
                      { id: 'tracker', label: 'Track Application', icon: SearchCode },
                      { id: 'policy', label: 'Guidelines', icon: ShieldCheck }
                    ].map(tab => (
                      <button 
                        key={tab.id} 
                        onClick={() => setActiveAdmissionTab(tab.id as any)}
                        className={`w-full flex items-center space-x-4 px-8 py-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${activeAdmissionTab === tab.id ? 'bg-femac-900 text-white shadow-2xl scale-105' : 'text-slate-400 hover:bg-slate-100 hover:text-femac-900'}`}
                      >
                        <tab.icon size={20} />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>

                  <div className="mt-auto bg-femac-900 p-8 rounded-[2rem] text-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-femac-yellow mb-2">Support Desk</p>
                    <div className="flex items-center space-x-3 text-xs mb-3 font-bold"><Phone size={14} /> <span>{settings?.phone || '+260 972 705 347'}</span></div>
                    <div className="flex items-center space-x-3 text-xs font-bold"><Mail size={14} /> <span>{settings?.email || 'admissions@femac.edu.zm'}</span></div>
                  </div>
                </div>

                <div className="flex-1 p-16 overflow-y-auto custom-scrollbar bg-white">
                  {activeAdmissionTab === 'fees' && (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                      <h5 className="text-4xl font-black text-femac-900 tracking-tighter uppercase mb-2">Academic <span className="text-femac-yellow">Investment</span></h5>
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em] mb-12">2026 Registry Billing Structure</p>
                      
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          { level: 'Primary Division', grades: 'Grades 1-7', fee: 'K3,500', icon: BookOpen },
                          { level: 'Junior Secondary', grades: 'Grades 8-9', fee: 'K4,800', icon: Microscope },
                          { level: 'Senior Secondary', grades: 'Grades 10-12', fee: 'K6,200', icon: GraduationCap }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-femac-yellow hover:shadow-xl transition-all">
                            <div className="flex items-center space-x-6">
                              <div className="p-4 bg-white rounded-2xl text-femac-900 shadow-sm group-hover:bg-femac-900 group-hover:text-femac-yellow transition-colors"><item.icon size={24} /></div>
                              <div>
                                <p className="font-black text-xl text-femac-900 uppercase tracking-tight">{item.level}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.grades}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Per Term</p>
                              <p className="text-3xl font-black text-femac-900 tracking-tighter">{item.fee}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-12 bg-femac-50 p-8 rounded-[2rem] border-2 border-dashed border-femac-100">
                        <div className="flex items-start space-x-4">
                          <Info className="text-femac-900 mt-1" size={24} />
                          <div>
                            <p className="font-black text-femac-900 uppercase text-sm mb-2">Note to Parents</p>
                            <p className="text-xs text-slate-500 font-medium leading-loose">Fees are inclusive of all academic resources, laboratory access, and basic sports participation. Admission fees are one-time and payable upon successful acceptance into the registry node.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeAdmissionTab === 'form' && (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                      {formSubmitted ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl border-2 border-green-100"><CheckCircle2 size={56} /></div>
                          <h5 className="text-4xl font-black text-femac-900 tracking-tighter uppercase mb-4">Application Synchronized</h5>
                          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-12 max-w-sm mx-auto">Your file was transmitted instantly to the Executive Review node. Use your Registry ID to track progress.</p>
                          <div className="bg-slate-900 p-8 rounded-[2rem] text-white w-full max-w-sm mb-12">
                            <p className="text-[9px] font-black text-femac-yellow uppercase tracking-[0.4em] mb-2">Assigned Registry ID</p>
                            <p className="text-4xl font-black tracking-tighter">{lastSubmissionId}</p>
                          </div>
                          <button onClick={() => setFormSubmitted(false)} className="px-10 py-5 bg-femac-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-femac-yellow hover:text-femac-900 transition-all">Submit Another Application</button>
                        </div>
                      ) : (
                        <>
                          <h5 className="text-4xl font-black text-femac-900 tracking-tighter uppercase mb-2">Enroll Your <span className="text-femac-yellow">Child</span></h5>
                          <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em] mb-12">Official 2026 Academic Enrollment Form</p>
                          
                          <form onSubmit={handleFormSubmit} className="space-y-12">
                            <div className="space-y-8">
                               <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
                                  <div className="bg-femac-900 p-2 rounded-lg text-femac-yellow"><UserIcon size={16} /></div>
                                  <h6 className="font-black uppercase text-xs tracking-[0.2em] text-femac-900">1. Student Identification</h6>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">First Name</label>
                                    <input required value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="e.g. PETER" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Last Name</label>
                                    <input required value={formLastName} onChange={(e) => setFormLastName(e.target.value)} type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="e.g. MWAMBA" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Gender</label>
                                    <select required value={formGender} onChange={(e) => setFormGender(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm appearance-none">
                                      <option value="">Select Gender...</option>
                                      <option value="MALE">MALE</option>
                                      <option value="FEMALE">FEMALE</option>
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Grade Applying For</label>
                                    <select required value={formGrade} onChange={(e) => setFormGrade(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm appearance-none">
                                      <option value="">Select Grade...</option>
                                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Date of Birth</label>
                                    <input required value={formDob} onChange={(e) => setFormDob(e.target.value)} type="date" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Previous School</label>
                                    <input required value={formPrevSchool} onChange={(e) => setFormPrevSchool(e.target.value)} type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="e.g. Katuba Primary" />
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-8">
                               <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
                                  <div className="bg-femac-900 p-2 rounded-lg text-femac-yellow"><ShieldCheck size={16} /></div>
                                  <h6 className="font-black uppercase text-xs tracking-[0.2em] text-femac-900">2. Parent / Guardian Details</h6>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Guardian Name</label>
                                    <input required value={formGuardianName} onChange={(e) => setFormGuardianName(e.target.value)} type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="e.g. SARAH MWAMBA" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">NRC Number</label>
                                    <input required value={formParentNrc} onChange={(e) => setFormParentNrc(e.target.value)} type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="e.g. 123456/11/1" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Relationship</label>
                                    <input required value={formRelationship} onChange={(e) => setFormRelationship(e.target.value)} type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="e.g. MOTHER" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Occupation</label>
                                    <input required value={formOccupation} onChange={(e) => setFormOccupation(e.target.value)} type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="e.g. TEACHER" />
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-8">
                               <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
                                  <div className="bg-femac-900 p-2 rounded-lg text-femac-yellow"><Phone size={16} /></div>
                                  <h6 className="font-black uppercase text-xs tracking-[0.2em] text-femac-900">3. Registry Contact Node</h6>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Phone Number</label>
                                    <input required value={formPhone} onChange={(e) => setFormPhone(e.target.value)} type="tel" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="e.g. 0972705347" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
                                    <input required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} type="email" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="e.g. parent@example.com" />
                                  </div>
                                  <div className="md:col-span-2 space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Physical Residential Address</label>
                                    <input required value={formAddress} onChange={(e) => setFormAddress(e.target.value)} type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm" placeholder="Plot / House Number, Street, Area" />
                                  </div>
                               </div>
                            </div>

                            <button disabled={transmissionStep !== 'IDLE'} type="submit" className="w-full bg-femac-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-lg shadow-2xl hover:bg-femac-yellow hover:text-femac-900 transition-all flex items-center justify-center space-x-4 active:scale-[0.98]">
                              {transmissionStep !== 'IDLE' ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                              <span>Transmit Instantly to Executive Portal</span>
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  )}

                  {activeAdmissionTab === 'tracker' && (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                      <h5 className="text-4xl font-black text-femac-900 tracking-tighter uppercase mb-2">Application <span className="text-femac-yellow">Tracker</span></h5>
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em] mb-12">Registry Status Monitoring Node</p>
                      
                      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-12">
                         <form onSubmit={handleTrackApplication} className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Enter Registry ID (e.g. S-2026-001)</label>
                              <div className="relative">
                                <SearchCode className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                                <input required value={trackerSearchTerm} onChange={(e) => setTrackerSearchTerm(e.target.value)} type="text" className="w-full pl-16 pr-6 py-6 bg-white border-2 border-slate-100 rounded-3xl outline-none font-black text-2xl text-femac-900 focus:border-femac-yellow transition-all uppercase tracking-tighter" placeholder="S-2026-XXX" />
                              </div>
                            </div>
                            <button type="submit" className="w-full bg-femac-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-xl">Query Registry Status</button>
                         </form>
                      </div>

                      {trackedApplication && (
                        <div className="animate-in zoom-in duration-300">
                          {trackedApplication === 'NOT_FOUND' ? (
                            <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100 text-center">
                               <XCircle size={48} className="text-red-600 mx-auto mb-6" />
                               <h6 className="text-xl font-black text-red-900 uppercase mb-2">Registry ID Not Found</h6>
                               <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Verify the ID and try again.</p>
                            </div>
                          ) : (
                            <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
                               <div className="flex items-center justify-between mb-10">
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Applicant Node</p>
                                    <h6 className="text-3xl font-black text-femac-900 tracking-tighter uppercase">{trackedApplication.firstName} {trackedApplication.lastName}</h6>
                                  </div>
                                  <div className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${trackedApplication.applicationStatus === ApplicationStatus.ACCEPTED ? 'bg-green-600 text-white' : (trackedApplication.applicationStatus === ApplicationStatus.DECLINED ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-700 animate-pulse')}`}>
                                    {trackedApplication.applicationStatus}
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                  <div className="bg-slate-50 p-6 rounded-3xl">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Applied Grade</p>
                                     <p className="text-lg font-black text-femac-900">Grade {trackedApplication.grade}</p>
                                  </div>
                                  <div className="bg-slate-50 p-6 rounded-3xl">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Date</p>
                                     <p className="text-lg font-black text-femac-900">{trackedApplication.submissionDate}</p>
                                  </div>
                               </div>

                               {trackedApplication.applicationStatus === ApplicationStatus.INTERVIEW && (
                                 <div className="bg-femac-900 p-8 rounded-[2rem] text-white flex items-center justify-between">
                                    <div className="flex items-center space-x-5">
                                      <CalendarClock size={32} className="text-femac-yellow" />
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-femac-yellow">Interview Scheduled</p>
                                        <p className="text-xl font-black tracking-tighter">{trackedApplication.interviewDate || 'To be communicated'}</p>
                                      </div>
                                    </div>
                                    <Info size={24} className="opacity-30" />
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeAdmissionTab === 'policy' && (
                    <div className="animate-in slide-in-from-right-4 duration-500 space-y-12">
                      <h5 className="text-4xl font-black text-femac-900 tracking-tighter uppercase mb-2">Admission <span className="text-femac-yellow">Protocol</span></h5>
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em] mb-12">Registry Node Guidelines</p>
                      
                      <div className="space-y-8">
                         {[
                           { title: 'Data Integrity', content: 'All information provided must be accurate. False declarations result in automatic de-registration from the registry node.', icon: ShieldAlert },
                           { title: 'Verification Cycle', content: 'Applications typically move to the "INTERVIEW" or "ACCEPTED" node within 5-7 registry business days.', icon: RotateCw },
                           { title: 'Settlement Terms', content: 'Enrollment fees are non-refundable and must be settled within 48 hours of acceptance notification.', icon: DollarSign },
                           { title: 'Equality Node', content: 'FEMAC Academy maintains an inclusive registry regardless of background, focused solely on merit and character potential.', icon: Users }
                         ].map((p, idx) => (
                           <div key={idx} className="flex space-x-6">
                              <div className="p-4 bg-slate-50 rounded-2xl text-femac-900 h-fit"><p.icon size={20} /></div>
                              <div>
                                <h6 className="font-black text-lg text-femac-900 uppercase tracking-tight mb-2">{p.title}</h6>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{p.content}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      )}

      <section id="about" className="py-24 px-6 bg-white relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <h2 className="text-sm font-black text-femac-yellow uppercase tracking-[0.4em] mb-3">About Us</h2>
              <h3 className="text-5xl font-black text-femac-900 mb-8 tracking-tighter leading-none">A Legacy of <span className="underline decoration-femac-yellow decoration-4">Integrity</span> and Leadership.</h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                Founded with a vision to redefine the educational landscape in Zambia, FEMAC Academy serves as a beacon of academic excellence and spiritual growth.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-femac-900">
                    <Target className="text-femac-yellow" size={24} />
                    <span className="font-black uppercase tracking-widest text-sm">Our Mission</span>
                  </div>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">To provide a holistic learning environment that empowers students with knowledge and values.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-femac-900">
                    <Eye className="text-femac-yellow" size={24} />
                    <span className="font-black uppercase tracking-widest text-sm">Our Vision</span>
                  </div>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">To be the leading integrated educational institution in the region.</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
               <div className="aspect-square bg-femac-900 rounded-[3rem] overflow-hidden flex items-center justify-center p-8"><img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain filter drop-shadow-2xl" /></div>
               <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden"><img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Library" /></div>
               <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden"><img src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Campus Life" /></div>
               <div className="aspect-square bg-femac-yellow rounded-[3rem] flex flex-col items-center justify-center text-femac-900 p-6 text-center"><span className="text-5xl font-black mb-1 leading-none">15+</span><span className="font-black uppercase tracking-widest text-[10px]">Years of Excellence</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="academic" className="py-24 px-6 bg-slate-50 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-femac-yellow uppercase tracking-[0.4em] mb-3">Academic Registry</h2>
            <h3 className="text-6xl font-black text-femac-900 tracking-tighter leading-none mb-6">Moulding Future <span className="text-femac-yellow">Leaders</span>.</h3>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Our comprehensive curriculum is designed to challenge intellects while fostering character through integrated learning pathways.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:border-femac-yellow transition-all group">
               <div className="w-16 h-16 bg-femac-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-femac-yellow transition-colors"><BookOpen className="text-femac-yellow group-hover:text-femac-900 transition-colors" size={32} /></div>
               <h4 className="text-2xl font-black text-femac-900 uppercase tracking-tight mb-4">Primary Division</h4>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Grades 1 — 7</p>
               <p className="text-slate-600 font-medium leading-relaxed mb-8">Focusing on fundamental literacy, numeracy, and creative exploration in a supportive, high-engagement environment.</p>
               <ul className="space-y-3">
                 {['Foundational Literacy', 'Core Mathematics', 'Environmental Science', 'Creative Arts'].map(item => (<li key={item} className="flex items-center text-xs font-black text-femac-900 uppercase tracking-widest"><CheckCircle2 size={14} className="text-femac-yellow mr-2" /> {item}</li>))}
               </ul>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:border-femac-yellow transition-all group">
               <div className="w-16 h-16 bg-femac-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-femac-yellow transition-colors"><Microscope className="text-femac-yellow group-hover:text-femac-900 transition-colors" size={32} /></div>
               <h4 className="text-2xl font-black text-femac-900 uppercase tracking-tight mb-4">Junior Secondary</h4>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Grades 8 — 9</p>
               <p className="text-slate-600 font-medium leading-relaxed mb-8">Transitional years emphasizing analytical thinking and the introduction of integrated sciences and social studies.</p>
               <ul className="space-y-3">
                 {['Integrated Science', 'Social Studies', 'Zambian Languages', 'Introductory ICT'].map(item => (<li key={item} className="flex items-center text-xs font-black text-femac-900 uppercase tracking-widest"><CheckCircle2 size={14} className="text-femac-yellow mr-2" /> {item}</li>))}
               </ul>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:border-femac-yellow transition-all group">
               <div className="w-16 h-16 bg-femac-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-femac-yellow transition-colors"><GraduationCap className="text-femac-yellow group-hover:text-femac-900 transition-colors" size={32} /></div>
               <h4 className="text-2xl font-black text-femac-900 uppercase tracking-tight mb-4">Senior Secondary</h4>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Grades 10 — 12</p>
               <p className="text-slate-600 font-medium leading-relaxed mb-8">Rigorous academic specialization in Pure Sciences, Business Studies, or Liberal Arts, preparing students for university.</p>
               <ul className="space-y-3">
                 {['Pure Science Tracks', 'Business & Accounts', 'Literature & History', 'Advanced ICT & Coding'].map(item => (<li key={item} className="flex items-center text-xs font-black text-femac-900 uppercase tracking-widest"><CheckCircle2 size={14} className="text-femac-yellow mr-2" /> {item}</li>))}
               </ul>
            </div>
          </div>
        </div>
      </section>
      
      <section id="admissions" className="py-32 px-6 bg-femac-900 text-white relative overflow-hidden z-10 scroll-mt-20">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center"><img src={LOGO_URL} alt="" className="w-full h-full object-cover scale-150 rotate-[30deg]" /></div>
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <h3 className="text-7xl font-black mb-10 leading-none tracking-tighter">Begin Your <span className="text-femac-yellow">Legacy</span>.</h3>
          <p className="text-2xl text-femac-300 mb-16 font-medium max-w-2xl mx-auto">Enrollment for the 2026 academic session is now open. Join Zambia's most progressive educational institution.</p>
          <button onClick={() => setShowAdmissionModal(true)} className="bg-white text-femac-900 px-14 py-6 rounded-2xl font-black text-2xl hover:bg-femac-yellow transition-all shadow-2xl transform hover:scale-105 active:scale-95">Open Admission Process</button>
        </div>
      </section>

      <AnnouncementSlideshow />

      <footer className="bg-femac-900 border-t border-white/5 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col items-start md:w-1/3">
            <div className="flex items-center space-x-4 mb-6"><img src={LOGO_URL} alt="Logo" className="h-16 w-16" /><h4 className="text-femac-yellow text-3xl font-black tracking-tighter uppercase">FEMAC ACADEMY</h4></div>
            <p className="text-femac-400 text-sm font-black uppercase tracking-widest mb-1">{settings?.address || 'PLOT 442 KATUBA 17MILES, GREAT NORTH ROAD, CENTRAL, ZAMBIA'}</p>
            <div className="flex items-center space-x-6 mt-4">
               <div className="flex items-center space-x-2 text-femac-300 text-xs font-bold uppercase tracking-widest"><Phone size={14} className="text-femac-yellow"/><span>{settings?.phone || '+260 972 705 347'}</span></div>
               <div className="flex items-center space-x-2 text-femac-300 text-xs font-bold uppercase tracking-widest"><Mail size={14} className="text-femac-yellow"/><span>{settings?.email || 'admissions@femac.edu.zm'}</span></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;