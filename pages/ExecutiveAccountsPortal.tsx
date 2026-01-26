
import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, PieChart, Briefcase, FileText, Search, User as UserIcon, ChevronRight, X, MapPin, Calendar, ShieldCheck, Download, UserPlus, CheckCircle, XCircle, FileCheck, Phone, Mail, UserCheck, Clock, User as UserLarge, BellRing,
  Send, Sparkles, CheckCircle2, ShieldAlert, Smartphone, Landmark, Info, Lock, Receipt, History, Wallet, Award, BadgeCheck, UserCog, Power, RotateCw, Trash2, LineChart as ChartIcon, BarChart3, TrendingDown, Plus, Tag, MessageCircle, Headphones, Bot, MessageSquare
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MockDB } from '../services/mockDb';
import { ApplicationStatus, PaymentNotification, UserRole, StaffMember, FinancialYearSummary, InstitutionalExpense, ChatSession } from '../types';

interface ExecutiveAccountsPortalProps {
  activePage?: string;
}

export const ExecutiveAccountsPortal: React.FC<ExecutiveAccountsPortalProps> = ({ activePage = 'financials' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState(MockDB.getStudents());
  const [staff, setStaff] = useState<StaffMember[]>(MockDB.getStaff());
  const [notifications, setNotifications] = useState<PaymentNotification[]>(MockDB.getNotifications());
  const [growthData, setGrowthData] = useState<{current: FinancialYearSummary, history: FinancialYearSummary[]}>(MockDB.getGrowthMetrics());
  const [expenses, setExpenses] = useState<InstitutionalExpense[]>(MockDB.getExpenses());
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(MockDB.getChatSessions());
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');
  
  // Internal sub-tabs for specific domains
  const [financialSubTab, setFinancialSubTab] = useState<'registry' | 'notifications'>('registry');
  const [reviewTab, setReviewTab] = useState<'ledger' | 'application'>('ledger');
  const [showEnrolledNote, setShowEnrolledNote] = useState(false);

  // Add Expense State
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<InstitutionalExpense['category']>('UTILITIES');
  const [expDescription, setExpDescription] = useState('');

  const refreshData = () => {
    setStudents(MockDB.getStudents());
    setNotifications(MockDB.getNotifications());
    setStaff(MockDB.getStaff());
    setGrowthData(MockDB.getGrowthMetrics());
    setExpenses(MockDB.getExpenses());
    setChatSessions(MockDB.getChatSessions());
  };

  useEffect(() => {
    refreshData();
    // Reset search when switching main pages
    setSearchTerm('');
  }, [activePage]);

  const handleApplicationAction = (studentId: string, status: ApplicationStatus) => {
    const action = status === ApplicationStatus.ACCEPTED ? "ACCEPT" : "DECLINE";
    if (confirm(`Authorize registry to ${action} this candidate?`)) {
      MockDB.updateStudentStatus(studentId, status);
      refreshData();
      if (status === ApplicationStatus.ACCEPTED) {
        setShowEnrolledNote(true);
        setTimeout(() => setShowEnrolledNote(false), 5000);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !msgInput.trim()) return;
    MockDB.sendMessage(activeChatId, 'EXE-001', UserRole.EXECUTIVE_ACCOUNTS, msgInput.trim());
    setMsgInput('');
    setChatSessions(MockDB.getChatSessions());
  };

  const handleAcceptChat = (sid: string) => {
    MockDB.acceptChatRequest(sid);
    setActiveChatId(sid);
    refreshData();
  };

  const handleVerifyPayment = (notifId: string) => {
    if (confirm("Confirm payment verification? This will instantly unlock results for the pupil.")) {
      MockDB.verifyNotification(notifId);
      refreshData();
    }
  };

  const handleRenewContract = (staffId: string) => {
    if (confirm("Execute contract renewal? This grants a 12-month active term from today.")) {
      MockDB.renewContract(staffId);
      refreshData();
    }
  };

  const handleTerminateContract = (staffId: string) => {
    if (confirm("WARNING: TERMINATE CONTRACT? This will immediately revoke portal access and finalize the personnel record.")) {
      MockDB.terminateContract(staffId);
      refreshData();
    }
  };

  const handleArchiveYear = () => {
    if (confirm(`FINAL ARCHIVAL: Finalize all accounts for ${growthData.current.year} and initialize the new financial period? Historical reports will be preserved.`)) {
      MockDB.archiveFinancialYear();
      refreshData();
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expDescription) return;
    
    MockDB.addExpense({
      amount: parseFloat(expAmount),
      category: expCategory,
      description: expDescription
    });
    
    setExpAmount('');
    setExpDescription('');
    setShowExpenseForm(false);
    refreshData();
  };

  const filteredStudents = students.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.duties.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentFees = selectedStudentId ? MockDB.getFeesByStudent(selectedStudentId) : [];
  
  const totalBilled = studentFees.filter(f => f.type === 'BILL').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = Math.abs(studentFees.filter(f => f.type === 'PAYMENT').reduce((acc, curr) => acc + curr.amount, 0));
  const balance = totalBilled - totalPaid;

  useEffect(() => {
    if (selectedStudent?.applicationStatus === ApplicationStatus.PENDING) {
      setReviewTab('application');
    } else {
      setReviewTab('ledger');
    }
  }, [selectedStudentId]);

  const getStatusBadge = (status?: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACCEPTED:
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-200">Enrolled</span>;
      case ApplicationStatus.DECLINED:
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-200">Declined</span>;
      default:
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-200 animate-pulse">Pending</span>;
    }
  };

  const chartData = [...growthData.history, growthData.current].map(h => ({
    year: h.year,
    revenue: h.totalRevenue,
    expenses: h.totalExpenses,
    net: h.netProfit
  }));

  const activeChat = chatSessions.find(s => s.id === activeChatId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {showEnrolledNote && (
        <div className="fixed top-24 right-10 z-[200] bg-green-600 text-white p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-right duration-500 max-w-xs border-2 border-white/20">
           <div className="flex items-start space-x-4">
              <CheckCircle size={24} className="text-femac-yellow" />
              <div>
                 <p className="font-black uppercase tracking-tight text-sm">Pupil Fully Synchronized</p>
                 <p className="text-[10px] font-bold mt-1 opacity-90 leading-relaxed uppercase">Details propagate to all Teacher & Exam Registries instantly.</p>
              </div>
           </div>
        </div>
      )}

      {/* Domain: MESSAGES / CHAT HUB */}
      {activePage === 'messages' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 h-[700px] flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black text-femac-900 tracking-tighter uppercase leading-none">Executive Chat Hub</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Parent Inquiries & Live Node Assistance</p>
              </div>
              <div className="bg-femac-yellow text-femac-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center shadow-lg animate-pulse">
                <Headphones size={16} className="mr-2" /> Live Queue: {chatSessions.filter(s => s.status === 'REQUESTED').length}
              </div>
           </div>

           <div className="flex-1 bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex">
              <div className="w-80 border-r border-slate-50 flex flex-col">
                 <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Communication Registry</p>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {chatSessions.length > 0 ? chatSessions.map(session => (
                      <button 
                        key={session.id} 
                        onClick={() => setActiveChatId(session.id)}
                        className={`w-full p-6 text-left border-b border-slate-50 transition-all flex items-center space-x-4 ${activeChatId === session.id ? 'bg-femac-50/50' : 'hover:bg-slate-50'}`}
                      >
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm uppercase ${session.status === 'REQUESTED' ? 'bg-femac-yellow text-femac-900 animate-pulse' : 'bg-femac-900 text-femac-yellow'}`}>
                            {session.parentName[0]}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-black text-femac-900 uppercase text-xs truncate">{session.parentName}</p>
                              {session.status === 'REQUESTED' && <div className="w-2 h-2 bg-femac-yellow rounded-full"></div>}
                            </div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {session.status.replace('_', ' ')}</p>
                         </div>
                      </button>
                    )) : (
                      <div className="p-10 text-center opacity-30">
                        <MessageSquare className="mx-auto mb-4" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Active Nodes</p>
                      </div>
                    )}
                 </div>
              </div>

              <div className="flex-1 flex flex-col bg-slate-50/20">
                 {activeChat ? (
                   <>
                     <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 bg-femac-900 rounded-xl flex items-center justify-center text-femac-yellow font-black uppercase">{activeChat.parentName[0]}</div>
                           <div>
                              <p className="font-black text-femac-900 uppercase text-sm tracking-tight">{activeChat.parentName}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ID: {activeChat.parentId}</p>
                           </div>
                        </div>
                        {activeChat.status === 'REQUESTED' && (
                          <button onClick={() => handleAcceptChat(activeChat.id)} className="bg-femac-900 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-lg">
                            Accept Request
                          </button>
                        )}
                     </div>
                     <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {activeChat.messages.map(m => (
                          <div key={m.id} className={`flex ${m.senderRole === UserRole.PARENT ? 'justify-start' : 'justify-end'}`}>
                             <div className={`max-w-[70%] p-5 rounded-[1.5rem] text-sm font-medium shadow-sm leading-relaxed ${m.senderRole === UserRole.PARENT ? 'bg-white text-slate-700 rounded-bl-none border border-slate-100' : 'bg-femac-900 text-white rounded-br-none'}`}>
                                {m.text}
                                <div className={`text-[8px] mt-2 font-black uppercase tracking-widest opacity-40 ${m.senderRole === UserRole.PARENT ? 'text-slate-400' : 'text-femac-300'}`}>
                                   {m.timestamp} {m.isAi ? '• AI ASSISTANT' : ''}
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                     {(activeChat.status === 'ACTIVE' || activeChat.status === 'REQUESTED') && (
                       <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100">
                          <div className="relative">
                            <input 
                              type="text" 
                              value={msgInput}
                              onChange={(e) => setMsgInput(e.target.value)}
                              placeholder="Respond to parent..."
                              className="w-full pl-6 pr-20 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm text-slate-700 focus:border-femac-yellow transition-all shadow-inner"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-femac-900 text-femac-yellow px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-femac-yellow hover:text-femac-900 transition-all">
                              Send Node
                            </button>
                          </div>
                       </form>
                     )}
                   </>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                      <div className="w-32 h-32 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center mb-10">
                        <MessageCircle size={64} className="opacity-10" />
                      </div>
                      <h4 className="text-3xl font-black text-slate-200 uppercase tracking-tighter leading-none">Select a Registry Thread</h4>
                      <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-4">Identify a chat node from the sidebar to begin administrative correspondence</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Domain: FINANCIALS (Registry + Notifications) */}
      {activePage === 'financials' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-femac-900 tracking-tighter uppercase leading-none">Financial Operations</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Institutional Revenue & Candidate Ledger</p>
            </div>
            <div className="flex bg-white/50 p-1.5 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
                <button 
                    onClick={() => setFinancialSubTab('registry')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${financialSubTab === 'registry' ? 'bg-femac-900 text-white shadow-lg' : 'text-slate-400 hover:text-femac-900'}`}
                >
                    Registry Matrix
                </button>
                <button 
                    onClick={() => setFinancialSubTab('notifications')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${financialSubTab === 'notifications' ? 'bg-femac-900 text-white shadow-lg' : 'text-slate-400 hover:text-femac-900'}`}
                >
                    Verification Node
                    {notifications.filter(n => n.status === 'PENDING').length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-femac-yellow text-femac-900 rounded-full flex items-center justify-center text-[8px] font-black shadow-lg animate-bounce">
                        {notifications.filter(n => n.status === 'PENDING') .length}
                      </span>
                    )}
                </button>
            </div>
          </div>

          {financialSubTab === 'registry' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-4"><div className="bg-green-50 p-4 rounded-2xl"><DollarSign className="text-green-600" size={24} /></div></div>
                   <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Fee Yield</p><h4 className="text-3xl font-black text-femac-900 tracking-tighter">K {growthData.current.totalRevenue.toLocaleString()}</h4></div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-4"><div className="bg-blue-50 p-4 rounded-2xl"><Users className="text-blue-600" size={24} /></div></div>
                   <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Enrolled Registry</p><h4 className="text-3xl font-black text-femac-900 tracking-tighter">{students.filter(s => s.applicationStatus === ApplicationStatus.ACCEPTED).length}</h4></div>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-black text-femac-900 uppercase tracking-tight flex items-center">
                      <UserIcon className="mr-3 text-femac-yellow" size={28} /> Pupil Master Registry
                    </h3>
                  </div>
                  <div className="relative md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search Registry..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all text-sm" 
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-10 py-5">Academic ID</th>
                        <th className="px-6 py-5">Full Name</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5">Results</th>
                        <th className="px-6 py-5">Ledger</th>
                        <th className="px-10 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.map(student => {
                        const sBalance = MockDB.getFeesByStudent(student.id).reduce((a, b) => a + b.amount, 0);
                        return (
                          <tr key={student.id} className="group hover:bg-femac-50/50 transition-colors">
                            <td className="px-10 py-6 font-black text-femac-900 uppercase tracking-tighter text-sm">{student.id}</td>
                            <td className="px-6 py-6 font-bold text-slate-600 uppercase text-[10px]">{student.firstName} {student.lastName}</td>
                            <td className="px-6 py-6">{getStatusBadge(student.applicationStatus)}</td>
                            <td className="px-6 py-6">
                                {student.resultsUnlocked ? (
                                    <span className="flex items-center text-green-600 text-[8px] font-black uppercase tracking-widest"><ShieldCheck size={12} className="mr-1" /> Unlocked</span>
                                ) : (
                                    <span className="flex items-center text-slate-300 text-[8px] font-black uppercase tracking-widest"><Lock size={12} className="mr-1" /> Locked</span>
                                )}
                            </td>
                            <td className="px-6 py-6 font-black text-sm tracking-tight text-femac-900">K {sBalance.toLocaleString()}</td>
                            <td className="px-10 py-6 text-right">
                              <button onClick={() => setSelectedStudentId(student.id)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-femac-900 hover:text-femac-yellow transition-all flex items-center justify-center ml-auto">
                                 <ChevronRight size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-6">
               <div className="bg-femac-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-femac-yellow opacity-5 blur-[100px]"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Verification Queue</h3>
                    <p className="text-femac-300 font-bold text-xs uppercase tracking-widest">Confirm payment hashes to unlock candidate results</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[200px] relative z-10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-femac-400 mb-1">Awaiting Action</p>
                     <p className="text-4xl font-black text-femac-yellow leading-none">{notifications.filter(n => n.status === 'PENDING').length}</p>
                  </div>
               </div>

               {notifications.length > 0 ? (
                 notifications.map(notif => {
                   const student = MockDB.getStudentById(notif.studentId);
                   const isVerified = notif.status === 'VERIFIED';
                   return (
                     <div key={notif.id} className={`bg-white p-8 rounded-[2.5rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 ${isVerified ? 'border-slate-100 opacity-60' : 'border-femac-yellow shadow-xl shadow-femac-yellow/5'}`}>
                         <div className="flex items-start space-x-6">
                            <div className={`p-5 rounded-2xl ${isVerified ? 'bg-slate-100 text-slate-400' : 'bg-femac-900 text-femac-yellow'}`}>
                               {notif.method === 'MOMO' ? <Smartphone size={32} /> : <Landmark size={32} />}
                            </div>
                            <div>
                               <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{notif.timestamp}</span>
                                  {isVerified ? (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-200">Authorised</span>
                                  ) : (
                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-200">Needs Verification</span>
                                  )}
                               </div>
                               <h4 className="text-xl font-black text-femac-900 uppercase tracking-tight">K {notif.amount.toLocaleString()} Settlement</h4>
                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Candidate ID: {notif.studentId} • {student?.firstName} {student?.lastName}</p>
                               <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-3 flex items-center italic"><Info size={12} className="mr-1 text-femac-yellow" /> {notif.details}</p>
                            </div>
                         </div>

                         {!isVerified ? (
                           <button 
                             onClick={() => handleVerifyPayment(notif.id)}
                             className="bg-femac-900 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3"
                           >
                              <ShieldCheck size={18} />
                              <span>Verify & Unlock Results</span>
                           </button>
                         ) : (
                           <div className="flex items-center text-green-600 font-black uppercase tracking-widest text-[10px] bg-green-50 px-6 py-3 rounded-2xl">
                              <CheckCircle2 size={16} className="mr-2" /> Results Unlocked
                           </div>
                         )}
                     </div>
                   );
                 })
               ) : (
                 <div className="py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center">
                    <BellRing size={48} className="text-slate-200 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300">No payment notifications in registry</p>
                 </div>
               )}
            </div>
          )}
        </div>
      )}

      {/* Domain: STAFFING */}
      {activePage === 'staff' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-femac-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
              <div className="absolute top-0 right-0 w-80 h-80 bg-femac-yellow opacity-[0.03] blur-[120px]"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-femac-yellow p-4 rounded-2xl shadow-xl shadow-femac-yellow/20">
                    <UserCog className="text-femac-900" size={32} />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Staff Registry</h3>
                    <p className="text-femac-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Personnel & Contractual Oversight Node</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-femac-400 mb-1">Active Payroll</p>
                  <p className="text-2xl font-black text-femac-yellow leading-none">K {staff.filter(s => s.contractStatus === 'ACTIVE').reduce((a, b) => a + b.salary, 0).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-femac-400 mb-1">Total Staff</p>
                  <p className="text-2xl font-black text-white leading-none">{staff.length}</p>
                </div>
              </div>
           </div>

           <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="relative flex-1 group">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-femac-yellow transition-colors" size={24} />
                   <input 
                    type="text" 
                    placeholder="Search Staff by Name, Duty, or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none font-bold text-slate-700 focus:border-femac-yellow transition-all text-sm shadow-inner"
                   />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100 flex items-center">
                    <ShieldAlert size={14} className="text-amber-500 mr-2" />
                    <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest leading-none">Contracts expire automatically after 1 year</span>
                  </div>
                  <button className="bg-femac-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center shadow-xl hover:bg-femac-yellow hover:text-femac-900 transition-all active:scale-95">
                    <UserPlus size={18} className="mr-3" /> Add Staff Member
                  </button>
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-6">Full Name & Identification</th>
                      <th className="px-6 py-6">Assigned Duties</th>
                      <th className="px-6 py-6 text-center">Grade Focus</th>
                      <th className="px-6 py-6 text-center">Contract Lifecycle</th>
                      <th className="px-6 py-6 text-right">Payroll & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStaff.map(staffMember => (
                      <tr key={staffMember.id} className="group hover:bg-femac-50/50 transition-all duration-300">
                        <td className="px-10 py-8">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm group-hover:bg-femac-yellow group-hover:text-femac-900 transition-all">
                              {staffMember.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-femac-900 uppercase text-sm leading-none mb-1.5">{staffMember.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{staffMember.id} • Joined {staffMember.hireDate}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8">
                           <p className="text-xs font-bold text-slate-600 leading-relaxed max-w-xs">{staffMember.duties}</p>
                        </td>
                        <td className="px-6 py-8 text-center">
                           {staffMember.assignedGrade ? (
                             <span className="bg-femac-900 text-femac-yellow px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-femac-800">Grade {staffMember.assignedGrade} Node</span>
                           ) : (
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Admin Hub</span>
                           )}
                        </td>
                        <td className="px-6 py-8">
                           <div className="flex flex-col items-center">
                              {staffMember.contractStatus === 'ACTIVE' ? (
                                <span className="flex items-center text-green-600 text-[9px] font-black uppercase tracking-widest bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                                  <BadgeCheck size={12} className="mr-1" /> Active Term
                                </span>
                              ) : staffMember.contractStatus === 'EXPIRED' ? (
                                <span className="flex items-center text-amber-600 text-[9px] font-black uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                                  <Clock size={12} className="mr-1" /> Term Expired
                                </span>
                              ) : (
                                <span className="flex items-center text-red-600 text-[9px] font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                  <XCircle size={12} className="mr-1" /> Terminated
                                </span>
                              )}
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Expires: {staffMember.contractExpiryDate}</p>
                           </div>
                        </td>
                        <td className="px-6 py-8">
                           <div className="flex items-center justify-end space-x-6">
                              <div className="text-right">
                                <p className="text-lg font-black text-femac-900 tracking-tighter leading-none mb-1">K {staffMember.salary.toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Net Payable</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <button 
                                   onClick={() => handleRenewContract(staffMember.id)}
                                   title="Renew/Activate Contract"
                                   className="p-3 bg-white border border-slate-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm"
                                 >
                                   <RotateCw size={16} />
                                 </button>
                                 <button 
                                   onClick={() => handleTerminateContract(staffMember.id)}
                                   title="Terminate Contract"
                                   className="p-3 bg-white border border-slate-100 text-red-500 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                                 >
                                   <Power size={16} />
                                 </button>
                              </div>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
             {filteredStaff.length === 0 && (
               <div className="py-24 text-center">
                  <UserLarge className="mx-auto text-slate-100 mb-4" size={64} />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-300">No staff identified in this search</p>
               </div>
             )}
           </div>
        </div>
      )}

      {/* Domain: GROWTH */}
      {activePage === 'growth' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                 <div className="p-5 bg-femac-900 text-femac-yellow rounded-[2rem] shadow-2xl">
                    <ChartIcon size={32} />
                 </div>
                 <div>
                    <h3 className="text-4xl font-black text-femac-900 uppercase tracking-tighter">Institutional Growth Matrix</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">FY {growthData.current.year} Performance Node</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="bg-white border-2 border-femac-900 text-femac-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-femac-900 hover:text-white transition-all shadow-lg flex items-center group"
                  >
                    <Plus size={16} className="mr-3 group-hover:rotate-90 transition-transform" /> Log Expense Node
                  </button>
                  <button 
                    onClick={handleArchiveYear}
                    className="bg-femac-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-xl group"
                  >
                    <History size={16} className="mr-3" /> Archive Financial Year
                  </button>
              </div>
           </div>

           {showExpenseForm && (
             <div className="bg-white p-10 rounded-[3rem] border-2 border-femac-yellow/30 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                   <h4 className="text-xl font-black text-femac-900 uppercase tracking-tight flex items-center">
                     <Receipt size={24} className="mr-3 text-femac-yellow" /> Create Expenditure Record
                   </h4>
                   <button onClick={() => setShowExpenseForm(false)} className="text-slate-300 hover:text-femac-900"><X size={24}/></button>
                </div>
                <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Expense Amount (ZMW)</label>
                      <input 
                        required type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)}
                        placeholder="e.g., 5000"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-femac-900 focus:border-femac-yellow transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Classification</label>
                      <select 
                        value={expCategory} onChange={(e) => setExpCategory(e.target.value as any)}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-femac-900 uppercase focus:border-femac-yellow transition-all appearance-none"
                      >
                         <option value="UTILITIES">Utilities & Power</option>
                         <option value="MAINTENANCE">General Maintenance</option>
                         <option value="RESOURCES">Academic Resources</option>
                         <option value="MARKETING">Institutional Outreach</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Registry Descriptor</label>
                      <input 
                        required type="text" value={expDescription} onChange={(e) => setExpDescription(e.target.value)}
                        placeholder="Brief purpose of expense..."
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-femac-900 focus:border-femac-yellow transition-all"
                      />
                   </div>
                   <button type="submit" className="md:col-span-3 bg-femac-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-xl mt-4">
                      Finalize Expenditure Node
                   </button>
                </form>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Gross Revenue</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-femac-900 tracking-tighter">K {growthData.current.totalRevenue.toLocaleString()}</h4>
                    <TrendingUp className="text-green-500" size={24} />
                 </div>
                 <p className="text-[8px] font-bold text-slate-400 uppercase mt-4">Verified Fee Settlements</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Gross Profit</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-femac-900 tracking-tighter">K {growthData.current.grossProfit.toLocaleString()}</h4>
                    <Tag className="text-blue-400" size={24} />
                 </div>
                 <p className="text-[8px] font-bold text-slate-400 uppercase mt-4">Revenue - Operational Costs</p>
              </div>

              <div className="bg-femac-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-femac-yellow opacity-5 blur-2xl"></div>
                 <p className="text-[10px] font-black uppercase text-femac-400 tracking-widest mb-3">Net Profit Yield</p>
                 <div className="flex items-center justify-between">
                    <h4 className={`text-3xl font-black tracking-tighter ${growthData.current.netProfit >= 0 ? 'text-femac-yellow' : 'text-red-400'}`}>
                      K {growthData.current.netProfit.toLocaleString()}
                    </h4>
                    <BadgeCheck className="text-femac-400" size={24} />
                 </div>
                 <p className="text-[8px] font-bold text-white/40 uppercase mt-4">Current Year Liquid Capital</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Student Growth Index</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-femac-900 tracking-tighter">{growthData.current.studentCount}</h4>
                    <Users className="text-blue-500" size={24} />
                 </div>
                 <p className="text-[8px] font-bold text-slate-400 uppercase mt-4">Verified Active Registry</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                 <div className="flex items-center justify-between mb-10">
                    <h4 className="text-xl font-black text-femac-900 uppercase tracking-tight">Growth Trend Projection</h4>
                    <div className="flex items-center space-x-6">
                       <div className="flex items-center space-x-2"><div className="w-2 h-2 bg-femac-900 rounded-full"></div><span className="text-[8px] font-black text-slate-400 uppercase">Revenue</span></div>
                       <div className="flex items-center space-x-2"><div className="w-2 h-2 bg-femac-yellow rounded-full"></div><span className="text-[8px] font-black text-slate-400 uppercase">Net Profit</span></div>
                    </div>
                 </div>
                 <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#102a43" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#102a43" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#facc15" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontStyle: 'bold', fill: '#94a3b8'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontStyle: 'bold', fill: '#94a3b8'}} />
                          <Tooltip 
                             contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px', backgroundColor: '#102a43'}}
                             itemStyle={{color: '#fff', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase'}}
                             labelStyle={{color: '#facc15', marginBottom: '8px', fontSize: '10px', fontWeight: 900}}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#102a43" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                          <Area type="monotone" dataKey="net" stroke="#facc15" fillOpacity={1} fill="url(#colorNet)" strokeWidth={4} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                    <h4 className="text-sm font-black text-femac-900 uppercase tracking-widest flex items-center">
                       <History className="mr-3 text-femac-yellow" size={18} /> Historical Reports
                    </h4>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4">
                    {growthData.history.slice().reverse().map(h => (
                       <div key={h.year} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-femac-900 transition-all group">
                          <div className="flex items-center justify-between mb-4">
                             <span className="text-xl font-black text-femac-900 uppercase">FY {h.year}</span>
                             <div className="bg-white p-2 rounded-xl group-hover:bg-femac-yellow transition-colors"><FileCheck size={16} /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Yield</p>
                                <p className="text-sm font-black text-femac-900">K {h.totalRevenue.toLocaleString()}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Profitability</p>
                                <p className="text-sm font-black text-green-600">+{Math.round((h.netProfit/h.totalRevenue)*100)}%</p>
                             </div>
                          </div>
                       </div>
                    ))}
                    {growthData.history.length === 0 && (
                      <div className="py-20 text-center flex flex-col items-center">
                        <ChartIcon size={48} className="text-slate-100 mb-4" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No historical data identified</p>
                      </div>
                    )}
                 </div>
                 <div className="p-8 border-t border-slate-50 bg-femac-900 text-white">
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[9px] font-black uppercase text-femac-400">Total Asset Growth</p>
                       <span className="text-femac-yellow font-black text-lg">+18.5%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="w-[18.5%] h-full bg-femac-yellow shadow-[0_0_8px_#facc15]"></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                 <h4 className="text-xl font-black text-femac-900 uppercase tracking-tight">Institutional Expense Ledger</h4>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FY {growthData.current.year} Entries</p>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                       <tr>
                          <th className="px-10 py-6">Expenditure Identity</th>
                          <th className="px-6 py-6">Classification</th>
                          <th className="px-6 py-6">Processing Date</th>
                          <th className="px-10 py-6 text-right">Amount node</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       <tr className="bg-slate-50/50">
                          <td className="px-10 py-6">
                             <p className="text-sm font-black text-femac-900 uppercase tracking-tighter leading-none mb-1.5">Consolidated Staff Salaries</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase">Automatic Payroll Sync Node</p>
                          </td>
                          <td className="px-6 py-6"><span className="bg-femac-900 text-femac-yellow px-3 py-1 rounded-lg text-[8px] font-black uppercase">Core Salaries</span></td>
                          <td className="px-6 py-6 font-bold text-slate-400 uppercase text-[10px]">Monthly Recurring</td>
                          <td className="px-10 py-6 text-right font-black text-red-600">K {growthData.current.totalSalaries.toLocaleString()}</td>
                       </tr>
                       {expenses.map((exp) => (
                         <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-10 py-6">
                             <p className="text-sm font-black text-femac-900 uppercase tracking-tighter leading-none mb-1.5">{exp.description}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase">Node ID: {exp.id}</p>
                           </td>
                           <td className="px-6 py-6">
                             <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase">{exp.category}</span>
                           </td>
                           <td className="px-6 py-6 font-bold text-slate-400 uppercase text-[10px]">{exp.date}</td>
                           <td className="px-10 py-6 text-right font-black text-red-500">K {exp.amount.toLocaleString()}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* SHARED MODAL: PUPIL REVIEW (Triggered from Financials) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-femac-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden relative flex flex-col md:flex-row h-[85vh]">
            <button onClick={() => setSelectedStudentId(null)} className="absolute top-8 right-8 text-slate-400 hover:text-femac-900 transition-colors z-[110]"><X size={32} /></button>
            <div className="md:w-80 bg-femac-900 p-10 text-white flex flex-col items-center text-center relative shrink-0">
              <div className="w-28 h-28 rounded-[2.5rem] bg-femac-yellow flex items-center justify-center text-femac-900 text-3xl font-black mb-6 uppercase shadow-xl">
                {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
              </div>
              <h4 className="text-3xl font-black uppercase tracking-tighter mb-2 leading-none">{selectedStudent.id}</h4>
              <p className="text-femac-200 text-xs font-bold uppercase tracking-widest mb-6">{selectedStudent.firstName} {selectedStudent.lastName}</p>
              <div className="mb-6">{getStatusBadge(selectedStudent.applicationStatus)}</div>
              
              <div className="mt-auto space-y-4 w-full">
                <button onClick={() => setReviewTab('ledger')} className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${reviewTab === 'ledger' ? 'bg-femac-yellow text-femac-900' : 'text-femac-300 hover:text-white'}`}>Financial Ledger</button>
                <button onClick={() => setReviewTab('application')} className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${reviewTab === 'application' ? 'bg-femac-yellow text-femac-900' : 'text-femac-300 hover:text-white'}`}>Application File</button>
              </div>
            </div>
            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-50/50">
               {reviewTab === 'ledger' ? (
                 <div className="animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                       <div>
                         <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Financial Analysis Matrix</h5>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comprehensive Fee History Node</p>
                       </div>
                       <div className="bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                          <History size={16} className="text-femac-yellow" />
                          <span className="text-[9px] font-black text-femac-900 uppercase">Archive Sync: Active</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-femac-yellow transition-colors group">
                          <div className="flex justify-between items-start mb-4">
                             <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-femac-900 group-hover:text-femac-yellow transition-colors"><Receipt size={20} /></div>
                             <ArrowUpRight size={16} className="text-slate-300" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Cumulative Billings</p>
                            <h6 className="text-3xl font-black tracking-tighter text-femac-900">K {totalBilled.toLocaleString()}</h6>
                            <p className="text-[7px] font-bold text-slate-400 uppercase mt-1">Total value since enrollment</p>
                          </div>
                        </div>

                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-green-500 transition-colors group">
                          <div className="flex justify-between items-start mb-4">
                             <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors"><Wallet size={20} /></div>
                             <CheckCircle size={16} className="text-green-300" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Recovered Capital</p>
                            <h6 className="text-3xl font-black tracking-tighter text-green-600">K {totalPaid.toLocaleString()}</h6>
                            <p className="text-[7px] font-bold text-slate-400 uppercase mt-1">Verified amounts paid in full</p>
                          </div>
                        </div>

                        <div className="p-8 bg-femac-900 rounded-3xl border border-femac-yellow/20 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-femac-yellow opacity-10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2"></div>
                          <div className="flex justify-between items-start mb-4 relative z-10">
                             <div className="bg-white/10 p-3 rounded-xl text-femac-yellow"><DollarSign size={20} /></div>
                             <Info size={16} className="text-femac-400" />
                          </div>
                          <div className="relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-femac-400 mb-1">Registry Balance</p>
                            <h6 className={`text-3xl font-black tracking-tighter ${balance > 0 ? 'text-red-400' : 'text-green-400'}`}>K {balance.toLocaleString()}</h6>
                            <p className="text-[7px] font-bold text-white/40 uppercase mt-1">To be paid to finalize node</p>
                          </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between px-2 mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chronological Transaction Feed</p>
                        <div className="flex items-center space-x-4">
                           <div className="flex items-center space-x-1.5"><div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div><span className="text-[8px] font-black text-slate-400 uppercase">Bills</span></div>
                           <div className="flex items-center space-x-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div><span className="text-[8px] font-black text-slate-400 uppercase">Payments</span></div>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {studentFees.map(fee => (
                          <div key={fee.id} className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center space-x-6">
                              <div className={`p-4 rounded-xl transition-all ${fee.type === 'BILL' ? 'bg-slate-900 text-femac-yellow group-hover:scale-110' : 'bg-green-100 text-green-600 group-hover:scale-110'}`}>
                                {fee.type === 'BILL' ? <Receipt size={18} /> : <CheckCircle size={18} />}
                              </div>
                              <div>
                                <p className="font-black text-femac-900 uppercase text-[11px] mb-1 tracking-tight">{fee.description}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{fee.date} • FAIMS-TXN-SYNC</p>
                              </div>
                            </div>
                            <div className="text-right">
                               <span className={`font-black text-lg tracking-tighter block leading-none ${fee.type === 'BILL' ? 'text-femac-900' : 'text-green-600'}`}>
                                 {fee.type === 'BILL' ? '+' : '-'} K {Math.abs(fee.amount).toLocaleString()}
                               </span>
                               <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Verified Entry</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="animate-in fade-in slide-in-from-left-4 h-full flex flex-col">
                    <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-10">Registry Application File Review</h5>
                    <div className="grid grid-cols-2 gap-12">
                       <div className="space-y-6">
                          <div className="pb-3 border-b-2 border-femac-yellow/20 font-black text-lg text-femac-900 uppercase tracking-tighter">Identity Registry</div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                             <div><p className="text-[9px] font-black uppercase text-slate-400 mb-1">First Name</p><p className="font-bold">{selectedStudent.firstName}</p></div>
                             <div><p className="text-[9px] font-black uppercase text-slate-400 mb-1">Last Name</p><p className="font-bold">{selectedStudent.lastName}</p></div>
                             <div><p className="text-[9px] font-black uppercase text-slate-400 mb-1">Grade Level</p><p className="font-bold">GRADE {selectedStudent.grade}</p></div>
                             <div><p className="text-[9px] font-black uppercase text-slate-400 mb-1">Registry Lock</p><p className="font-bold">{selectedStudent.resultsUnlocked ? 'VERIFIED' : 'LOCKED'}</p></div>
                          </div>
                       </div>
                       <div className="p-8 bg-femac-900 rounded-[2.5rem] text-white shadow-2xl relative">
                          <h6 className="text-[10px] font-black uppercase tracking-[0.3em] text-femac-yellow mb-4">Admissions Authorisation</h6>
                          <div className="flex flex-col gap-4">
                             {selectedStudent.applicationStatus === ApplicationStatus.PENDING ? (
                                <>
                                   <button onClick={() => handleApplicationAction(selectedStudent.id, ApplicationStatus.ACCEPTED)} className="w-full py-4 bg-femac-yellow text-femac-900 rounded-xl font-black uppercase tracking-widest text-[10px]">Authorise Enrollment</button>
                                   <button onClick={() => handleApplicationAction(selectedStudent.id, ApplicationStatus.DECLINED)} className="w-full py-4 bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Decline Admission</button>
                                </>
                             ) : (
                                <div className="text-center py-6 border border-white/10 rounded-xl bg-white/5">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-femac-yellow">Registry Session Finalized</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Missing icons added for the refined UI */
const SearchCode = ({ size, className, ...props }: any) => (
  <div className={`flex items-center justify-center ${className}`} {...props}>
    <Search size={size} className="absolute" />
    <ShieldCheck size={size * 0.5} className="relative translate-y-2 translate-x-2" />
  </div>
);
