
import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, Users, TrendingUp, ArrowUpRight, CreditCard, Briefcase, FileText, Search, User as UserIcon, ChevronRight, X, MapPin, ShieldCheck, Download, CheckCircle, XCircle, FileCheck, User as UserLarge, BellRing, Smartphone, Landmark, Info, Lock, Receipt, History, Wallet, BadgeCheck, UserCog, Power, RotateCw, Trash2, LineChart as ChartIcon, Plus, Tag, MessageCircle, Headphones, MessageSquare, Megaphone, Upload, AlertCircle, CalendarClock, Scale, BookOpen, UserPlus, GraduationCap, Loader2, Send, Image as ImageIcon, BarChart3, PieChart, Wallet2, ShoppingBag, BriefcaseBusiness, UserCheck2, Timer, Bot, User, Calculator, Filter, Settings, Mail, Phone, LayoutGrid, Zap, FileEdit, Headset, MessageCircleQuestion, Check, ArrowDownRight, Activity, Trophy, FileSearch, UserX, Clock
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell, AreaChart, Area } from 'recharts';
import { MockDB } from '../services/mockDb';
import { ApplicationStatus, PaymentNotification, UserRole, StaffMember, FinancialYearSummary, InstitutionalExpense, ChatSession, Announcement, Student, ChatMessage, FeeTransaction, SchoolSettings } from '../types';

