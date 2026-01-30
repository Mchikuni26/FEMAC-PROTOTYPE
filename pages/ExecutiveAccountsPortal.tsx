import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, Users, TrendingUp, ArrowUpRight, CreditCard, Briefcase, FileText, Search, User as UserIcon, ChevronRight, X, MapPin, ShieldCheck, Download, CheckCircle, XCircle, FileCheck, User as UserLarge, BellRing, Smartphone, Landmark, Info, Lock, Receipt, History, Wallet, BadgeCheck, UserCog, Power, RotateCw, Trash2, LineChart as ChartIcon, Plus, Tag, MessageCircle, Headphones, MessageSquare, Megaphone, Upload, AlertCircle, CalendarClock, Scale, BookOpen, UserPlus, GraduationCap, Loader2, Send, Image as ImageIcon, BarChart3, PieChart, Wallet2, ShoppingBag, BriefcaseBusiness, UserCheck2, Timer, Bot, User, Calculator, Filter, Settings, Mail, Phone, LayoutGrid, Zap, FileEdit, Headset, MessageCircleQuestion, Check, ArrowDownRight, Activity, Trophy, FileSearch, UserX, Clock, Bell
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell, AreaChart, Area } from 'recharts';
import { MockDB } from '../services/mockDb.ts';
import { supabase } from '../supabase.ts';
import { ApplicationStatus, PaymentNotification, UserRole, StaffMember, FinancialYearSummary, InstitutionalExpense, ChatSession, Announcement, Student, ChatMessage, FeeTransaction, SchoolSettings } from '../types.ts';

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
  
  const [realtimeToast, setRealtimeToast] = useState<{title: string, msg: string} | null>(null);

  const [selectedApplication, setSelectedApplication] = useState<Student | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

    const studentChannel = supabase.channel('registry-changes')
      .on('postgres_changes', { event: 'INSERT', table: 'students', schema: 'public' }, (payload) => {
        const newStudent = payload.new as Student;
        setRealtimeToast({
          title: 'NEW ADMISSION FILE',
          msg: `Transmission received from ${newStudent.firstName} ${newStudent.lastName}`
        });
        refreshData(true);
        setTimeout(() => setRealtimeToast(null), 5000);
      })
      .subscribe();

    const interval = setInterval(() => { refreshData(true); }, 15000);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(studentChannel);
    };
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {realtimeToast && (
        <div className="fixed top-10 right-10 z-[200] bg-femac-900 border-2 border-femac-yellow text-white p-6 rounded-[2rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-10 duration-500 flex items-center gap-6">
           <div className="w-12 h-12 bg-femac-yellow text-femac-900 rounded-2xl flex items-center justify-center animate-bounce">
              <Bell size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-femac-yellow mb-1">{realtimeToast.title}</p>
              <p className="text-xs font-bold">{realtimeToast.msg}</p>
           </div>
           <button onClick={() => setRealtimeToast(null)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400"><X size={16}/></button>
        </div>
      )}

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
              <div className="bg-amber-50 text-femac-900 px-6 py-3 rounded-2xl flex items-center shadow-xl border-2 border-femac-900/10 animate-in slide-in-from-top-4">
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
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-20 text-slate-300