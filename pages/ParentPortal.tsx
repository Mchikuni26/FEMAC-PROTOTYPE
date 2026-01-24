import React, { useState, useEffect, useRef } from 'react';
import { MOCK_STUDENTS, MOCK_ASSIGNMENTS } from '../constants';
import { MockDB } from '../services/mockDb';
import { GradeRecord, GradeStatus, FeeTransaction } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, Download, AlertTriangle, CreditCard, X, Calendar, FileText, Search, User, ChevronRight, ShieldCheck, UserCheck, Lock } from 'lucide-react';

interface ParentPortalProps {
  activePage?: string;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ activePage }) => {
  const parentStudents = MOCK_STUDENTS.filter(s => s.parentId === 'U-PAR-001');
  const [activeStudentId, setActiveStudentId] = useState<string>(parentStudents[0]?.id || MOCK_STUDENTS[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [fees, setFees] = useState<FeeTransaction[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedGradeDetail, setSelectedGradeDetail] = useState<any | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const activeStudent = MOCK_STUDENTS.find(s => s.id === activeStudentId) || MOCK_STUDENTS[0];

  useEffect(() => {
    setFees(MockDB.getFeesByStudent(activeStudentId));
    const allGrades = MockDB.getGradesByStudent(activeStudentId);
    setGrades(allGrades.filter(g => g.status === GradeStatus.PUBLISHED));
  }, [activeStudentId]);

  // Handle clicking outside of search results
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

  const handlePayment = () => {
    MockDB.makePayment(activeStudentId, balance);
    setFees(MockDB.getFeesByStudent(activeStudentId));
    setShowPayModal(false);
    alert("Payment Finalized via Registry Gateway.");
  };

  const searchResults = searchTerm.trim() === '' 
    ? [] 
    : MOCK_STUDENTS.filter(s => s.id.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectStudent = (studentId: string) => {
    setActiveStudentId(studentId);
    setSearchTerm('');
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Profile & Search Section - Always Visible */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div className="flex items-center space-x-4">
          <div className="bg-femac-900 p-4 rounded-[1.5rem] shadow-lg shadow-femac-900/20">
            <User className="text-femac-yellow" size={28} />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Active Registry Profile</h3>
            <p className="text-3xl font-black text-femac-900 tracking-tighter uppercase leading-none">{activeStudent.id}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center">
              <ShieldCheck size={14} className="mr-1 text-femac-yellow" /> Grade {activeStudent.grade} — Verified Results
            </p>
          </div>
        </div>

        <div className="relative md:w-96" ref={searchRef}>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-femac-yellow bg-femac-900 p-1.5 rounded-xl shadow-md">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search Pupil Academic ID..." 
              value={searchTerm} 
              onFocus={() => setIsSearching(true)} 
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearching(true);
              }} 
              className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-femac-yellow outline-none font-bold text-slate-700 transition-all text-sm placeholder:text-slate-300" 
            />
          </div>

          {isSearching && searchTerm.trim() !== '' && (
            <div className="absolute top-full left-0 w-full mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[60] overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Match Results</p>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {searchResults.length > 0 ? (
                  searchResults.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => handleSelectStudent(s.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-yellow-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-femac-yellow transition-colors">
                          <UserCheck size={16} className="text-slate-500 group-hover:text-femac-900" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-femac-900 uppercase text-sm leading-none">{s.id}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Grade {s.grade}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-femac-900 transition-all transform group-hover:translate-x-1" />
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <AlertTriangle size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pupil found in registry</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Conditional Rendering Based on activePage */}
        {activePage === 'fees' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start mb-10">
               <div>
                 <h3 className="text-2xl font-black text-femac-900 uppercase tracking-tight flex items-center">
                   <DollarSign className="mr-3 text-femac-yellow" size={28}/> Fee Ledger
                 </h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Billing Record</p>
               </div>
               <div className="text-right">
                 <span className={`text-4xl font-black tracking-tighter ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                   K {balance.toLocaleString()}
                 </span>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Outstanding Balance</p>
               </div>
            </div>
            
            <div className="space-y-4 mb-10 flex-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {fees.length > 0 ? (
                fees.map(fee => (
                  <div key={fee.id} className="flex justify-between items-center p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-femac-yellow transition-all">
                      <div>
                        <p className="font-black text-slate-700 uppercase tracking-tight text-sm leading-none mb-1">{fee.description}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fee.date}</p>
                      </div>
                      <span className={`${fee.type === 'BILL' ? 'text-slate-800' : 'text-green-600'} font-black text-lg tracking-tight`}>
                        {fee.type === 'BILL' ? '+' : '-'} {Math.abs(fee.amount).toLocaleString()}
                      </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-200">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No transactions found</p>
                </div>
              )}
            </div>
            
            {balance > 0 && (
              <button 
                onClick={() => setShowPayModal(true)} 
                className="w-full bg-femac-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-femac-800 transition-all flex justify-center items-center active:scale-[0.98] group"
              >
                <CreditCard className="mr-3 text-femac-yellow transition-transform group-hover:scale-110" size={20} /> 
                Authorize Registry Settlement
              </button>
            )}
          </div>
        )}

        {activePage === 'results' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500 min-h-[500px]">
             <div className="flex justify-between items-start mb-10">
               <div>
                 <h3 className="text-2xl font-black text-femac-900 uppercase tracking-tight flex items-center">
                   <Calendar className="mr-3 text-femac-yellow" size={28} /> Term Results
                 </h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Official Academic Metrics</p>
               </div>
               {!isBalancePending && (
                 <button className="text-femac-900 hover:bg-femac-900 hover:text-white text-[10px] flex items-center font-black uppercase tracking-[0.2em] border-2 border-femac-900 px-5 py-2.5 rounded-full transition-all group shadow-sm">
                   <Download size={14} className="mr-2 text-femac-yellow group-hover:text-white"/> Download Registry Archive
                 </button>
               )}
            </div>
            
            {isBalancePending ? (
              /* RESTRICTION VIEW: Balance Pending */
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-red-100 text-center px-8">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
                  <Lock size={40} />
                </div>
                <h4 className="text-3xl font-black text-femac-900 uppercase tracking-tight mb-4">Registry Lockout</h4>
                <p className="text-slate-600 font-medium max-w-md mx-auto mb-8 leading-relaxed">
                  Official academic results for <span className="text-femac-900 font-black">{activeStudent.id}</span> are currently restricted due to an outstanding balance of <span className="text-red-600 font-black">K {balance.toLocaleString()}</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                    <AlertTriangle className="text-femac-yellow" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Settle balance to unlock results</span>
                  </div>
                </div>
              </div>
            ) : grades.length > 0 ? (
               /* UNLOCKED VIEW: Chart and Metrics */
               <div className="h-[400px] w-full flex-1 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} 
                            axisLine={false} 
                            tickLine={false} 
                          />
                          <YAxis 
                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                            axisLine={false} 
                            tickLine={false} 
                          />
                          <Tooltip 
                            cursor={{fill: '#f8fafc', radius: 8}}
                            contentStyle={{ 
                              borderRadius: '24px', 
                              border: 'none', 
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', 
                              padding: '20px',
                              backgroundColor: '#102a43',
                              color: '#fff'
                            }} 
                            itemStyle={{ color: '#facc15', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}
                            labelStyle={{ color: '#9fb3c8', fontWeight: 700, marginBottom: '8px', fontSize: '10px' }}
                          />
                          <Bar 
                            dataKey="score" 
                            fill="#102a43" 
                            radius={[12, 12, 0, 0]} 
                            onClick={(data) => setSelectedGradeDetail(data.payload || data)} 
                            className="cursor-pointer hover:fill-femac-yellow transition-all duration-300" 
                          />
                      </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mean Score</p>
                      <p className="text-xl font-black text-femac-900">
                        {Math.round(grades.reduce((a,b) => a + b.score, 0) / grades.length)}%
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Entries</p>
                      <p className="text-xl font-black text-femac-900">{grades.length} Assessments</p>
                    </div>
                  </div>
               </div>
            ) : (
               /* EMPTY VIEW: No Results */
               <div className="flex-1 w-full flex flex-col justify-center items-center text-slate-300 py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <AlertTriangle size={48} className="mb-4 opacity-10" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">No results published for this pupil</p>
               </div>
            )}
          </div>
        )}
      </div>
      
      {/* Payment Gateway Modal (Mock) */}
      {showPayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-femac-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-white/20 p-10 text-center">
            <button onClick={() => setShowPayModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-femac-900"><X size={24} /></button>
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <ShieldCheck size={40} className="text-green-600" />
            </div>
            <h4 className="text-2xl font-black text-femac-900 uppercase tracking-tight mb-2">Secure Gateway</h4>
            <p className="text-sm text-slate-500 font-medium mb-8">Authorize payment of <span className="text-femac-900 font-black">K {balance.toLocaleString()}</span> from your registered account?</p>
            <div className="space-y-3">
              <button onClick={handlePayment} className="w-full bg-femac-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-femac-800 transition-all active:scale-95">Confirm Transaction</button>
              <button onClick={() => setShowPayModal(false)} className="w-full bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};