import React, { useState, useEffect, useRef } from 'react';
import { MOCK_STUDENTS, MOCK_ASSIGNMENTS } from '../constants.ts';
import { MockDB } from '../services/mockDb.ts';
import { GradeRecord, GradeStatus, FeeTransaction, Student, ChatSession, UserRole } from '../types.ts';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
  DollarSign, Download, AlertTriangle, CreditCard, X, Calendar, FileText, 
  Search, User, ChevronRight, ShieldCheck, UserCheck, Lock, Smartphone, 
  Landmark, Info, CheckCircle, ArrowRight, ShieldAlert, Zap, Printer, TrendingUp, BellRing,
  CheckCircle2, Loader2, Sparkles, Send, MessageSquare, Plus, ShoppingCart, MessageCircle, Bot, Headphones
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ParentPortalProps {
  activePage?: string;
}

const FloatingChatBot: React.FC<{ parentId: string; parentName: string }> = ({ parentId, parentName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSession = async () => {
      const sess = await MockDB.getChatSessionByParent(parentId, parentName);
      setSession(sess);
    };
    if (isOpen) {
      loadSession();
    }
  }, [parentId, parentName, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session) return;

    const userMsg = input.trim();
    setInput('');
    await MockDB.sendMessage(session.id, parentId, UserRole.PARENT, userMsg);
    const updatedSession = await MockDB.getChatSessionByParent(parentId, parentName);
    setSession(updatedSession);

    if (session.status === 'AI_ONLY') {
      setIsTyping(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: userMsg,
          config: {
            systemInstruction: `You are the FEMAC Academy Assistant. 
            The parent's name is ${parentName}.
            Basic Info:
            - Fees: Primary K3500, Junior K4800, Senior K6200 per term.
            - Location: Plot 442 Katuba 17miles, Great North Road, Central, Zambia.
            - Enrollment for 2026 is OPEN.
            - If they need to speak to a real person or an executive, tell them to click the "Request Executive" button in the chat.
            Be professional, concise, and helpful.`,
          },
        });
        
        await MockDB.sendMessage(session.id, 'AI-001', UserRole.EXECUTIVE_ACCOUNTS, response.text || 'I am sorry, I am having trouble connecting.', true);
        const postAiSession = await MockDB.getChatSessionByParent(parentId, parentName);
        setSession(postAiSession);
      } catch (err) {
        console.error(err);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleEscalate = async () => {
    if (session) {
      await MockDB.requestExecutive(session.id);
      await MockDB.sendMessage(session.id, 'SYSTEM', UserRole.EXECUTIVE_ACCOUNTS, "A request has been sent to the Executive Node. Please wait for an administrator to join.", true);
      const escalatedSession = await MockDB.getChatSessionByParent(parentId, parentName);
      setSession(escalatedSession);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-6 w-96 h-[550px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(16,42,67,0.4)] border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
          <div className="bg-femac-900 p-8 text-white flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-femac-yellow rounded-2xl flex items-center justify-center text-femac-900 shadow-lg">
                <Bot size={24} />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight uppercase">School Hub</p>
                <p className="text-[9px] font-black uppercase text-femac-400 tracking-widest">Live Assistance Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-femac-300 hover:text-white"><X size={24}/></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
            {session?.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === parentId ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${msg.senderId === parentId ? 'bg-femac-900 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center space-x-2">
                   <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                   <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {session?.status === 'AI_ONLY' && (
            <div className="px-6 py-2">
              <button onClick={handleEscalate} className="w-full bg-slate-50 border border-slate-100 text-femac-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-femac-yellow/10 transition-colors">
                <Headphones size={14} className="mr-2" /> Request Executive Node
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="p-6 border-t border-slate-100 bg-white">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full pl-6 pr-14 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm text-slate-700 focus:border-femac-yellow transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-femac-900 text-femac-yellow p-2.5 rounded-xl hover:bg-femac-yellow hover:text-femac-900 transition-all">
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 bg-femac-900 text-femac-yellow rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,42,67,0.4)] border-4 border-femac-yellow/20 hover:scale-110 active:scale-95 transition-all relative group"
      >
        {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
        {!isOpen && <div className="absolute inset-0 rounded-[2rem] bg-femac-yellow/20 animate-ping"></div>}
      </button>
    </div>
  );
};

export const ParentPortal: React.FC<ParentPortalProps> = ({ activePage }) => {
  const parentStudents = MOCK_STUDENTS.filter(s => s.parentId === 'U-PAR-001');
  const [activeStudentId, setActiveStudentId] = useState<string>(parentStudents[0]?.id || MOCK_STUDENTS[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGrade, setSearchGrade] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [fees, setFees] = useState<FeeTransaction[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'confirm' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'momo' | 'bank' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  
  const [activeStudent, setActiveStudent] = useState<Student>(parentStudents[0] || MOCK_STUDENTS[0]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDescription, setPaymentDescription] = useState<string>('');
  
  const searchRef = useRef<HTMLDivElement>(null);

  const refreshRegistryData = async () => {
    const [currentFees, studentGrades, studentData, totalStudents] = await Promise.all([
      MockDB.getFeesByStudent(activeStudentId),
      MockDB.getGradesByStudent(activeStudentId),
      MockDB.getStudentById(activeStudentId),
      MockDB.getStudents()
    ]);
    
    setFees(currentFees);
    setGrades(studentGrades as GradeRecord[]);
    if (studentData) {
      setActiveStudent(studentData);
    }
    setAllStudents(totalStudents);
  };

  useEffect(() => {
    refreshRegistryData();
  }, [activeStudentId, activePage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const balance = fees.reduce((acc, curr) => acc + curr.amount, 0);
  const isBalancePending = balance > 0;
  const isLockedForResults = isBalancePending || !activeStudent.resultsUnlocked;

  const handleOpenPayment = (type: 'settle' | 'new') => {
    if (type === 'settle') {
      setPaymentAmount(balance.toString());
      setPaymentDescription('Institutional Fee Settlement');
    } else {
      setPaymentAmount('');
      setPaymentDescription('');
    }
    setPaymentStep('method');
    setShowPayModal(true);
    setNotificationSent(false);
  };

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await MockDB.makePayment(activeStudentId, parseFloat(paymentAmount), paymentDescription);
    await refreshRegistryData();
    setIsProcessing(false);
    setPaymentStep('success');
  };

  const handleSendNotification = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await MockDB.sendPaymentNotification({
        studentId: activeStudentId,
        amount: parseFloat(paymentAmount),
        method: selectedMethod === 'momo' ? 'MOMO' : 'BANK',
        details: `${paymentDescription} - ${selectedMethod === 'momo' ? 'Airtel Merchant Ref' : 'Bank Transfer'}`
    });
    setIsProcessing(false);
    setNotificationSent(true);
  };

  const searchResults = (searchTerm.trim() === '' || searchGrade === '') 
    ? [] 
    : allStudents.filter(s => 
        s.grade === parseInt(searchGrade) && 
        (s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
         `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const handleSelectStudent = (studentId: string) => {
    setActiveStudentId(studentId);
    setSearchTerm('');
    setSearchGrade('');
    setIsSearching(false);
  };

  const chartData = grades.map(g => {
    const assignment = MOCK_ASSIGNMENTS.find(a => a.id === g.assignmentId);
    return {
      name: assignment?.title.substring(0, 10) + '...',
      score: g.score,
      max: assignment?.maxScore
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <FloatingChatBot parentId="U-PAR-001" parentName="Registry Parent" />
      
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-femac-yellow/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-20 h-20 bg-femac-900 rounded-[2rem] flex items-center justify-center text-femac-yellow shadow-xl">
            <User size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Institutional Registry Node</p>
            <h3 className="text-3xl font-black text-femac-900 tracking-tighter uppercase leading-none">{activeStudent.id}</h3>
            <div className="flex items-center space-x-3 mt-3">
                <span className="bg-femac-50 text-femac-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-femac-100">Grade {activeStudent.grade} Student</span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center ${activeStudent.resultsUnlocked ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {activeStudent.resultsUnlocked ? <ShieldCheck size={12} className="mr-1.5" /> : <Lock size={12} className="mr-1.5" />}
                    {activeStudent.resultsUnlocked ? 'Verified Access' : 'Verification Required'}
                </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 relative z-[60]" ref={searchRef}>
          <div className="relative min-w-[120px]">
            <select 
              value={searchGrade}
              onChange={(e) => setSearchGrade(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none font-black text-femac-900 uppercase text-xs focus:border-femac-yellow appearance-none pr-10"
            >
              <option value="">GRADE</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={14} />
          </div>
          
          <div className="relative md:w-[22rem]">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                disabled={!searchGrade}
                type="text" 
                placeholder={searchGrade ? "Search name in registry..." : "Select grade first"} 
                value={searchTerm} 
                onFocus={() => setIsSearching(true)} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearching(true);
                }} 
                className={`w-full pl-16 pr-6 py-5 bg-slate-50 border-2 rounded-[2rem] focus:border-femac-yellow outline-none font-black text-femac-900 uppercase text-xs transition-all shadow-inner border-slate-100`} 
              />
            </div>

            {isSearching && searchTerm.trim() !== '' && searchGrade !== '' && (
              <div className="absolute top-full left-0 w-full mt-4 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 z-[70] overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(s => (
                      <button key={s.id} onClick={() => handleSelectStudent(s.id)} className="w-full flex items-center justify-between p-5 hover:bg-yellow-50 transition-colors group">
                        <div className="flex items-center space-x-4">
                          <UserCheck size={18} className="text-slate-500 group-hover:text-femac-900" />
                          <p className="font-black text-femac-900 uppercase text-sm leading-none">{s.firstName} {s.lastName}</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-200 group-hover:text-femac-900" />
                      </button>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-300 font-black uppercase text-[10px]">No Candidates Found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activePage === 'fees' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="xl:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                 <div>
                   <h3 className="text-3xl font-black text-femac-900 uppercase tracking-tighter flex items-center"><DollarSign className="mr-3 text-femac-yellow" size={32}/> Financial Ledger</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Verified Institutional Billing Node</p>
                 </div>
                 <div className="flex flex-col items-end gap-2">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-right min-w-[240px]">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Outstanding Registry Balance</p>
                      <p className={`text-4xl font-black tracking-tighter ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>K {balance.toLocaleString()}</p>
                    </div>
                    {balance <= 0 && (
                      <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                        <CheckCircle2 size={12} className="mr-2" /> All Node Liabilities Settled
                      </span>
                    )}
                 </div>
              </div>
              
              <div className="space-y-3 mb-12 flex-1 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {fees.map(fee => (
                  <div key={fee.id} className="flex justify-between items-center p-6 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] group hover:border-femac-yellow hover:bg-white hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-5">
                        <div className={`p-3 rounded-xl ${fee.type === 'BILL' ? 'bg-slate-900 text-femac-yellow' : 'bg-green-100 text-green-600'}`}>
                            {fee.type === 'BILL' ? <FileText size={18} /> : <CheckCircle size={18} />}
                        </div>
                        <div>
                            <p className="font-black text-femac-900 uppercase tracking-tight text-sm leading-none mb-1">{fee.description}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{fee.date} • Registry Hash Verified</p>
                        </div>
                      </div>
                      <span className={`${fee.type === 'BILL' ? 'text-femac-900' : 'text-green-600'} font-black text-xl tracking-tighter`}>
                        {fee.type === 'BILL' ? '+' : '-'} {Math.abs(fee.amount).toLocaleString()}
                      </span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                {balance > 0 && (
                  <button 
                    onClick={() => handleOpenPayment('settle')} 
                    className="flex-1 bg-femac-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-lg shadow-2xl hover:bg-femac-yellow hover:text-femac-900 transition-all flex justify-center items-center active:scale-[0.98]"
                  >
                    <CreditCard className="mr-3" size={24} /> Settle Balance
                  </button>
                )}
                <button 
                  onClick={() => handleOpenPayment('new')} 
                  className={`flex-1 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-lg transition-all flex justify-center items-center active:scale-[0.98] ${balance <= 0 ? 'bg-femac-900 text-white shadow-2xl' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Plus className="mr-3" size={24} /> Miscellaneous Payment
                </button>
              </div>
          </div>

          <div className="space-y-8">
              <div className="bg-femac-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                  <h4 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center"><ShieldAlert className="mr-3 text-femac-yellow" /> Payment Policy</h4>
                  <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-loose opacity-80"><span className="text-white">Verification Mandate:</span> After payment, parents must send a notification to Executive Accounts for instant result unlocking.</p>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-loose opacity-80"><span className="text-white">Authorisation:</span> Results only unlock after executive registry confirms payment hashes.</p>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-loose opacity-80"><span className="text-white">Special Fees:</span> Use the "Miscellaneous Payment" option for tours, exams, or events.</p>
                  </div>
              </div>
          </div>
        </div>
      )}

      {activePage === 'results' && (
        <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500 min-h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
               <div>
                 <h3 className="text-3xl font-black text-femac-900 uppercase tracking-tighter flex items-center leading-none"><Calendar className="mr-4 text-femac-yellow" size={36} /> Academic Results</h3>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3">Verified 2026 Registry Performance Matrix</p>
               </div>
            </div>
            
            {isLockedForResults ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100 text-center px-10">
                <div className="w-28 h-28 bg-white text-red-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl border-2 border-red-50">
                  <Lock size={48} className="animate-pulse" />
                </div>
                <h4 className="text-4xl font-black text-femac-900 uppercase tracking-tight mb-4">Access Authorisation Required</h4>
                <p className="text-slate-500 font-bold max-w-lg mx-auto mb-10 text-sm leading-loose uppercase tracking-widest">
                  Results for <span className="text-femac-900 font-black">{activeStudent.firstName} {activeStudent.lastName}</span> are locked. 
                  {isBalancePending ? " Please settle the outstanding balance and notify Executive Accounts." : " Awaiting final verification token from Executive Accounts."}
                </p>
                <button onClick={() => handleOpenPayment('settle')} className="px-10 py-5 bg-femac-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-femac-yellow hover:text-femac-900 transition-all">Settle Fees Portal <ArrowRight size={16} className="ml-3" /></button>
              </div>
            ) : grades.length > 0 ? (
               <div className="flex-1 flex flex-col animate-in fade-in duration-700">
                  <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 900}} />
                              <YAxis tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} domain={[0, 100]} />
                              <Tooltip contentStyle={{borderRadius: '2rem', border: 'none', backgroundColor: '#102a43', color: '#fff'}} />
                              <Bar dataKey="score" fill="#102a43" radius={[12, 12, 0, 0]} barSize={40} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100"><p className="text-[10px] font-black uppercase text-slate-400 mb-2">Mean Performance</p><p className="text-4xl font-black text-femac-900">{grades.length > 0 ? Math.round(grades.reduce((a,b) => a + b.score, 0) / grades.length) : 0}%</p></div>
                    <div className="bg-femac-900 p-8 rounded-[2.5rem] text-white shadow-2xl"><p className="text-[10px] font-black uppercase text-femac-400 mb-2">Access Identity</p><p className="text-lg font-black text-femac-yellow uppercase">Node Unlocked</p></div>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col justify-center items-center text-slate-300 py-20 bg-slate-50 rounded-[4rem]">
                  <AlertTriangle size={64} className="mb-6 opacity-10" />
                  <p className="text-xs font-black uppercase tracking-[0.4em]">No score entries published</p>
               </div>
            )}
        </div>
      )}
      
      {showPayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-femac-900/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden relative p-12 text-center animate-in zoom-in duration-300">
            <button onClick={() => { if(!isProcessing) setShowPayModal(false); }} className="absolute top-10 right-10 text-slate-300 hover:text-femac-900 transition-colors"><X size={32} /></button>
            
            {paymentStep === 'method' && (
                <div className="py-6 space-y-10">
                    <div>
                      <h4 className="text-4xl font-black text-femac-900 uppercase tracking-tighter mb-2">Secure Gateway</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Initialize Authorized Transaction</p>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 text-left">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center">
                            <ShoppingCart size={12} className="mr-2 text-femac-yellow" /> Transaction Amount (ZMW)
                          </label>
                          <input 
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="Enter Amount..."
                            className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-femac-900 focus:border-femac-yellow transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center">
                            <MessageSquare size={12} className="mr-2 text-femac-yellow" /> Payment Description / Fee Icon
                          </label>
                          <div className="relative">
                             <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                             <select 
                                value={paymentDescription}
                                onChange={(e) => setPaymentDescription(e.target.value)}
                                className="w-full pl-14 pr-5 py-5 bg-white border-2 border-slate-100 rounded-2xl outline-none font-black text-sm text-femac-900 focus:border-femac-yellow transition-all appearance-none"
                             >
                                <option value="">Select Fee Type...</option>
                                <option value="Institutional Fee Settlement">Institutional Fee Settlement</option>
                                <option value="Academic Tour Fee">Academic Tour Fee</option>
                                <option value="Examination Entry Fees">Examination Entry Fees</option>
                                <option value="Careers Day Contribution">Careers Day Contribution</option>
                                <option value="Sports & Athletics Kit">Sports & Athletics Kit</option>
                                <option value="Laboratory Access Surcharge">Laboratory Access Surcharge</option>
                                <option value="Miscellaneous School Support">Miscellaneous School Support</option>
                             </select>
                             <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" size={16} />
                          </div>
                          <div className="mt-3 relative">
                            <input 
                                type="text"
                                value={paymentDescription}
                                onChange={(e) => setPaymentDescription(e.target.value)}
                                placeholder="Or type custom purpose (e.g. Science Fair)..."
                                className="w-full p-4 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 outline-none focus:border-femac-yellow transition-all"
                            />
                          </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button disabled={!paymentAmount} onClick={() => { setSelectedMethod('momo'); setPaymentStep('confirm'); }} className="flex items-center space-x-5 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-femac-900 group-hover:text-femac-yellow transition-colors"><Smartphone size={24} /></div>
                            <div className="text-left"><p className="font-black text-xs uppercase tracking-tight">Airtel MOMO</p><p className="text-[8px] font-bold text-slate-400">Merchant: 0772705347</p></div>
                        </button>
                        <button disabled={!paymentAmount} onClick={() => { setSelectedMethod('bank'); setPaymentStep('confirm'); }} className="flex items-center space-x-5 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-femac-900 group-hover:text-femac-yellow transition-colors"><Landmark size={24} /></div>
                            <div className="text-left"><p className="font-black text-xs uppercase tracking-tight">Bank Transfer</p><p className="text-[8px] font-bold text-slate-400">ZANACO Great North</p></div>
                        </button>
                    </div>
                </div>
            )}

            {paymentStep === 'confirm' && (
                <div className="py-6 animate-in slide-in-from-right-4 space-y-10">
                    <div>
                      <h4 className="text-3xl font-black text-femac-900 uppercase tracking-tighter mb-2">Final Review</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorize Registry Settlement</p>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 text-left">
                        <div className="flex items-start justify-between mb-8">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Fee Description</p>
                            <p className="font-black text-femac-900 text-lg uppercase tracking-tight">{paymentDescription || 'Registry Settlement'}</p>
                          </div>
                          <div className={`p-4 rounded-2xl ${selectedMethod === 'momo' ? 'bg-femac-900 text-femac-yellow' : 'bg-femac-900 text-white'}`}>
                            {selectedMethod === 'momo' ? <Smartphone size={28} /> : <Landmark size={28} />}
                          </div>
                        </div>
                        <div className="border-t border-slate-200 pt-8">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Transaction Node</p>
                          <h5 className="text-6xl font-black text-femac-900 tracking-tighter">K {parseFloat(paymentAmount).toLocaleString()}</h5>
                        </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setPaymentStep('method')} className="flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-femac-900 transition-colors">Change Method</button>
                      <button disabled={isProcessing} onClick={handlePayment} className={`flex-[2] py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg shadow-2xl transition-all flex items-center justify-center space-x-4 ${isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-femac-900 text-white hover:bg-femac-yellow hover:text-femac-900'}`}>
                          {isProcessing ? <><Loader2 size={24} className="animate-spin" /><span>Processing...</span></> : <span>Authorize Transfer</span>}
                      </button>
                    </div>
                </div>
            )}

            {paymentStep === 'success' && (
                <div className="py-10 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl border-2 border-green-100"><CheckCircle2 size={56} /></div>
                    <h4 className="text-4xl font-black text-femac-900 uppercase tracking-tight mb-4">Transfer Complete</h4>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-12 max-w-sm mx-auto">Hash verified for <span className="text-femac-900">{paymentDescription}</span>. To finalize, notify Executive Accounts node.</p>
                    
                    {!notificationSent ? (
                      <button onClick={handleSendNotification} className="w-full py-6 bg-femac-yellow text-femac-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg hover:bg-femac-900 hover:text-white transition-all shadow-2xl transform active:scale-95 flex items-center justify-center space-x-3">
                        <Send size={24} />
                        <span>Notify Executive Registry</span>
                      </button>
                    ) : (
                      <div className="bg-femac-900 text-white p-10 rounded-[3rem] shadow-2xl border border-femac-yellow/20">
                        <p className="text-xl font-black uppercase tracking-tight text-femac-yellow mb-2">Notification Synchronized</p>
                        <p className="text-[10px] uppercase text-femac-400 font-bold tracking-widest">Verification token pending executive review</p>
                      </div>
                    )}
                    <button onClick={() => setShowPayModal(false)} className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-femac-900">Return to Portal</button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};