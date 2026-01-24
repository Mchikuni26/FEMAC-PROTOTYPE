import React, { useState } from 'react';
import { 
  DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, PieChart, Briefcase, FileText, Search, User as UserIcon, ChevronRight, X, MapPin, Calendar, ShieldCheck, Download 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MOCK_STUDENTS, MOCK_FEES } from '../constants';
import { MockDB } from '../services/mockDb';

const data = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 55000 },
  { name: 'Jun', revenue: 67000 },
];

export const ExecutiveAccountsPortal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const filteredStudents = MOCK_STUDENTS.filter(s => s.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId);
  const studentFees = selectedStudentId ? MockDB.getFeesByStudent(selectedStudentId) : [];
  const balance = studentFees.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-femac-900 tracking-tighter uppercase leading-none">Executive Operations</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Institutional Financial Oversight Hub</p>
        </div>
        <button className="bg-femac-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-femac-800 transition-all flex items-center shadow-lg"><FileText size={16} className="mr-2 text-femac-yellow" /> Strategic Audit</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4"><div className="bg-green-50 p-4 rounded-2xl"><DollarSign className="text-green-600" size={24} /></div></div>
           <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Revenue</p><h4 className="text-3xl font-black text-femac-900 tracking-tighter">K 1,245,000</h4></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4"><div className="bg-blue-50 p-4 rounded-2xl"><Users className="text-blue-600" size={24} /></div></div>
           <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Registry</p><h4 className="text-3xl font-black text-femac-900 tracking-tighter">1,240</h4></div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div><h3 className="text-2xl font-black text-femac-900 uppercase tracking-tight flex items-center"><UserIcon className="mr-3 text-femac-yellow" size={28} /> Pupil Master Registry</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">System Academic Identifiers</p></div>
          <div className="relative md:w-96 group"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Filter by Academic ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all text-sm" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><tr><th className="px-10 py-5">Academic ID</th><th className="px-6 py-5">Grade Level</th><th className="px-6 py-5">Fee Ledger</th><th className="px-10 py-5 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map(student => {
                const sBalance = MockDB.getFeesByStudent(student.id).reduce((a, b) => a + b.amount, 0);
                return (
                  <tr key={student.id} className="group hover:bg-femac-50/50 transition-colors">
                    <td className="px-10 py-6 font-black text-femac-900 uppercase tracking-tighter text-sm">{student.id}</td>
                    <td className="px-6 py-6"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Grade {student.grade}</span></td>
                    <td className="px-6 py-6 font-black text-sm tracking-tight text-femac-900">K {sBalance.toLocaleString()}</td>
                    <td className="px-10 py-6 text-right"><button onClick={() => setSelectedStudentId(student.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-femac-900 hover:text-femac-yellow transition-all"><ChevronRight size={18} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-femac-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden relative flex flex-col md:flex-row min-h-[600px]">
            <button onClick={() => setSelectedStudentId(null)} className="absolute top-8 right-8 text-slate-400 hover:text-femac-900 transition-colors z-[110]"><X size={32} /></button>
            <div className="md:w-1/3 bg-femac-900 p-12 text-white flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2.5rem] bg-femac-yellow flex items-center justify-center text-femac-900 text-3xl font-black mb-6 uppercase">PUPIL</div>
              <h4 className="text-3xl font-black uppercase tracking-tighter mb-2">{selectedStudent.id}</h4>
              <span className="px-4 py-1.5 bg-white/10 text-femac-yellow rounded-full text-[10px] font-black uppercase tracking-widest">Grade {selectedStudent.grade} Verified</span>
            </div>
            <div className="md:w-2/3 p-12">
               <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Financial Summary</h5>
               <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Balance</p>
                  <h6 className="text-4xl font-black text-femac-900 tracking-tighter">K {balance.toLocaleString()}</h6>
               </div>
               <button onClick={() => setSelectedStudentId(null)} className="w-full py-5 bg-femac-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Return to Registry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};