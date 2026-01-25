
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_STUDENTS, MOCK_ASSIGNMENTS } from '../constants';
import { MockDB } from '../services/mockDb';
import { GradeRecord, GradeStatus, FeeTransaction, Student } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
  DollarSign, Download, AlertTriangle, CreditCard, X, Calendar, FileText, 
  Search, User, ChevronRight, ShieldCheck, UserCheck, Lock, Smartphone, 
  Landmark, Info, CheckCircle, ArrowRight, ShieldAlert, Zap, Printer, TrendingUp, BellRing,
  CheckCircle2, Loader2, Sparkles, Send
} from 'lucide-react';

interface ParentPortalProps {
  activePage?: string;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ activePage }) => {
  const parentStudents = MOCK_STUDENTS.filter(s => s.parentId === 'U-PAR-001');
  const [activeStudentId, setActiveStudentId] = useState<string>(parentStudents[0]?.id || MOCK_STUDENTS[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGrade, setSearchGrade] = useState<string>(''); // Required before search
  const [isSearching, setIsSearching] = useState(false);
  const [fees, setFees] = useState<FeeTransaction[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'confirm' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'momo' | 'bank' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Re-fetch the student object from DB to get the latest resultsUnlocked status
  const studentInRegistry = MockDB.getStudentById(activeStudentId);
  const activeStudent = studentInRegistry || MOCK_STUDENTS[0];

  const refreshRegistryData = () => {
    const currentFees = MockDB.getFeesByStudent(activeStudentId);
    setFees(currentFees);
    const allGrades = MockDB.getGradesByStudent(activeStudentId);
    setGrades(allGrades.filter(g => g.status === GradeStatus.PUBLISHED));
  };

  useEffect(() => {
    refreshRegistryData();
  }, [activeStudentId]);

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
  // Results are locked if balance is pending OR if executive hasn't verified the payment (resultsUnlocked flag)
  const isLockedForResults = isBalancePending || !activeStudent.resultsUnlocked;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
        MockDB.makePayment(activeStudentId, balance);
        refreshRegistryData();
        setIsProcessing(false);
        setPaymentStep('success');
        setNotificationSent(false);
    }, 2000);
  };

  const handleSendNotification = () => {
    setIsProcessing(true);
    setTimeout(() => {
        MockDB.sendPaymentNotification({
            studentId: activeStudentId,
            amount: balance, // Sending the amount settled
            method: selectedMethod === 'momo' ? 'MOMO' : 'BANK',
            details: selectedMethod === 'momo' ? 'Airtel Merchant Ref: 0772705347' : 'Bank Transfer - Great North Branch'
        });
        setIsProcessing(false);
        setNotificationSent(true);
    }, 1500);
  };

  const searchResults = (searchTerm.trim() === '' || searchGrade === '') 
    ? [] 
    : MockDB.getStudents().filter(s => 
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
      max: assignment?.maxScore,
      fullTitle: assignment?.title,
      date: assignment?.date,
      type: assignment?.type,
      comment: g.comment,
      assignmentId: g.assignmentId
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Top Profile & Search Section */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-femac-yellow/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-20 h-20 bg-femac-900 rounded-[2rem] flex items-center justify-center text-femac-yellow shadow-xl shadow-femac-900/20">
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
                className={`w-full pl-16 pr-6 py-5 bg-slate-50 border-2 rounded-[2rem] focus:border-femac-yellow outline-none font-black text-femac-900 uppercase text-xs placeholder:text-slate-300 transition-all shadow-inner ${!searchGrade ? 'opacity-50 cursor-not-allowed border-slate-100' : 'border-slate-100'}`} 
              />
            </div>

            {isSearching && searchTerm.trim() !== '' && searchGrade !== '' && (
              <div className="absolute top-full left-0 w-full mt-4 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 z-[70] overflow-hidden animate-in slide-in-from-top-2">
                <div className="p-5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Grade {searchGrade} Results</p>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => handleSelectStudent(s.id)}
                        className="w-full flex items-center justify-between p-5 hover:bg-yellow-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-femac-yellow transition-colors">
                            <UserCheck size={18} className="text-slate-500 group-hover:text-femac-900" />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-femac-900 uppercase text-sm leading-none">{s.firstName} {s.lastName}</p>
                            <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mt-1">Registry ID: {s.id}</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-200 group-hover:text-femac-900 transform group-hover:translate-x-1 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <AlertTriangle size={32} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Candidate not found in this grade</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* FEES PORTAL TAB */}
        {activePage === 'fees' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="xl:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                   <div>
                     <h3 className="text-3xl font-black text-femac-900 uppercase tracking-tighter flex items-center">
                       <DollarSign className="mr-3 text-femac-yellow" size={32}/> Financial Ledger
                     </h3>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Verified Institutional Billing Node</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-right min-w-[240px]">
                     <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Outstanding Registry Balance</p>
                     <p className={`text-4xl font-black tracking-tighter ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                       K {balance.toLocaleString()}
                     </p>
                   </div>
                </div>
                
                <div className="space-y-3 mb-12 flex-1 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 ml-2 mb-4">Transaction History</p>
                  {fees.length > 0 ? (
                    fees.map(fee => (
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
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-200">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No transaction entries found</p>
                    </div>
                  )}
                </div>
                
                {balance > 0 && (
                  <button 
                    onClick={() => { setPaymentStep('method'); setShowPayModal(true); }} 
                    className="w-full bg-femac-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-lg shadow-2xl hover:bg-femac-yellow hover:text-femac-900 transition-all flex justify-center items-center active:scale-[0.98] group"
                  >
                    <CreditCard className="mr-3 transition-transform group-hover:scale-110" size={24} /> 
                    Settle Registry Balance
                  </button>
                )}
            </div>

            <div className="space-y-8">
                <div className="bg-femac-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-femac-yellow opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <h4 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center">
                        <ShieldAlert className="mr-3 text-femac-yellow" /> Payment Policy
                    </h4>
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-start space-x-4">
                            <div className="bg-white/10 p-2 rounded-lg text-femac-yellow mt-1"><BellRing size={14} /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-loose opacity-80">
                                <span className="text-white">Verification Mandate:</span> After payment, parents must send a notification to Executive Accounts for instant result unlocking.
                            </p>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="bg-white/10 p-2 rounded-lg text-femac-yellow mt-1"><ShieldCheck size={14} /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-loose opacity-80">
                                <span className="text-white">Authorisation:</span> Results only unlock after executive registry confirms payment hashes.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-femac-900 mb-6">Payment Integrations</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                            <Smartphone className="text-femac-900 mb-2" size={24} />
                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Merchant Number</p>
                            <p className="text-[10px] font-black text-femac-900 mt-1 uppercase">0772705347</p>
                            <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">Airtel Money Registry</p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                            <Landmark className="text-femac-900 mb-2" size={24} />
                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Bank Details</p>
                            <p className="text-[8px] font-black text-slate-600 mt-1 uppercase leading-none">FAIMS ACADEMY</p>
                            <p className="text-[7px] font-bold text-slate-400 mt-1 uppercase leading-none">ZANACO • ACC: 0102030405</p>
                            <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">Branch: Great North</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* RESULTS PORTAL TAB */}
        {activePage === 'results' && (
          <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500 min-h-[600px] overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
               <div>
                 <h3 className="text-3xl font-black text-femac-900 uppercase tracking-tighter flex items-center leading-none">
                   <Calendar className="mr-4 text-femac-yellow" size={36} /> Academic Results
                 </h3>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3">Verified 2026 Registry Performance Matrix</p>
               </div>
               {!isLockedForResults && grades.length > 0 && (
                 <div className="flex gap-4">
                    <button className="bg-femac-900 text-white text-[10px] flex items-center font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-xl hover:bg-femac-yellow hover:text-femac-900 group">
                      <Download size={16} className="mr-2 text-femac-yellow group-hover:text-femac-900"/> Export PDF Report
                    </button>
                    <button className="bg-slate-100 text-slate-600 text-[10px] flex items-center font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all hover:bg-slate-200">
                      <Printer size={16} className="mr-2" /> Print Archive
                    </button>
                 </div>
               )}
            </div>
            
            {isLockedForResults ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100 text-center px-10 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none scale-150">
                    <Lock size={400} />
                </div>
                <div className="w-28 h-28 bg-white text-red-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-red-500/10 border-2 border-red-50 relative z-10">
                  <Lock size={48} className="animate-pulse" />
                </div>
                <h4 className="text-4xl font-black text-femac-900 uppercase tracking-tight mb-4 relative z-10">Access Authorisation Required</h4>
                <p className="text-slate-500 font-bold max-w-lg mx-auto mb-10 text-sm leading-loose uppercase tracking-widest relative z-10">
                  Results for <span className="text-femac-900 font-black">{activeStudent.firstName} {activeStudent.lastName}</span> are locked. 
                  {isBalancePending ? (
                    <span> Please settle the outstanding balance of <span className="text-red-600 font-black">K {balance.toLocaleString()}</span> and notify Executive Accounts.</span>
                  ) : (
                    <span> A waiting verification token is pending from Executive Accounts. Please ensure you sent the "Paid" notification.</span>
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                  {isBalancePending ? (
                    <button 
                      onClick={() => { setPaymentStep('method'); setShowPayModal(true); }}
                      className="px-10 py-5 bg-femac-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-2xl"
                    >
                      Go to Fees Portal <ArrowRight size={16} className="ml-3" />
                    </button>
                  ) : (
                    <div className="px-10 py-5 bg-amber-50 text-amber-600 border border-amber-200 rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center animate-pulse">
                      Awaiting Executive Verification...
                    </div>
                  )}
                  <div className="p-5 bg-white rounded-[1.5rem] border border-slate-200 flex items-center space-x-4 shadow-sm">
                    <ShieldAlert className="text-femac-yellow" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Registry Data Protection Protocol v4.2</span>
                  </div>
                </div>
              </div>
            ) : grades.length > 0 ? (
               <div className="flex-1 flex flex-col animate-in fade-in zoom-in duration-700">
                  <div className="h-[400px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="name" 
                                tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 900, textTransform: 'uppercase'}} 
                                axisLine={false} 
                                tickLine={false} 
                              />
                              <YAxis 
                                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                                axisLine={false} 
                                tickLine={false} 
                                domain={[0, 100]}
                              />
                              <Tooltip 
                                cursor={{fill: '#f8fafc', radius: 12}}
                                contentStyle={{ 
                                  borderRadius: '2rem', 
                                  border: 'none', 
                                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)', 
                                  padding: '24px',
                                  backgroundColor: '#102a43',
                                  color: '#fff'
                                }} 
                                itemStyle={{ color: '#facc15', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase' }}
                                labelStyle={{ color: '#9fb3c8', fontWeight: 700, marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                              />
                              <Bar 
                                dataKey="score" 
                                fill="#102a43" 
                                radius={[12, 12, 12, 12]} 
                                barSize={40}
                                className="cursor-pointer hover:fill-femac-yellow transition-all duration-300" 
                              />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center"><TrendingUp className="mr-2 text-femac-yellow" size={14}/> Mean Performance</p>
                      <p className="text-4xl font-black text-femac-900 tracking-tighter">
                        {Math.round(grades.reduce((a,b) => a + b.score, 0) / grades.length)}%
                      </p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center"><CheckCircle className="mr-2 text-green-600" size={14}/> Recorded Entries</p>
                      <p className="text-4xl font-black text-femac-900 tracking-tighter">{grades.length} Subjects</p>
                    </div>
                    <div className="bg-femac-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-femac-yellow opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-femac-400 mb-2 relative z-10">Access Identity</p>
                        <p className="text-lg font-black text-femac-yellow uppercase tracking-tight relative z-10">Node Unlocked</p>
                        <p className="text-[8px] font-bold text-white/50 uppercase mt-1 relative z-10">Authorised by Executive Accounts</p>
                    </div>
                  </div>
               </div>
            ) : (
               <div className="flex-1 w-full flex flex-col justify-center items-center text-slate-300 py-20 bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100">
                  <AlertTriangle size={64} className="mb-6 opacity-10" />
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">No score entries published for this candidate</p>
               </div>
            )}
          </div>
        )}
      </div>
      
      {/* INTEGRATED PAYMENT GATEWAY MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-femac-900/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden relative border border-white/20 p-10 text-center animate-in zoom-in duration-300 flex flex-col">
            <button onClick={() => { if(!isProcessing) setShowPayModal(false); }} className="absolute top-10 right-10 text-slate-400 hover:text-femac-900 transition-colors"><X size={32} /></button>
            
            {paymentStep === 'method' && (
                <div className="flex-1 flex flex-col justify-center py-6">
                    <div className="w-24 h-24 bg-femac-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl border-2 border-femac-100">
                      <ShieldCheck size={48} className="text-femac-900" />
                    </div>
                    <h4 className="text-3xl font-black text-femac-900 uppercase tracking-tighter mb-4">Secure Gateway</h4>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-10">Select a verified Zambian payment channel</p>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => { setSelectedMethod('momo'); setPaymentStep('confirm'); }} className="flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow hover:bg-white transition-all group">
                            <div className="flex items-center space-x-5">
                                <div className="bg-femac-900 p-4 rounded-2xl group-hover:bg-femac-yellow transition-colors"><Smartphone size={24} className="text-femac-yellow group-hover:text-femac-900" /></div>
                                <div className="text-left"><p className="font-black text-lg text-femac-900 uppercase tracking-tight">Airtel Merchant</p><p className="text-[10px] font-bold text-femac-900 uppercase tracking-widest">0772705347</p></div>
                            </div>
                            <ChevronRight size={24} className="text-slate-300 group-hover:text-femac-900" />
                        </button>
                        <button onClick={() => { setSelectedMethod('bank'); setPaymentStep('confirm'); }} className="flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow hover:bg-white transition-all group">
                            <div className="flex items-center space-x-5">
                                <div className="bg-femac-900 p-4 rounded-2xl group-hover:bg-femac-yellow transition-colors"><Landmark size={24} className="text-femac-yellow group-hover:text-femac-900" /></div>
                                <div className="text-left"><p className="font-black text-lg text-femac-900 uppercase tracking-tight">Bank Transfer</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ZANACO • Great North Branch</p></div>
                            </div>
                            <ChevronRight size={24} className="text-slate-300 group-hover:text-femac-900" />
                        </button>
                    </div>
                </div>
            )}

            {paymentStep === 'confirm' && (
                <div className="flex-1 flex flex-col justify-center animate-in slide-in-from-right-4 duration-300 py-6">
                    <button onClick={() => setPaymentStep('method')} className="mb-8 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-femac-900"><ArrowRight size={14} className="mr-2 rotate-180" /> Change Method</button>
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Settlement for Candidate {activeStudent.id}</p>
                        <h5 className="text-5xl font-black text-femac-900 tracking-tighter mb-4">K {balance.toLocaleString()}</h5>
                        <div className="flex items-center justify-center space-x-3 bg-femac-900/5 py-3 rounded-2xl">
                            {selectedMethod === 'momo' ? <Smartphone size={18} className="text-femac-900" /> : <Landmark size={18} className="text-femac-900" />}
                            <span className="text-[10px] font-black uppercase tracking-widest text-femac-900">{selectedMethod === 'momo' ? 'Airtel Merchant Node' : 'Bank Integration Node'}</span>
                        </div>
                    </div>
                    <button 
                        disabled={isProcessing}
                        onClick={handlePayment} 
                        className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg shadow-2xl transition-all flex items-center justify-center space-x-4 ${isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-femac-900 text-white hover:bg-femac-800'}`}
                    >
                        {isProcessing ? <><Loader2 size={24} className="animate-spin" /><span>Syncing Hash...</span></> : <><ShieldCheck size={24} className="text-femac-yellow" /><span>Authorize Payment</span></>}
                    </button>
                </div>
            )}

            {paymentStep === 'success' && (
                <div className="flex-1 flex flex-col justify-center items-center py-10 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-xl border-2 border-green-100">
                      <CheckCircle2 size={56} />
                    </div>
                    <h4 className="text-4xl font-black text-femac-900 uppercase tracking-tight mb-4 leading-none">Settlement Successful</h4>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-12 max-w-sm mx-auto">
                        Transaction hash verified. To instantly unlock results, you <span className="text-femac-900">MUST</span> notify Executive Accounts.
                    </p>
                    
                    {!notificationSent ? (
                      <button 
                        disabled={isProcessing}
                        onClick={handleSendNotification}
                        className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg shadow-2xl transition-all flex items-center justify-center space-x-4 ${isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-femac-yellow text-femac-900 hover:bg-femac-900 hover:text-white'}`}
                      >
                         {isProcessing ? <><Loader2 size={24} className="animate-spin" /><span>Notifying Node...</span></> : <><Send size={24} /><span>Notify Executive Portal</span></>}
                      </button>
                    ) : (
                      <div className="w-full bg-femac-900 text-white p-8 rounded-[2rem] border border-femac-yellow/30 shadow-2xl flex flex-col items-center">
                         <Sparkles className="text-femac-yellow mb-3" size={32} />
                         <p className="text-lg font-black uppercase tracking-tight mb-1">Notification Dispatched</p>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-femac-400">Awaiting Executive Verification Token</p>
                         <button onClick={() => setShowPayModal(false)} className="mt-8 text-femac-yellow border-b border-femac-yellow text-[10px] font-black uppercase tracking-widest pb-1 hover:text-white hover:border-white transition-all">Return to Portal</button>
                      </div>
                    )}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