export const ExecutiveAccountsPortal: React.FC<{ activePage?: string }> = ({ activePage = 'financials' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('1');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [allFees, setAllFees] = useState<FeeTransaction[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [growthData, setGrowthData] = useState<{current: FinancialYearSummary, history: any[]} | null>(null);
  const [expenses, setExpenses] = useState<InstitutionalExpense[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({ address: '', phone: '', email: '' });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [activeGrowthTab, setActiveGrowthTab] = useState<'profit' | 'expenses' | 'net'>('profit');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Admission Review States
  const [selectedApplication, setSelectedApplication] = useState<Student | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // New Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnImage, setNewAnnImage] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);

  const refreshData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const [stList, st, n, g, e, cs, ann, settings] = await Promise.all([
        MockDB.getStudents(), MockDB.getStaff(), MockDB.getNotifications(),
        MockDB.getGrowthMetrics(), MockDB.getExpenses(), MockDB.getChatSessions(),
        MockDB.getAnnouncements(), MockDB.getSchoolSettings()
      ]);
      const feePromises = stList.map(s => MockDB.getFeesByStudent(s.id));
      const feesNested = await Promise.all(feePromises);
      setAllFees(feesNested.flat());
      setStudents(stList); setStaff(st); setNotifications(n); setGrowthData(g);
      setExpenses(e); setChatSessions(cs); setAnnouncements(ann); setSchoolSettings(settings);
    } catch (err) { console.error("Registry Sync Failure", err); }
    finally { 
      if (!silent) setLoading(false); 
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    // Maintain 'Communication Channel' with background polling
    const interval = setInterval(() => { refreshData(true); }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [activeChatId, chatSessions]);

  const getStudentFinances = (studentId: string) => {
    const studentFees = allFees.filter(f => f.studentId === studentId);
    const totalBilled = studentFees.filter(f => f.type === 'BILL').reduce((acc, curr) => acc + curr.amount, 0);
    const totalPaid = Math.abs(studentFees.filter(f => f.type === 'PAYMENT').reduce((acc, curr) => acc + curr.amount, 0));
    return { totalBilled, totalPaid, balance: totalBilled - totalPaid, history: studentFees };
  };

  const handleAcceptChat = async (sessionId: string) => { 
    await MockDB.acceptChatRequest(sessionId); 
    await MockDB.sendMessage(sessionId, 'EXE-ADMIN', UserRole.EXECUTIVE_ACCOUNTS, "I have joined. How can I assist?", false); 
    setActiveChatId(sessionId);
    refreshData(); 
  };

  const handleCloseChat = async (sessionId: string) => {
    if (confirm("Close this support session?")) {
      await MockDB.closeChat(sessionId);
      setActiveChatId(null);
      refreshData();
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatId) return;
    await MockDB.sendMessage(activeChatId, 'EXE-ADMIN', UserRole.EXECUTIVE_ACCOUNTS, chatInput.trim(), false);
    setChatInput('');
    const sessions = await MockDB.getChatSessions();
    setChatSessions(sessions);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    setIsSubmittingAnn(true);
    try {
      await MockDB.addAnnouncement({
        title: newAnnTitle.toUpperCase(),
        content: newAnnContent,
        imageUrl: newAnnImage || undefined,
        priority: newAnnPriority
      });
      setNewAnnTitle(''); setNewAnnContent(''); setNewAnnImage(''); setNewAnnPriority('NORMAL');
      const updatedAnn = await MockDB.getAnnouncements();
      setAnnouncements(updatedAnn);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm("Delete this broadcast from the registry?")) {
      await MockDB.deleteAnnouncement(id);
      const updatedAnn = await MockDB.getAnnouncements();
      setAnnouncements(updatedAnn);
    }
  };

  const handleUpdateApplicationStatus = async (id: string, status: ApplicationStatus) => {
    const msg = status === ApplicationStatus.ACCEPTED ? 'ACCEPT' : (status === ApplicationStatus.DECLINED ? 'DECLINE' : 'SCHEDULE INTERVIEW FOR');
    if (!confirm(`Are you sure you want to ${msg} this candidate?`)) return;
    
    setUpdatingStatus(true);
    try {
      let interviewDate = undefined;
      if (status === ApplicationStatus.INTERVIEW) {
        interviewDate = prompt("Enter Interview Date/Time (e.g. 2026-05-10 10:00 AM):", "2026-05-10 10:00 AM") || undefined;
      }
      await MockDB.updateStudentStatus(id, status, interviewDate);
      setSelectedApplication(null);
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const gradeLevels = [
    { label: 'GRADE 1', value: '1' }, { label: 'GRADE 2', value: '2' }, { label: 'GRADE 3', value: '3' },
    { label: 'GRADE 4', value: '4' }, { label: 'GRADE 5', value: '5' }, { label: 'GRADE 6', value: '6' },
    { label: 'GRADE 7', value: '7' }, { label: 'FORM ONE', value: '8' },
  ];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = s.grade.toString() === selectedGradeFilter;
    return matchesSearch && matchesGrade;
  });

  const pendingApplications = students.filter(s => s.applicationStatus !== ApplicationStatus.ACCEPTED && s.applicationStatus !== ApplicationStatus.DECLINED);

  // Unified Chronological Activity Feed
  const combinedActivity = [
    ...students.filter(s => s.applicationStatus === ApplicationStatus.PENDING).map(s => ({
        type: 'ADMISSION',
        id: s.id,
        title: 'New Application',
        detail: `${s.firstName} ${s.lastName} (Grade ${s.grade})`,
        date: s.submissionDate || 'Today',
        priority: 'HIGH'
    })),
    ...notifications.map(n => ({
        type: 'PAYMENT',
        id: n.id,
        title: 'Fee Notification',
        detail: `K${n.amount} from Node ${n.studentId}`,
        date: n.timestamp.split('T')[0],
        priority: n.status === 'PENDING' ? 'HIGH' : 'NORMAL'
    })),
    ...expenses.map(e => ({
        type: 'EXPENSE',
        id: e.id,
        title: 'Operational Outflow',
        detail: `${e.description} - K${e.amount}`,
        date: e.date,
        priority: 'NORMAL'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  const activeChat = chatSessions.find(s => s.id === activeChatId);

  const getTrendData = () => {
    if (!growthData) return [];
    const base = growthData.current.totalRevenue;
    return [
      { name: 'Jan', revenue: base * 0.7, expenses: growthData.current.totalExpenses / 12 },
      { name: 'Feb', revenue: base * 0.85, expenses: growthData.current.totalExpenses / 12 },
      { name: 'Mar', revenue: base * 0.9, expenses: growthData.current.totalExpenses / 12 },
      { name: 'Apr', revenue: base, expenses: growthData.current.totalExpenses / 12 },
    ];
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 size={48} className="animate-spin text-femac-yellow mb-6" />
      <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-xs">Synchronizing Registry...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-femac-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-femac-yellow opacity-5 blur-[100px]"></div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-20 h-20 bg-femac-yellow rounded-[2.5rem] flex items-center justify-center text-femac-900 shadow-xl relative">
             <Scale size={36} />
             {isRefreshing && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>}
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Executive Command</h2>
            <p className="text-femac-300 font-black uppercase tracking-[0.3em] text-[10px] mt-3">Verified Institutional Management Hub</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 relative z-10">
           {chatSessions.filter(s => s.status === 'REQUESTED').length > 0 && (
              <div className="bg-red-600 text-white px-6 py-3 rounded-2xl flex items-center animate-pulse border-2 border-white/20">
                <BellRing size={16} className="mr-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">{chatSessions.filter(s => s.status === 'REQUESTED').length} Escalation</span>
              </div>
           )}
           {pendingApplications.filter(s => s.applicationStatus === ApplicationStatus.PENDING).length > 0 && (
              <div className="bg-amber-500 text-femac-900 px-6 py-3 rounded-2xl flex items-center shadow-xl border-2 border-femac-900/10 animate-in slide-in-from-top-4">
                <UserPlus size={16} className="mr-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {pendingApplications.filter(s => s.applicationStatus === ApplicationStatus.PENDING).length} New Request
                </span>
              </div>
           )}
           <button onClick={() => setShowAnnModal(true)} className="p-5 bg-femac-yellow text-femac-900 rounded-[1.5rem] shadow-xl hover:bg-white transition-all transform hover:-translate-y-1 group">
             <Megaphone size={24} className="group-hover:animate-bounce" />
           </button>
           <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-3xl text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-femac-yellow mb-1">Active Pupils</p>
              <p className="text-2xl font-black">{students.filter(s => s.applicationStatus === ApplicationStatus.ACCEPTED).length}</p>
           </div>
        </div>
      </div>

      {activePage === 'financials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
                 <div className="flex items-center space-x-4 overflow-x-auto custom-scrollbar pb-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mr-4 whitespace-nowrap">Grade Node:</p>
                    {gradeLevels.map(grade => (
                       <button key={grade.value} onClick={() => setSelectedGradeFilter(grade.value)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 whitespace-nowrap ${selectedGradeFilter === grade.value ? 'bg-femac-900 text-white border-femac-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-femac-yellow'}`}>{grade.label}</button>
                    ))}
                 </div>
              </div>
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <h3 className="text-2xl font-black text-femac-900 uppercase tracking-tight">Pupil Registry</h3>
                  <div className="relative group w-full md:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search Node ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-bold text-slate-700 text-xs" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <tr><th className="px-10 py-5">Node ID</th><th className="px-6 py-5">Candidate</th><th className="px-6 py-5">Billed</th><th className="px-6 py-5">Paid</th><th className="px-6 py-5">Status</th><th className="px-10 py-5 text-right">Review</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.map(student => {
                        const finances = getStudentFinances(student.id);
                        return (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-10 py-6 font-black text-femac-900 uppercase text-xs">{student.id}</td>
                            <td className="px-6 py-6 font-bold text-slate-600 uppercase text-[10px]">{student.firstName} {student.lastName}</td>
                            <td className="px-6 py-6 font-black text-femac-900 text-xs">K {finances.totalBilled.toLocaleString()}</td>
                            <td className="px-6 py-6 font-black text-green-600 text-xs">K {finances.totalPaid.toLocaleString()}</td>
                            <td className="px-6 py-6">
                               <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${student.applicationStatus === ApplicationStatus.ACCEPTED ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{student.applicationStatus}</span>
                            </td>
                            <td className="px-10 py-6 text-right"><button onClick={() => setSelectedStudent(student)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-femac-900 hover:text-white transition-all"><FileEdit size={16}/></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
           </div>
           <div className="lg:col-span-1 space-y-8">
              <div className="bg-femac-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xl font-black uppercase tracking-tight flex items-center"><Clock size={24} className="mr-3 text-femac-yellow" /> Command Feed</h4>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Live Stream</span>
                 </div>
                 <div className="space-y-6">
                    {combinedActivity.length === 0 ? (
                        <div className="py-10 text-center opacity-30 uppercase font-black text-[9px]">No recent registry node activity</div>
                    ) : (
                        combinedActivity.map((activity, idx) => (
                            <div key={idx} className="flex items-start space-x-4 border-l-2 border-white/10 pl-4 group hover:border-femac-yellow transition-all">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${activity.type === 'ADMISSION' ? 'text-amber-400' : (activity.type === 'PAYMENT' ? 'text-green-400' : 'text-blue-400')}`}>
                                            {activity.type}
                                        </span>
                                        <span className="text-[8px] font-black text-white/20">•</span>
                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{activity.date}</span>
                                    </div>
                                    <p className="text-xs font-bold leading-tight group-hover:text-femac-yellow transition-colors">{activity.title}</p>
                                    <p className="text-[10px] text-white/60 mt-1 uppercase font-medium">{activity.detail}</p>
                                </div>
                            </div>
                        ))
                    )}
                 </div>
                 <div className="mt-8 pt-6 border-t border-white/5">
                    <button onClick={() => refreshData()} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Manual Registry Sync</button>
                 </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
                 <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-femac-900"><Zap size={28}/></div>
                 <h5 className="font-black text-femac-900 uppercase text-lg leading-none">System Health</h5>
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">Registry Node 2026.04</p>
                 <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase"><span className="text-slate-400">DB Latency</span><span className="text-green-600">42ms</span></div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase"><span className="text-slate-400">Registry Sync</span><span className="text-green-600">Active</span></div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase"><span className="text-slate-400">AI Tokens</span><span className="text-amber-600">Normal</span></div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activePage === 'admissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in slide-in-from-bottom-4 duration-500 min-h-[700px]">
           <div className="lg:col-span-1 bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black text-femac-900 uppercase tracking-tight">Review Queue</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending Admissions Node</p>
                 </div>
                 {pendingApplications.length > 0 && (
                    <span className="bg-amber-100 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full">{pendingApplications.length}</span>
                 )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                 {pendingApplications.length === 0 ? (
                    <div className="py-24 text-center">
                       <FileSearch size={48} className="mx-auto text-slate-100 mb-4" />
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Applications Pending</p>
                    </div>
                 ) : (
                    pendingApplications.map(app => (
                       <button 
                         key={app.id} 
                         onClick={() => setSelectedApplication(app)}
                         className={`w-full p-6 rounded-3xl text-left border-2 transition-all group relative ${selectedApplication?.id === app.id ? 'bg-femac-900 border-femac-900 shadow-xl text-white' : 'bg-slate-50 border-slate-50 hover:border-femac-yellow'}`}
                       >
                          {app.applicationStatus === ApplicationStatus.PENDING && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse"></div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                             <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${app.applicationStatus === ApplicationStatus.INTERVIEW ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>{app.applicationStatus}</span>
                             <span className={`text-[9px] font-black uppercase tracking-widest ${selectedApplication?.id === app.id ? 'text-femac-400' : 'text-slate-400'}`}>{app.id}</span>
                          </div>
                          <p className="font-black text-sm uppercase tracking-tight">{app.firstName} {app.lastName}</p>
                          <p className={`text-[10px] font-bold uppercase mt-1 ${selectedApplication?.id === app.id ? 'text-femac-300' : 'text-slate-500'}`}>Grade {app.grade} Candidate</p>
                       </button>
                    ))
                 )}
              </div>
           </div>

           <div className="lg:col-span-3 bg-white rounded-[4rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">
              {selectedApplication ? (
                 <>
                    <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-femac-900 text-white relative">
                       <div className="absolute top-0 right-0 w-64 h-full bg-femac-yellow opacity-5 -skew-x-12 translate-x-1/2"></div>
                       <div className="flex items-center space-x-6 relative z-10">
                          <div className="w-16 h-16 bg-femac-yellow rounded-[1.5rem] flex items-center justify-center text-femac-900 shadow-xl">
                             <UserLarge size={32} />
                          </div>
                          <div>
                             <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{selectedApplication.firstName} {selectedApplication.lastName}</h4>
                             <p className="text-[10px] font-black text-femac-400 uppercase tracking-[0.4em] mt-3">Registry Node: {selectedApplication.id} • Applied: {selectedApplication.submissionDate}</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-4 relative z-10">
                          <button onClick={() => handleUpdateApplicationStatus(selectedApplication.id, ApplicationStatus.ACCEPTED)} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center transition-all transform active:scale-95 border-b-4 border-green-800">
                             <CheckCircle size={14} className="mr-2" /> Verify & Accept
                          </button>
                          <button onClick={() => handleUpdateApplicationStatus(selectedApplication.id, ApplicationStatus.DECLINED)} className="bg-white/10 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/20 transition-all transform active:scale-95">
                             <UserX size={14} className="mr-2" /> Decline Candidate
                          </button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar bg-slate-50/30">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                             <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
                                <div className="p-2 bg-femac-900 text-femac-yellow rounded-lg"><Info size={16}/></div>
                                <h6 className="text-[11px] font-black uppercase tracking-widest text-femac-900">1. Personal Registry Node</h6>
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Gender</p><p className="font-black text-femac-900 uppercase text-xs">{selectedApplication.gender}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Date of Birth</p><p className="font-black text-femac-900 uppercase text-xs">{selectedApplication.dob}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Applying Grade</p><p className="font-black text-femac-900 uppercase text-xs">Grade {selectedApplication.grade}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Previous School</p><p className="font-black text-femac-900 uppercase text-xs">{selectedApplication.previousSchool}</p></div>
                             </div>
                          </div>

                          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                             <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
                                <div className="p-2 bg-femac-900 text-femac-yellow rounded-lg"><Users size={16}/></div>
                                <h6 className="text-[11px] font-black uppercase tracking-widest text-femac-900">2. Guardian & Address Data</h6>
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Guardian Name</p><p className="font-black text-femac-900 uppercase text-xs">{selectedApplication.guardianName}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Parent NRC</p><p className="font-black text-femac-900 uppercase text-xs">{selectedApplication.parentNrc}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Occupation</p><p className="font-black text-femac-900 uppercase text-xs">{selectedApplication.occupation}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Relationship</p><p className="font-black text-femac-900 uppercase text-xs">{selectedApplication.relationship}</p></div>
                                <div className="col-span-2"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Residential Address</p><p className="font-black text-femac-900 uppercase text-xs">{selectedApplication.address}</p></div>
                             </div>
                          </div>
                       </div>

                       <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                          <div className="flex items-center space-x-6">
                             <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 shadow-inner"><CalendarClock size={28}/></div>
                             <div>
                                <h5 className="text-xl font-black text-femac-900 uppercase tracking-tight">Interview Node Status</h5>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedApplication.applicationStatus === ApplicationStatus.INTERVIEW ? `Scheduled for ${selectedApplication.interviewDate}` : 'No interview currently scheduled in registry.'}</p>
                             </div>
                          </div>
                          <button onClick={() => handleUpdateApplicationStatus(selectedApplication.id, ApplicationStatus.INTERVIEW)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-lg flex items-center">
                             <CalendarClock size={16} className="mr-2" /> {selectedApplication.applicationStatus === ApplicationStatus.INTERVIEW ? 'Reschedule Node' : 'Set Interview Date'}
                          </button>
                       </div>
                    </div>
                 </>
              ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-20 text-slate-300">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                       <FileSearch size={48} className="opacity-20" />
                    </div>
                    <h4 className="text-3xl font-black text-femac-900/10 uppercase tracking-tighter">Select a Candidate for Registry Review</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Authorized Executive Admission Terminal</p>
                 </div>
              )}
           </div>
        </div>
      )}

      {activePage === 'growth' && growthData && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><Activity size={12} className="mr-2 text-femac-yellow" /> Annual Revenue</p>
                 <h4 className="text-3xl font-black text-femac-900 tracking-tighter">K {growthData.current.totalRevenue.toLocaleString()}</h4>
                 <div className="mt-4 flex items-center text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit border border-green-100 uppercase tracking-widest"><ArrowUpRight size={10} className="mr-1" /> Verified Flow</div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><TrendingUp size={12} className="mr-2 text-blue-500" /> Gross Margin</p>
                 <h4 className="text-3xl font-black text-femac-900 tracking-tighter">K {growthData.current.grossProfit.toLocaleString()}</h4>
                 <div className="mt-4 flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit border border-blue-100 uppercase tracking-widest"><TrendingUp size={10} className="mr-1" /> Op Efficiency</div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><ArrowDownRight size={12} className="mr-2 text-red-500" /> Total Expenses</p>
                 <h4 className="text-3xl font-black text-femac-900 tracking-tighter">K {growthData.current.totalExpenses.toLocaleString()}</h4>
                 <div className="mt-4 flex items-center text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full w-fit border border-red-100 uppercase tracking-widest">Salaries & Ops</div>
              </div>
              <div className="bg-femac-900 p-8 rounded-[2.5rem] shadow-xl text-white">
                 <p className="text-[9px] font-black text-femac-400 uppercase tracking-widest mb-2">Net Registry Profit</p>
                 <h4 className="text-3xl font-black text-femac-yellow tracking-tighter">K {growthData.current.netProfit.toLocaleString()}</h4>
                 <div className="mt-4 flex items-center text-[10px] font-black text-femac-900 bg-femac-yellow px-3 py-1 rounded-full w-fit uppercase tracking-widest">Yearly Retained</div>
              </div>
           </div>

           {/* Main Growth Chart */}
           <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                 <div>
                    <h3 className="text-3xl font-black text-femac-900 uppercase tracking-tighter">Revenue <span className="text-femac-yellow">Trend</span> Registry</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Historical Growth Matrix (Academic Year 2026)</p>
                 </div>
                 <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button className="px-6 py-2.5 rounded-xl bg-white text-femac-900 font-black text-[10px] uppercase tracking-widest shadow-md">Monthly View</button>
                    <button className="px-6 py-2.5 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-femac-900 transition-colors">Quarterly</button>
                 </div>
              </div>

              <div className="h-[450px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getTrendData()}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#102a43" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#102a43" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                       <Tooltip contentStyle={{borderRadius: '2rem', border: 'none', backgroundColor: '#102a43', color: '#fff', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="revenue" stroke="#102a43" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                       <Area type="monotone" dataKey="expenses" stroke="#facc15" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                       <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase'}} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Detailed Breakdown Tabs */}
           <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
              <div className="flex items-center space-x-6 mb-12 border-b border-slate-100 pb-8">
                 <button onClick={() => setActiveGrowthTab('profit')} className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeGrowthTab === 'profit' ? 'bg-femac-900 text-white shadow-xl' : 'text-slate-400 hover:text-femac-900'}`}>
                    <Activity size={16} /> <span>Gross Profit Nodes</span>
                 </button>
                 <button onClick={() => setActiveGrowthTab('expenses')} className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeGrowthTab === 'expenses' ? 'bg-femac-900 text-white shadow-xl' : 'text-slate-400 hover:text-femac-900'}`}>
                    <CreditCard size={16} /> <span>Expense Breakdown</span>
                 </button>
                 <button onClick={() => setActiveGrowthTab('net')} className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeGrowthTab === 'net' ? 'bg-femac-900 text-white shadow-xl' : 'text-slate-400 hover:text-femac-900'}`}>
                    <Trophy size={16} /> <span>Net Profit Analysis</span>
                 </button>
              </div>

              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                 {activeGrowthTab === 'profit' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                          <h4 className="text-2xl font-black text-femac-900 uppercase tracking-tight">Institutional Revenue Streams</h4>
                          <div className="space-y-4">
                             {[
                                { label: 'Tuition Fees (Primary)', value: growthData.current.totalRevenue * 0.45, color: 'bg-femac-900' },
                                { label: 'Tuition Fees (Junior)', value: growthData.current.totalRevenue * 0.35, color: 'bg-femac-600' },
                                { label: 'Tuition Fees (Senior)', value: growthData.current.totalRevenue * 0.15, color: 'bg-femac-400' },
                                { label: 'Misc. Registry Payments', value: growthData.current.totalRevenue * 0.05, color: 'bg-femac-yellow' },
                             ].map((item, i) => (
                                <div key={i} className="flex justify-between items-end p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                   <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                      <div className="flex items-center space-x-2">
                                         <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                         <span className="font-black text-femac-900">K {item.value.toLocaleString()}</span>
                                      </div>
                                   </div>
                                   <span className="text-[10px] font-black text-slate-300">{(item.value / growthData.current.totalRevenue * 100).toFixed(1)}%</span>
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-femac-yellow opacity-10 rounded-full blur-3xl"></div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-femac-yellow mb-4">Registry Insight</p>
                          <h5 className="text-3xl font-black tracking-tighter leading-tight mb-6">Profitability node is currently optimized at <span className="text-femac-yellow">78.4%</span> across all division streams.</h5>
                          <button className="w-fit bg-white/10 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-femac-900 transition-all border border-white/20">Download Detailed Report</button>
                       </div>
                    </div>
                 )}

                 {activeGrowthTab === 'expenses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                          <h4 className="text-2xl font-black text-femac-900 uppercase tracking-tight">Institutional Outflow Analysis</h4>
                          <div className="space-y-4">
                             {[
                                { label: 'Payroll & Salaries', value: growthData.current.totalSalaries, icon: Users },
                                { label: 'Operational Utilities', value: growthData.current.operationalCosts * 0.4, icon: Zap },
                                { label: 'Academic Resources', value: growthData.current.operationalCosts * 0.3, icon: BookOpen },
                                { label: 'Maintenance & Facilities', value: growthData.current.operationalCosts * 0.3, icon: Briefcase },
                             ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:border-femac-yellow transition-all">
                                   <div className="flex items-center space-x-4">
                                      <div className="p-3 bg-white rounded-xl shadow-sm text-femac-900 group-hover:bg-femac-900 group-hover:text-femac-yellow transition-all"><item.icon size={18} /></div>
                                      <div>
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                         <p className="font-black text-femac-900 text-lg">K {item.value.toLocaleString()}</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Outflow Node</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="bg-red-50 rounded-[3rem] p-10 border border-red-100 flex flex-col justify-center">
                          <h5 className="text-2xl font-black text-red-900 uppercase tracking-tight mb-4">Cost Mitigation Node</h5>
                          <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-widest mb-8">Operational costs are being tracked against institutional growth metrics. Current payroll efficiency is at 94.2% based on staff-student ratio benchmarks.</p>
                          <div className="flex items-center space-x-3 text-red-600 font-black uppercase text-[10px] tracking-widest bg-white w-fit px-6 py-3 rounded-xl shadow-sm border border-red-100">
                             <AlertCircle size={14} /> <span>Audited Registry Verified</span>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeGrowthTab === 'net' && (
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                       <div className="md:w-1/3 text-center md:text-left">
                          <div className="w-20 h-20 bg-femac-yellow text-femac-900 rounded-[2rem] flex items-center justify-center mb-8 mx-auto md:mx-0 shadow-xl border-4 border-femac-900">
                             <Trophy size={36} />
                          </div>
                          <h4 className="text-4xl font-black text-femac-900 tracking-tighter uppercase leading-none mb-4">Financial <span className="text-femac-yellow">Health</span> Index</h4>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose">Based on verified registry flow, FEMAC Academy shows a net positive retained growth of <span className="text-femac-900 font-black">22.5%</span> year-on-year.</p>
                       </div>
                       <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col justify-between h-[280px] relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registry Reserve</p>
                                <h5 className="text-5xl font-black text-femac-900 tracking-tighter leading-none uppercase">Verified Flow</h5>
                             </div>
                             <div className="mt-8">
                                <p className="text-4xl font-black text-green-600 tracking-tighter">K {(growthData.current.netProfit * 0.6).toLocaleString()}</p>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">60% Of Net Retained</p>
                             </div>
                          </div>
                          <div className="bg-femac-900 p-10 rounded-[3rem] shadow-xl text-white flex flex-col justify-between h-[280px] relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-femac-yellow opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                             <div>
                                <p className="text-[10px] font-black text-femac-400 uppercase tracking-widest mb-2">Capital Expenditure</p>
                                <h5 className="text-5xl font-black text-white tracking-tighter leading-none uppercase">Expansion Cap</h5>
                             </div>
                             <div className="mt-8">
                                <p className="text-4xl font-black text-femac-yellow tracking-tighter">K {(growthData.current.netProfit * 0.4).toLocaleString()}</p>
                                <p className="text-[9px] font-black text-femac-400 uppercase tracking-widest mt-2">40% Of Net Retained</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {activePage === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[750px] animate-in slide-in-from-right-4 duration-500">
          <div className="lg:col-span-1 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-50">
               <h3 className="text-xl font-black text-femac-900 uppercase tracking-tight">Active Sessions</h3>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Registry Comms</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
               {chatSessions.length === 0 ? (
                 <div className="py-20 text-center text-slate-300 uppercase font-black text-[9px]">No Active Registry Chats</div>
               ) : (
                 chatSessions.map(sess => (
                   <button 
                     key={sess.id} 
                     onClick={() => setActiveChatId(sess.id)}
                     className={`w-full p-6 rounded-3xl text-left border-2 transition-all relative ${activeChatId === sess.id ? 'bg-femac-900 border-femac-900 shadow-xl' : 'bg-slate-50 border-slate-50 hover:border-femac-yellow'}`}
                   >
                     <div className="flex justify-between items-start mb-2">
                        <p className={`text-[11px] font-black uppercase tracking-tight ${activeChatId === sess.id ? 'text-white' : 'text-femac-900'}`}>{sess.parentName}</p>
                        {sess.status === 'REQUESTED' && <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>}
                     </div>
                     <p className={`text-[9px] font-black uppercase tracking-widest mb-4 ${activeChatId === sess.id ? 'text-femac-400' : 'text-slate-400'}`}>{sess.parentId}</p>
                     
                     {sess.status === 'REQUESTED' ? (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-center justify-center animate-pulse">
                           <Headset size={12} className="mr-2" />
                           <span className="text-[8px] font-black uppercase tracking-widest">Escalation Node</span>
                        </div>
                     ) : sess.status === 'ACTIVE' ? (
                        <div className="bg-green-50 text-green-600 p-3 rounded-xl border border-green-100 flex items-center justify-center">
                           <Check size={12} className="mr-2" />
                           <span className="text-[8px] font-black uppercase tracking-widest">Connected</span>
                        </div>
                     ) : (
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100 flex items-center justify-center">
                           <Bot size={12} className="mr-2" />
                           <span className="text-[8px] font-black uppercase tracking-widest">AI Assisted</span>
                        </div>
                     )}
                   </button>
                 ))
               )}
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">
            {activeChat ? (
              <>
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-femac-900 text-white">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-femac-yellow rounded-2xl flex items-center justify-center text-femac-900 shadow-xl">
                        <UserLarge size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tight leading-none">{activeChat.parentName}</h4>
                        <p className="text-[9px] font-black text-femac-400 uppercase tracking-widest mt-2">Node: {activeChat.parentId} • Status: {activeChat.status}</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-3">
                      {activeChat.status === 'REQUESTED' && (
                        <button 
                          onClick={() => handleAcceptChat(activeChat.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center animate-in zoom-in"
                        >
                          <Headset size={14} className="mr-2" /> Accept Request
                        </button>
                      )}
                      <button 
                        onClick={() => handleCloseChat(activeChat.id)}
                        className="bg-white/10 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/20 transition-all"
                      >
                        Close Registry Node
                      </button>
                   </div>
                </div>

                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-slate-50/30">
                  {activeChat.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderRole === UserRole.EXECUTIVE_ACCOUNTS ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] p-6 rounded-[2rem] text-sm font-bold shadow-sm ${msg.senderRole === UserRole.EXECUTIVE_ACCOUNTS ? 'bg-femac-900 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                          {msg.text}
                          <div className={`text-[8px] mt-3 font-black uppercase tracking-widest opacity-40 ${msg.senderRole === UserRole.EXECUTIVE_ACCOUNTS ? 'text-femac-200' : 'text-slate-400'}`}>
                            {msg.isAi ? 'Registry AI' : msg.senderRole} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                       </div>
                    </div>
                  ))}
                </div>

                {activeChat.status === 'ACTIVE' && (
                  <form onSubmit={handleSendChatMessage} className="p-8 border-t border-slate-50 bg-white">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={chatInput} 
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type executive response..." 
                        className="w-full pl-8 pr-16 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none font-bold text-slate-700 focus:border-femac-yellow" 
                      />
                      <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-femac-900 text-femac-yellow p-4 rounded-2xl hover:bg-femac-yellow hover:text-femac-900 shadow-xl transition-all">
                        <Send size={24} />
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20 text-slate-300">
                 <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                   <MessageCircleQuestion size={48} className="opacity-20" />
                 </div>
                 <h4 className="text-3xl font-black text-femac-900/10 uppercase tracking-tighter">Select a Registry Node to Begin</h4>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Authorized Executive Comms Terminal</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Announcement Log Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-femac-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden relative animate-in zoom-in duration-300">
            <button onClick={() => setShowAnnModal(false)} className="absolute top-10 right-10 z-[110] text-slate-300 hover:text-femac-900 transition-colors p-2"><X size={32} /></button>
            
            <div className="flex-1 flex flex-col md:flex-row h-full">
              {/* Left Side: Create Form */}
              <div className="md:w-5/12 bg-slate-50 border-r border-slate-100 p-12 overflow-y-auto custom-scrollbar">
                <div className="mb-12">
                   <h4 className="text-3xl font-black text-femac-900 tracking-tighter uppercase leading-none">Broadcast <span className="text-femac-yellow">Registry</span></h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Add New Global Announcement</p>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Title (Auto-Upper)</label>
                    <input required type="text" value={newAnnTitle} onChange={(e) => setNewAnnTitle(e.target.value)} placeholder="e.g. 2026 ENROLLMENT NOW OPEN" className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl outline-none font-black text-xs text-femac-900 focus:border-femac-yellow transition-all" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Primary Message</label>
                    <textarea required rows={5} value={newAnnContent} onChange={(e) => setNewAnnContent(e.target.value)} placeholder="Enter details for the landing page notice board..." className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold text-xs text-slate-700 focus:border-femac-yellow transition-all leading-relaxed" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Asset Image URL (Optional)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="text" value={newAnnImage} onChange={(e) => setNewAnnImage(e.target.value)} placeholder="https://..." className="w-full pl-14 pr-5 py-5 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold text-xs text-slate-700 focus:border-femac-yellow transition-all" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Broadcast Priority</label>
                    <div className="flex bg-white p-1.5 rounded-2xl border-2 border-slate-100">
                       <button type="button" onClick={() => setNewAnnPriority('NORMAL')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAnnPriority === 'NORMAL' ? 'bg-femac-900 text-white shadow-lg' : 'text-slate-400 hover:text-femac-900'}`}>Normal Node</button>
                       <button type="button" onClick={() => setNewAnnPriority('URGENT')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAnnPriority === 'URGENT' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-red-600'}`}>Urgent Alert</button>
                    </div>
                  </div>

                  <button disabled={isSubmittingAnn} type="submit" className="w-full bg-femac-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-femac-yellow hover:text-femac-900 transition-all flex items-center justify-center space-x-3 active:scale-[0.98]">
                    {isSubmittingAnn ? <Loader2 size={20} className="animate-spin" /> : <Megaphone size={20} />}
                    <span>Publish to Registry</span>
                  </button>
                </form>
              </div>

              {/* Right Side: Announcement Log */}
              <div className="flex-1 p-16 overflow-y-auto custom-scrollbar bg-white">
                <div className="mb-12 flex justify-between items-end">
                   <div>
                      <h5 className="text-4xl font-black text-femac-900 tracking-tighter uppercase mb-2">Notice Board <span className="text-femac-yellow">Log</span></h5>
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">Active Institutional Broadcasts</p>
                   </div>
                   <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Nodes</p>
                      <p className="text-xl font-black text-femac-900">{announcements.length}</p>
                   </div>
                </div>

                <div className="space-y-6">
                   {announcements.length === 0 ? (
                      <div className="py-24 text-center">
                         <Megaphone size={64} className="text-slate-100 mx-auto mb-6" />
                         <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No active broadcasts in registry</p>
                      </div>
                   ) : (
                      announcements.map(ann => (
                         <div key={ann.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-femac-yellow hover:shadow-xl transition-all flex items-start gap-8">
                            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex-shrink-0 overflow-hidden relative shadow-inner">
                               {ann.imageUrl ? (
                                  <img src={ann.imageUrl} className="w-full h-full object-cover" alt="" />
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={32}/></div>
                               )}
                               {ann.priority === 'URGENT' && (
                                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-sm"></div>
                               )}
                            </div>
                            <div className="flex-1">
                               <div className="flex justify-between items-start mb-2">
                                  <div>
                                     <div className="flex items-center space-x-3 mb-1">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${ann.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-femac-50 text-femac-600 border-femac-100'}`}>{ann.priority} NODE</span>
                                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{ann.date}</span>
                                     </div>
                                     <h6 className="text-lg font-black text-femac-900 uppercase tracking-tight leading-none mb-4 group-hover:text-femac-yellow transition-colors">{ann.title}</h6>
                                  </div>
                                  <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                               </div>
                               <p className="text-xs font-bold text-slate-500 leading-relaxed line-clamp-2">{ann.content}</p>
                            </div>
                         </div>
                      ))
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
