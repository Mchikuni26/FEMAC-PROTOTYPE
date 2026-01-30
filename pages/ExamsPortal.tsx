import React, { useState, useEffect } from 'react';
import { MOCK_CLASSES } from '../constants.ts';
import { MockDB } from '../services/mockDb.ts';
import { GradeStatus, StudentReport, AssessmentType, Student } from '../types.ts';
import { 
  CheckCircle, XCircle, Globe, Filter, ExternalLink, Eye, 
  ChevronDown, ShieldCheck, Calendar, FileText, AlertCircle, 
  Users, TrendingUp, Info, Search, LayoutGrid, Award, CheckCircle2, Send, RotateCcw
} from 'lucide-react';

export const ExamsPortal: React.FC = () => {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [activeGrade, setActiveGrade] = useState(1);
  const [activeType, setActiveType] = useState<AssessmentType>('End-of-Term');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [studentsMap, setStudentsMap] = useState<Record<string, Student>>({});

  useEffect(() => {
    const loadData = async () => {
      const fetchedReports = await MockDB.getReportsByGrade(activeGrade);
      setReports(fetchedReports.filter(r => r.type === activeType));
      
      const allStudents = await MockDB.getStudents();
      const sMap: Record<string, Student> = {};
      allStudents.forEach(s => { sMap[s.id] = s; });
      setStudentsMap(sMap);
    };
    loadData();
  }, [activeGrade, activeType, refreshKey]);

  const handleStatusChangeBatch = async (status: GradeStatus) => {
    const msg = status === GradeStatus.PUBLISHED ? "PUBLISH" : "APPROVE";
    if (confirm(`Authorize registry to ${msg} all reports for Grade ${activeGrade} (${activeType})?`)) {
      await MockDB.updateReportStatusBatch(activeGrade, activeType, status);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleStatusChangeSingle = async (id: string, status: GradeStatus) => {
    await MockDB.updateReportStatus(id, status);
    setRefreshKey(prev => prev + 1);
  };

  const getStatusBadge = (status: GradeStatus) => {
    switch (status) {
      case GradeStatus.DRAFT: return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">Teacher Draft</span>;
      case GradeStatus.SUBMITTED: return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse border border-amber-200">Awaiting Validation</span>;
      case GradeStatus.APPROVED: return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200">Exams Verified</span>;
      case GradeStatus.PUBLISHED: return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-200">Live Published</span>;
    }
  };

  const filteredReports = reports.filter(report => {
    const student = studentsMap[report.studentId];
    const fullName = `${student?.firstName || ''} ${student?.lastName || ''}`.toLowerCase();
    const id = report.studentId.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || id.includes(search);
  });

  const submittedCount = reports.filter(r => r.status === GradeStatus.SUBMITTED).length;
  const approvedCount = reports.filter(r => r.status === GradeStatus.APPROVED).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-femac-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-femac-yellow opacity-5 blur-[100px]"></div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="bg-white/10 p-5 rounded-[2.5rem] shadow-2xl border border-white/10 backdrop-blur-md">
            <ShieldCheck className="text-femac-yellow" size={36} />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Exams Terminal</h2>
            <p className="text-femac-300 font-black uppercase tracking-[0.3em] text-[10px] mt-3">Registry Validation & Publication Hub</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 relative z-10">
          <a href="https://portal.ecz.org.zm/" target="_blank" className="bg-femac-yellow text-femac-900 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white transition-all shadow-xl flex items-center">
            <Globe size={16} className="mr-2" /> ECZ Web Portal
          </a>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-end">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full lg:w-1/2">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Assessment Node</label>
              <select value={activeType} onChange={(e) => setActiveType(e.target.value as AssessmentType)} className="w-full p-5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-femac-900 font-black uppercase text-xs outline-none focus:border-femac-yellow appearance-none">
                <option value="End-of-Term">End-of-Term Reports</option>
                <option value="Mid-Term">Mid-Term Reports</option>
                <option value="Mid-week Assessment">Mid-week Assessment</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Grade Level</label>
              <select value={activeGrade} onChange={(e) => setActiveGrade(parseInt(e.target.value))} className="w-full p-5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-femac-900 font-black uppercase text-xs outline-none focus:border-femac-yellow appearance-none">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Identification..." className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-femac-900 uppercase text-xs focus:border-femac-yellow" />
          </div>
        </div>
        
        {(submittedCount > 0 || approvedCount > 0) && (
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-slate-50">
            {submittedCount > 0 && (
              <button onClick={() => handleStatusChangeBatch(GradeStatus.APPROVED)} className="bg-femac-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-femac-800 transition-all flex items-center">
                <CheckCircle size={14} className="mr-2" /> Verify All Submitted ({submittedCount})
              </button>
            )}
            {approvedCount > 0 && (
              <button onClick={() => handleStatusChangeBatch(GradeStatus.PUBLISHED)} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-green-700 transition-all flex items-center">
                <Send size={14} className="mr-2" /> Publish All Verified ({approvedCount})
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredReports.map(report => {
          const student = studentsMap[report.studentId];
          return (
            <div key={report.id} className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center group transition-all hover:shadow-xl hover:border-femac-yellow/20 gap-6">
               <div className="flex items-center space-x-6">
                  <div className="bg-slate-50 p-6 rounded-[1.5rem] group-hover:bg-femac-yellow group-hover:text-femac-900 transition-all shadow-sm"><FileText size={32} /></div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">{getStatusBadge(report.status)}<span className="text-[9px] font-black text-slate-300 tracking-widest uppercase">Registry ID: {report.studentId}</span></div>
                    <h3 className="text-3xl font-black text-femac-900 uppercase tracking-tighter leading-none">{student?.firstName} {student?.lastName}</h3>
                  </div>
               </div>
               
               <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
                  {report.status === GradeStatus.SUBMITTED && (
                    <button 
                      onClick={() => handleStatusChangeSingle(report.id, GradeStatus.APPROVED)} 
                      className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-femac-900 text-white hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-md flex items-center"
                    >
                      <ShieldCheck size={14} className="mr-2" /> Verify Node
                    </button>
                  )}
                  
                  {report.status === GradeStatus.APPROVED && (
                    <button 
                      onClick={() => handleStatusChangeSingle(report.id, GradeStatus.PUBLISHED)} 
                      className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-green-600 text-white hover:bg-green-700 transition-all shadow-md flex items-center"
                    >
                      <Send size={14} className="mr-2" /> Publish Node
                    </button>
                  )}

                  {report.status === GradeStatus.PUBLISHED && (
                    <button 
                      onClick={() => handleStatusChangeSingle(report.id, GradeStatus.APPROVED)} 
                      className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-slate-100 text-slate-400 hover:text-red-600 transition-all flex items-center"
                    >
                      <RotateCcw size={14} className="mr-2" /> Withdraw
                    </button>
                  )}

                  <button 
                    onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)} 
                    className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all border border-slate-100 flex items-center"
                  >
                    <Eye size={14} className="mr-2" /> {expandedReportId === report.id ? 'Hide Details' : 'View Scores'}
                  </button>
               </div>

               {expandedReportId === report.id && (
                 <div className="w-full mt-6 pt-8 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {report.subjects.map((sub, sIdx) => (
                         <div key={sIdx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{sub.subjectName}</p>
                            <div className="flex justify-between items-end">
                               <p className="text-2xl font-black text-femac-900 tracking-tighter">{sub.score}%</p>
                               <span className="text-[10px] font-black uppercase text-femac-yellow">{sub.grade}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                    {report.teacherComment && (
                      <div className="mt-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                        <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest mb-2 flex items-center"><Info size={12} className="mr-2" /> Teacher's Registry Comment</p>
                        <p className="text-sm font-bold text-slate-600 italic">"{report.teacherComment}"</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
          );
        })}
        
        {filteredReports.length === 0 && (
          <div className="py-32 text-center">
            <div className="bg-white w-24 h-24 rounded-[2rem] shadow-xl border border-slate-100 flex items-center justify-center mx-auto mb-8">
              <Search size={40} className="text-slate-200" />
            </div>
            <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">No Reports Found in This Registry Node</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Adjust your filters or verify teacher submissions.</p>
          </div>
        )}
      </div>
    </div>
  );
};