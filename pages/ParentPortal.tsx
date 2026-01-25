
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
  const [searchGrade, setSearchGrade] = useState<string>('');
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
  // Results are locked if balance is pending OR if executive hasn't verified the payment
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
            amount: Math.abs(fees.filter(f => f.type === 'PAYMENT').reduce((a,b) => a + b.amount, 0)),
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
      max: assignment?.maxScore
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
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
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-right min-w-[240px]">
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Outstanding Registry Balance</p>
                   <p className={`text-4xl font-black tracking-tighter ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>K {balance.toLocaleString()}</p>
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
              
              {balance > 0 && (
                <button 
                  onClick={() => { setPaymentStep('method'); setShowPayModal(true); }} 
                  className="w-full bg-femac-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-lg shadow-2xl hover:bg-femac-yellow hover:text-femac-900 transition-all flex justify-center items-center active:scale-[0.98]"
                >
                  <CreditCard className="mr-3" size={24} /> Settle Registry Balance
                </button>
              )}
          </div>

          <div className="space-y-8">
              <div className="bg-femac-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                  <h4 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center"><ShieldAlert className="mr-3 text-femac-yellow" /> Payment Policy</h4>
                  <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-loose opacity-80"><span className="text-white">Verification Mandate:</span> After payment, parents must send a notification to Executive Accounts for instant result unlocking.</p>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-loose opacity-80"><span className="text-white">Authorisation:</span> Results only unlock after executive registry confirms payment hashes.</p>
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
                <button onClick={() => { setPaymentStep('method'); setShowPayModal(true); }} className="px-10 py-5 bg-femac-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-femac-yellow hover:text-femac-900 transition-all">Settle Fees Portal <ArrowRight size={16} className="ml-3" /></button>
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
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100"><p className="text-[10px] font-black uppercase text-slate-400 mb-2">Mean Performance</p><p className="text-4xl font-black text-femac-900">{Math.round(grades.reduce((a,b) => a + b.score, 0) / grades.length)}%</p></div>
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
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden relative p-10 text-center animate-in zoom-in duration-300">
            <button onClick={() => { if(!isProcessing) setShowPayModal(false); }} className="absolute top-10 right-10 text-slate-400 hover:text-femac-900"><X size={32} /></button>
            
            {paymentStep === 'method' && (
                <div className="py-6">
                    <h4 className="text-3xl font-black text-femac-900 uppercase tracking-tighter mb-10">Secure Gateway</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => { setSelectedMethod('momo'); setPaymentStep('confirm'); }} className="flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow transition-all group">
                            <div className="flex items-center space-x-5">
                                <Smartphone size={24} className="text-femac-900" />
                                <div className="text-left"><p className="font-black text-lg uppercase">Airtel Merchant</p><p className="text-[10px] font-bold">0772705347</p></div>
                            </div>
                            <ChevronRight size={24} />
                        </button>
                        <button onClick={() => { setSelectedMethod('bank'); setPaymentStep('confirm'); }} className="flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-femac-yellow transition-all group">
                            <div className="flex items-center space-x-5">
                                <Landmark size={24} className="text-femac-900" />
                                <div className="text-left"><p className="font-black text-lg uppercase">Bank Transfer</p><p className="text-[10px] font-bold">ZANACO • Great North Branch</p></div>
                            </div>
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            )}

            {paymentStep === 'confirm' && (
                <div className="py-6 animate-in slide-in-from-right-4">
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-10">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Settlement for {activeStudent.id}</p>
                        <h5 className="text-5xl font-black text-femac-900 tracking-tighter mb-4">K {balance.toLocaleString()}</h5>
                    </div>
                    <button disabled={isProcessing} onClick={handlePayment} className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg shadow-2xl transition-all flex items-center justify-center space-x-4 ${isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-femac-900 text-white'}`}>
                        {isProcessing ? <><Loader2 size={24} className="animate-spin" /><span>Processing...</span></> : <span>Authorize Payment</span>}
                    </button>
                </div>
            )}

            {paymentStep === 'success' && (
                <div className="py-10 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl"><CheckCircle2 size={56} /></div>
                    <h4 className="text-4xl font-black text-femac-900 uppercase tracking-tight mb-4">Settlement Successful</h4>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-12">Transaction hash verified. To unlock results, notify Executive Accounts.</p>
                    
                    {!notificationSent ? (
                      <button onClick={handleSendNotification} className="w-full py-6 bg-femac-yellow text-femac-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg hover:bg-femac-900 hover:text-white transition-all"><Send size={24} className="inline mr-2" /> Notify Executive Portal</button>
                    ) : (
                      <div className="bg-femac-900 text-white p-8 rounded-[2rem] shadow-2xl"><p className="text-lg font-black uppercase">Notification Sent</p><p className="text-[10px] uppercase text-femac-400">Awaiting Verification Token</p></div>
                    )}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
