import React, { useState } from 'react';
import { User, UserRole } from './types';
import { MOCK_USERS } from './constants';
import { Layout } from './components/Layout';
import { TeacherPortal } from './pages/TeacherPortal';
import { ExamsPortal } from './pages/ExamsPortal';
import { ParentPortal } from './pages/ParentPortal';
import { StudentPortal } from './pages/StudentPortal';
import { ExecutiveAccountsPortal } from './pages/ExecutiveAccountsPortal';
import { 
  Key, ChevronRight, Award, Zap, Laptop, Bus, Trophy, Users, X, 
  DollarSign, FileText, ShieldCheck, ClipboardList, Info, Target, 
  Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, BookOpen, GraduationCap, 
  Microscope, Languages, Calculator, FlaskConical, Globe2,
  FileEdit, UserPlus, CreditCard, Smartphone, Landmark, Copy,
  User as UserIcon, Calendar, School, Phone, Mail, MapPin, Upload,
  Home, Lock, MessageCircle, Facebook
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'website' | 'login' | 'portal'>('website');
  const [activePage, setActivePage] = useState('dashboard');
  
  // Login Sub-States
  const [loginStep, setLoginStep] = useState<'role' | 'grade' | 'password'>('role');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // Admission States
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [activeAdmissionTab, setActiveAdmissionTab] = useState<null | 'fees' | 'form' | 'policy'>(null);
  const [isFillingForm, setIsFillingForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const LOGO_URL = "https://i.ibb.co/p6V85m6L/image.png"; 

  // Mapping of passwords for each teacher - Updated to use "Chikuni1" for all
  const TEACHER_PASSWORDS: Record<string, string> = {
    'U-TEA-G1': 'Chikuni1',
    'U-TEA-G2': 'Chikuni1',
    'U-TEA-G3': 'Chikuni1',
    'U-TEA-G4': 'Chikuni1',
    'U-TEA-G5': 'Chikuni1',
    'U-TEA-G6': 'Chikuni1',
    'U-TEA-G7': 'Chikuni1',
    'U-TEA-F1': 'Chikuni1',
    'U-TEA-G9': 'Chikuni1',
    'U-TEA-G10': 'Chikuni1'
  };

  const handleRoleSelect = (role: UserRole) => {
    if (role === UserRole.TEACHER) {
      setLoginStep('grade');
    } else {
      const foundUser = MOCK_USERS.find(u => u.role === role);
      if (foundUser) {
        setUser(foundUser);
        setView('portal');
        // Default page for parents is now results since Overview was removed
        setActivePage(role === UserRole.PARENT ? 'results' : 'dashboard');
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

  const handleTeacherLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingUser && password === TEACHER_PASSWORDS[pendingUser.id]) {
      setUser(pendingUser);
      setView('portal');
      setActivePage('dashboard');
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
    setView('website');
    setPendingUser(null);
    setLoginStep('role');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const closeAdmissionRegistry = () => {
    setShowAdmissionModal(false);
    setActiveAdmissionTab(null);
    setIsFillingForm(false);
    setFormSubmitted(false);
  };

  const getRoleDisplayLabel = (role: UserRole) => {
    if (role === UserRole.EXECUTIVE_ACCOUNTS) return 'EXECUTIVE/ACCOUNTS';
    return role.replace('_', ' ');
  };

  // --- Website Landing Page Component ---
  const LandingPage = () => (
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none z-0">
        <img src={LOGO_URL} alt="" className="w-[800px] h-[800px] object-contain rotate-12" />
      </div>

      <nav className="fixed top-0 w-full bg-femac-900/95 backdrop-blur-md text-white z-50 shadow-lg px-6 py-4 flex justify-between items-center border-b border-femac-yellow/20">
        <div className="flex items-center space-x-4">
          <img src={LOGO_URL} alt="FEMAC Logo" className="h-12 w-12 object-contain" />
          <div className="flex flex-col">
            <span className="text-3xl font-black tracking-tighter text-femac-yellow leading-none uppercase">FEMAC ACADEMY</span>
            <span className="text-[11px] tracking-[0.25em] text-femac-300 font-black uppercase">Dedicated to Excellence</span>
          </div>
        </div>
        <div className="hidden lg:flex space-x-8 text-xs font-black uppercase tracking-widest text-femac-100">
          <a href="#about" className="hover:text-femac-yellow transition-colors">About</a>
          <a href="#academic" className="hover:text-femac-yellow transition-colors">Academic</a>
          <a href="#admissions" className="hover:text-femac-yellow transition-colors">Admissions</a>
        </div>
        <button onClick={() => setView('login')} className="bg-femac-yellow text-femac-900 px-8 py-2.5 rounded-full font-black text-sm hover:scale-105 transition-all shadow-xl flex items-center">
          Portal Login <ChevronRight size={18} className="ml-1" />
        </button>
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

      {/* About Section */}
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

      {/* Academic Section */}
      <section id="academic" className="py-24 px-6 bg-slate-50 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-femac-yellow uppercase tracking-[0.4em] mb-3">Academic Registry</h2>
            <h3 className="text-6xl font-black text-femac-900 tracking-tighter leading-none mb-6">Moulding Future <span className="text-femac-yellow">Leaders</span>.</h3>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Our comprehensive curriculum is designed to challenge intellects while fostering character through integrated learning pathways.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:border-femac-yellow transition-all group">
               <div className="w-16 h-16 bg-femac-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-femac-yellow transition-colors">
                  <BookOpen className="text-femac-yellow group-hover:text-femac-900 transition-colors" size={32} />
               </div>
               <h4 className="text-2xl font-black text-femac-900 uppercase tracking-tight mb-4">Primary Division</h4>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Grades 1 — 7</p>
               <p className="text-slate-600 font-medium leading-relaxed mb-8">Focusing on fundamental literacy, numeracy, and creative exploration in a supportive, high-engagement environment.</p>
               <ul className="space-y-3">
                 {['Foundational Literacy', 'Core Mathematics', 'Environmental Science', 'Creative Arts'].map(item => (
                   <li key={item} className="flex items-center text-xs font-black text-femac-900 uppercase tracking-widest">
                     <CheckCircle2 size={14} className="text-femac-yellow mr-2" /> {item}
                   </li>
                 ))}
               </ul>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:border-femac-yellow transition-all group">
               <div className="w-16 h-16 bg-femac-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-femac-yellow transition-colors">
                  <Microscope className="text-femac-yellow group-hover:text-femac-900 transition-colors" size={32} />
               </div>
               <h4 className="text-2xl font-black text-femac-900 uppercase tracking-tight mb-4">Junior Secondary</h4>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Grades 8 — 9</p>
               <p className="text-slate-600 font-medium leading-relaxed mb-8">Transitional years emphasizing analytical thinking and the introduction of integrated sciences and social studies.</p>
               <ul className="space-y-3">
                 {['Integrated Science', 'Social Studies', 'Zambian Languages', 'Introductory ICT'].map(item => (
                   <li key={item} className="flex items-center text-xs font-black text-femac-900 uppercase tracking-widest">
                     <CheckCircle2 size={14} className="text-femac-yellow mr-2" /> {item}
                   </li>
                 ))}
               </ul>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:border-femac-yellow transition-all group">
               <div className="w-16 h-16 bg-femac-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-femac-yellow transition-colors">
                  <GraduationCap className="text-femac-yellow group-hover:text-femac-900 transition-colors" size={32} />
               </div>
               <h4 className="text-2xl font-black text-femac-900 uppercase tracking-tight mb-4">Senior Secondary</h4>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Grades 10 — 12</p>
               <p className="text-slate-600 font-medium leading-relaxed mb-8">Rigorous academic specialization in Pure Sciences, Business Studies, or Liberal Arts, preparing students for university.</p>
               <ul className="space-y-3">
                 {['Pure Science Tracks', 'Business & Accounts', 'Literature & History', 'Advanced ICT & Coding'].map(item => (
                   <li key={item} className="flex items-center text-xs font-black text-femac-900 uppercase tracking-widest">
                     <CheckCircle2 size={14} className="text-femac-yellow mr-2" /> {item}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Admissions Section */}
      <section id="admissions" className="py-32 px-6 bg-femac-900 text-white relative overflow-hidden z-10 scroll-mt-20">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
           <img src={LOGO_URL} alt="" className="w-full h-full object-cover scale-150 rotate-[30deg]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <h3 className="text-7xl font-black mb-10 leading-none tracking-tighter">Begin Your <span className="text-femac-yellow">Legacy</span>.</h3>
          <p className="text-2xl text-femac-300 mb-16 font-medium max-w-2xl mx-auto">Enrollment for the 2026 academic session is now open. Join Zambia's most progressive educational institution.</p>
          <button 
            onClick={() => setShowAdmissionModal(true)}
            className="bg-white text-femac-900 px-14 py-6 rounded-2xl font-black text-2xl hover:bg-femac-yellow transition-all shadow-2xl transform hover:scale-105 active:scale-95"
          >
            Open Admission Process
          </button>
        </div>
      </section>

      {/* Admission Process Modal */}
      {showAdmissionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-femac-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden relative border border-white/20 min-h-[700px]">
            <button onClick={closeAdmissionRegistry} className="absolute top-8 right-8 text-slate-400 hover:text-femac-900 transition-colors z-[110]"><X size={32} /></button>
            <div className="flex flex-col md:flex-row h-full min-h-[700px]">
              <div className="md:w-1/4 bg-femac-900 p-10 text-white flex flex-col justify-center relative overflow-hidden shrink-0">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-femac-yellow opacity-10 rounded-full blur-3xl"></div>
                <img src={LOGO_URL} alt="Logo" className="w-20 h-20 mb-8 relative z-10 mx-auto md:mx-0" />
                <h3 className="text-3xl font-black tracking-tighter uppercase leading-none mb-4 relative z-10 text-center md:text-left">Admission<br/><span className="text-femac-yellow">Registry</span></h3>
                <div className="mt-12 space-y-4 relative z-10">
                  {(activeAdmissionTab || isFillingForm) && (<button onClick={() => { if (isFillingForm) setIsFillingForm(false); else setActiveAdmissionTab(null); }} className="flex items-center space-x-2 text-femac-yellow text-[10px] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform border border-femac-yellow/30 px-4 py-2 rounded-full w-full justify-center md:justify-start"><ArrowLeft size={14} /> <span>Back to Menu</span></button>)}
                  <button onClick={closeAdmissionRegistry} className="flex items-center space-x-2 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-white/30 px-4 py-2 rounded-full w-full justify-center md:justify-start"><Home size={14} /> <span>Back to Home</span></button>
                </div>
              </div>
              <div className="md:w-3/4 p-10 md:p-14 flex flex-col bg-white overflow-y-auto max-h-[90vh] custom-scrollbar">
                {!activeAdmissionTab && !isFillingForm ? (
                  <div className="flex flex-col justify-center h-full">
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-8 uppercase border-b border-slate-100 pb-4">Required Action Steps</h4>
                    <div className="grid grid-cols-1 gap-6">
                      <button onClick={() => setActiveAdmissionTab('fees')} className="flex items-center space-x-6 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow hover:bg-yellow-50 transition-all group text-left shadow-sm">
                        <div className="w-16 h-16 bg-femac-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-femac-yellow transition-colors"><DollarSign className="text-femac-yellow group-hover:text-femac-900 transition-colors" size={28} /></div>
                        <div><span className="block text-xl font-black text-femac-900 uppercase tracking-tight">SCHOOL FEES</span><span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Financial breakdown per level</span></div>
                      </button>
                      <button onClick={() => setActiveAdmissionTab('form')} className="flex items-center space-x-6 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow hover:bg-yellow-50 transition-all group text-left shadow-sm">
                        <div className="w-16 h-16 bg-femac-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-femac-yellow transition-colors"><FileEdit className="text-femac-yellow group-hover:text-femac-900 transition-colors" size={28} /></div>
                        <div><span className="block text-xl font-black text-femac-900 uppercase tracking-tight">ENROLLMENT FORM</span><span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Digital application portal</span></div>
                      </button>
                      <button onClick={() => setActiveAdmissionTab('policy')} className="flex items-center space-x-6 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow hover:bg-yellow-50 transition-all group text-left shadow-sm">
                        <div className="w-16 h-16 bg-femac-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-femac-yellow transition-colors"><ShieldCheck className="text-femac-yellow group-hover:text-femac-900 transition-colors" size={28} /></div>
                        <div><span className="block text-xl font-black text-femac-900 uppercase tracking-tight">PAYMENT POLICY</span><span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Terms, conditions & deadlines</span></div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-right duration-500">
                    {activeAdmissionTab === 'fees' && (
                        <div>
                            <h4 className="text-4xl font-black text-femac-900 mb-2 uppercase tracking-tight">Tuition & Fees</h4>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-8">Academic Session 2026/2027</p>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <table className="w-full">
                                    <tbody>
                                        <tr className="border-b border-slate-200/50"><td className="py-3 font-bold text-slate-700">Primary (G1 - G7)</td><td className="py-3 text-right font-black text-femac-900">K 3,500.00</td></tr>
                                        <tr className="border-b border-slate-200/50"><td className="py-3 font-bold text-slate-700">Junior Secondary (G8 - G9)</td><td className="py-3 text-right font-black text-femac-900">K 4,800.00</td></tr>
                                        <tr><td className="py-3 font-bold text-slate-700">Senior Secondary (G10 - G12)</td><td className="py-3 text-right font-black text-femac-900">K 6,200.00</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeAdmissionTab === 'form' && !isFillingForm && (
                        <div>
                            <h4 className="text-4xl font-black text-femac-900 mb-2 uppercase tracking-tight">Enrollment Form</h4>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">Document Request Portal</p>
                            <div className="bg-slate-50 rounded-[2rem] p-12 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6"><UserPlus size={44} className="text-femac-900" /></div>
                                <h5 className="text-3xl font-black text-femac-900 uppercase tracking-tight mb-4">New Candidate Form</h5>
                                <p className="text-sm text-slate-500 font-medium mb-10 max-w-sm">Ensure you have digital results and birth certificates ready.</p>
                                <button onClick={() => setIsFillingForm(true)} className="w-full bg-femac-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-femac-800 transition-all flex items-center justify-center space-x-3 transform active:scale-95 shadow-xl"><span>Start Application</span><ChevronRight size={20} /></button>
                            </div>
                        </div>
                    )}
                    {isFillingForm && (
                      <div className="pb-10">
                        {formSubmitted ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
                             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8"><CheckCircle2 size={56} /></div>
                             <h4 className="text-4xl font-black text-femac-900 uppercase tracking-tight mb-4">Submission Received!</h4>
                             <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">Application reference <span className="text-femac-900 font-black">#FA-2026-{Math.floor(Math.random() * 9000) + 1000}</span>.</p>
                             <button onClick={closeAdmissionRegistry} className="px-10 py-4 bg-femac-900 text-white rounded-xl font-black uppercase tracking-widest">Close Admission Registry</button>
                          </div>
                        ) : (
                          <form onSubmit={handleFormSubmit} className="space-y-12">
                              <div className="space-y-6">
                                <div className="flex items-center space-x-3 text-femac-900"><UserIcon size={20} className="text-femac-yellow" /><h5 className="font-black uppercase tracking-widest text-sm">Student Information</h5></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <input required type="text" placeholder="First Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" />
                                  <input required type="text" placeholder="Last Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" />
                                </div>
                              </div>
                              <button type="submit" className="w-full bg-femac-yellow text-femac-900 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-lg shadow-2xl hover:bg-white border-2 border-transparent hover:border-femac-yellow transition-all transform active:scale-95">Submit Application Form</button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-femac-900 border-t border-white/5 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col items-start md:w-1/3">
            <div className="flex items-center space-x-4 mb-6">
              <img src={LOGO_URL} alt="Logo" className="h-12 w-12" />
              <h4 className="text-femac-yellow text-3xl font-black tracking-tighter uppercase">FEMAC ACADEMY</h4>
            </div>
            <p className="text-femac-400 text-sm font-black uppercase tracking-widest mb-1">plot 442 katuba 17miles, great north road, central, zambia</p>
            <p className="text-femac-500 text-[10px] font-black uppercase tracking-widest mt-8">Integrated Management System (FAIMS)</p>
          </div>
          <div className="md:w-1/3">
            <h5 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center"><span className="w-8 h-[2px] bg-femac-yellow mr-4"></span> Contact Registry</h5>
            <div className="space-y-4">
               <a href="mailto:malamachikuni@gmail.com" className="flex items-center space-x-4 group"><Mail size={18} className="text-femac-yellow" /><span className="text-femac-200 text-sm font-bold group-hover:text-white transition-colors">malamachikuni@gmail.com</span></a>
               <a href="tel:0977927447" className="flex items-center space-x-4 group"><Phone size={18} className="text-femac-yellow" /><span className="text-femac-200 text-sm font-bold group-hover:text-white transition-colors">0977 927 447</span></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  // --- Login Screen View ---
  if (view === 'login') {
    const rolesToShow = [UserRole.PUPIL, UserRole.PARENT, UserRole.TEACHER, UserRole.EXAMS_OFFICE, UserRole.EXECUTIVE_ACCOUNTS];
    // Specific list of teacher IDs we want to display for the grade selection
    const teacherUserIds = ['U-TEA-G1', 'U-TEA-G2', 'U-TEA-G3', 'U-TEA-G4', 'U-TEA-G5', 'U-TEA-G6', 'U-TEA-G7', 'U-TEA-F1'];
    const teacherUsers = MOCK_USERS.filter(u => teacherUserIds.includes(u.id));

    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
          <img src={LOGO_URL} alt="" className="w-[800px] h-[800px] object-contain" />
        </div>
        <div className="bg-white rounded-[3rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative z-10 border border-white/40">
           <div className="md:w-1/2 bg-femac-900 p-16 text-white flex flex-col justify-center relative overflow-hidden">
             <div className="absolute -top-24 -left-24 w-72 h-72 bg-femac-yellow opacity-10 rounded-full blur-[120px]"></div>
             <button onClick={() => { setView('website'); setPendingUser(null); setLoginStep('role'); }} className="absolute top-10 left-10 text-femac-400 hover:text-white flex items-center text-xs font-black uppercase tracking-[0.25em] transition-all group">
               <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Return Home
             </button>
             <div className="mb-12">
               <img src={LOGO_URL} alt="Logo" className="w-32 h-32 mb-10 object-contain filter drop-shadow-[0_0_20px_rgba(250,204,21,0.2)]" />
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
                 <button onClick={() => setLoginStep('grade')} className="mb-8 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-femac-900 transition-colors"><ArrowLeft size={14} className="mr-2" /> Change Grade</button>
                 <div className="flex items-center space-x-5 mb-10">
                    <div className="w-20 h-20 bg-femac-900 rounded-2xl border-4 border-femac-yellow flex items-center justify-center text-femac-yellow font-black text-2xl uppercase">
                      <UserIcon size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 leading-none mb-1 uppercase tracking-tight">{pendingUser?.name}</h2>
                      <p className="text-[10px] text-femac-500 uppercase tracking-[0.3em] font-black">Personal Registry Secure Key</p>
                    </div>
                 </div>
                 <form onSubmit={handleTeacherLoginSubmit} className="space-y-6">
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
      if (user.role === UserRole.EXECUTIVE_ACCOUNTS) return <ExecutiveAccountsPortal />;
      return <div className="p-10 text-center"><h2 className="text-3xl font-black text-slate-300 uppercase tracking-widest mt-20">Access Restricted</h2></div>;
    };
    return <Layout user={user} onLogout={handleLogout} activePage={activePage} onNavigate={setActivePage}>{renderContent()}</Layout>;
  }

  return <LandingPage />;
};

export default App;