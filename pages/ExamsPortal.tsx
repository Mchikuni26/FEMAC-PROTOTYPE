
import React, { useState, useEffect } from 'react';
import { MOCK_CLASSES } from '../constants';
import { MockDB } from '../services/mockDb';
import { GradeStatus, StudentReport, AssessmentType } from '../types';
import { 
  CheckCircle, XCircle, Globe, Filter, ExternalLink, Eye, 
  ChevronDown, ShieldCheck, Calendar, FileText, AlertCircle, 
  Users, TrendingUp, Info, Search, LayoutGrid, Award
} from 'lucide-react';

export const ExamsPortal: React.FC = () => {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [activeGrade, setActiveGrade] = useState(1);
  const [activeType, setActiveType] = useState<AssessmentType>('End-of-Term');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(refreshCounter());

  function refreshCounter() {
    return Math.floor(Math.random() * 100000);
  }

  useEffect(() => {
    setReports(MockDB.getReportsByGrade(activeGrade).filter(r => r.type === activeType));
  }, [activeGrade, activeType, refreshKey]);

  const handleStatusChangeBatch = (status: GradeStatus) => {
    const msg = status === GradeStatus.PUBLISHED ? "PUBLISH" : "APPROVE";
    if (confirm(`Authorize registry to ${msg} all reports for Grade ${activeGrade} (${activeType})?`)) {
      MockDB.updateReportStatusBatch(activeGrade, activeType, status);
      setRefreshKey(refreshCounter());
    }
  };

  const handleStatusChangeSingle = (id: string, status: GradeStatus) => {
    MockDB.updateReportStatus(id, status);
    setRefreshKey(refreshCounter());
  };

  const getStatusBadge = (status: GradeStatus) => {
    switch (status) {
      case GradeStatus.DRAFT: return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Draft</span>;
      case GradeStatus.SUBMITTED: return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Awaiting Validation</span>;
      case GradeStatus.APPROVED: return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Approved</span>;
      case GradeStatus.PUBLISHED: return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Published</span>;
    }
  };

  const filteredReports = reports.filter(report => {
    const student = MockDB.getStudentById(report.studentId);
    const fullName = `${student?.firstName} ${student?.lastName}`.toLowerCase();
    const id = report.studentId.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || id.includes(search);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header with ECZ Portal Link */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
          <div className="bg-femac-900 p-5 rounded-[2.5rem] shadow-2xl shadow-femac-900/20 relative">
            <ShieldCheck className="text-femac-yellow" size={36} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-femac-900 tracking-tighter uppercase leading-none">Exams Validation Terminal</h2>
            <div className="flex items-center space-x-3 mt-3">
              <span className="bg-femac-50 text-femac-800 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-femac-100">Official Internal Registry</span>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest flex items-center">
                Node ID: FAIMS-EXM-001
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a 
            href="https://portal.ecz.org.zm/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center space-x-3 bg-femac-yellow text-femac-900 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-femac-900 hover:text-white transition-all shadow-xl group active:scale-95"
          >
            <Award size={18} className="group-hover:rotate-12 transition-transform" />
            <span>ECZ Web Portal</span>
            <ExternalLink size={14} className="opacity-50" />
          </a>
          <div className="hidden md:block w-px h-12 bg-slate-100"></div>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
             <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center">
               <Info size={12} className="mr-2" /> Validation Sync
             </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Filters & Search */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-end">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full lg:w-1/2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Evaluation Category</label>
              <div className="relative">
                <select 
                  value={activeType}
                  onChange={(e) => setActiveType(e.target.value as AssessmentType)}
                  className="w-full p-5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-femac-900 font-black uppercase text-xs appearance-none focus:border-femac-yellow transition-all"
                >
                  <option value="End-of-Term">End-of-Term Reports</option>
                  <option value="Mid-Term">Mid-Term Reports</option>
                  <option value="Mid-week Assessment">Mid-week Reports</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Grade Review Level</label>
              <div className="relative">
                <select 
                  value={activeGrade} 
                  onChange={(e) => setActiveGrade(parseInt(e.target.value))}
                  className="w-full p-5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-femac-900 font-black uppercase text-xs appearance-none focus:border-femac-yellow transition-all"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g} Registry</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 flex items-center">
              <Search size={12} className="mr-2 text-femac-yellow" /> Pupil Identification Search
            </label>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Identification String (Name, ID, or Surname)..."
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-femac-900 uppercase text-xs focus:border-femac-yellow placeholder:text-slate-300 shadow-inner"
              />
            </div>
          </div>
        </div>

        {reports.length > 0 && (
          <div className="flex flex-wrap justify-end gap-4 pt-4 border-t border-slate-50">
            <button onClick={() => handleStatusChangeBatch(GradeStatus.APPROVED)} className="bg-femac-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-femac-800 transition-all flex items-center shadow-lg active:scale-95">
              <CheckCircle size={16} className="mr-2 text-femac-yellow" /> Authorize Grade {activeGrade}
            </button>
            <button onClick={() => handleStatusChangeBatch(GradeStatus.PUBLISHED)} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all flex items-center shadow-lg active:scale-95">
              <Globe size={16} className="mr-2" /> Publish Verified Registry
            </button>
          </div>
        )}
      </div>

      {/* Reports Matrix */}
      <div className="grid grid-cols-1 gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map(report => {
            const student = MockDB.getStudentById(report.studentId);
            const isExpanded = expandedReportId === report.id;
            return (
              <div key={report.id} className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
                <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-start space-x-6">
                    <div className="bg-slate-50 p-6 rounded-[1.5rem] text-femac-900 group-hover:bg-femac-yellow transition-colors">
                      <FileText size={32} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusBadge(report.status)}
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Candidate ID: {report.studentId}</span>
                      </div>
                      <h3 className="text-3xl font-black text-femac-900 uppercase tracking-tighter leading-none">{student?.firstName} {student?.lastName}</h3>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-[10px] font-black uppercase text-femac-800 bg-femac-50 px-3 py-1 rounded-lg">Score: {report.overallPercentage}%</span>
                        <span className="text-[10px] font-black uppercase text-slate-400">Node Rank: {report.overallGrade}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <button 
                      onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                      className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center transition-all ${isExpanded ? 'bg-femac-900 text-white shadow-2xl' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      <Eye size={16} className="mr-2" /> {isExpanded ? 'Close Detail' : 'Identify Results'}
                    </button>
                    {report.status === GradeStatus.SUBMITTED && (
                       <button onClick={() => handleStatusChangeSingle(report.id, GradeStatus.APPROVED)} className="bg-femac-900 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-femac-yellow hover:text-femac-900 transition-all active:scale-95">Verify Pupil</button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-slate-50 p-10 border-t border-slate-100 animate-in slide-in-from-top duration-500">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900 text-[10px] font-black uppercase tracking-widest text-femac-400">
                          <tr>
                            <th className="px-10 py-6">Aggregated Subject Registry</th>
                            <th className="px-10 py-6 text-center">Master Score</th>
                            <th className="px-10 py-6 text-center">Pct (%)</th>
                            <th className="px-10 py-6 text-right">Identifier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {report.subjects.map((sub, sIdx) => (
                            <tr key={sIdx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-10 py-5 text-sm font-black text-femac-900 uppercase tracking-tight">{sub.subjectName}</td>
                              <td className="px-10 py-5 text-center font-mono font-black text-sm">{sub.score} <span className="text-slate-300 font-bold">/</span> {sub.maxScore}</td>
                              <td className="px-10 py-5 text-center font-black text-xs">
                                <span className={`px-4 py-2 rounded-xl ${sub.percentage >= 50 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                  {sub.percentage}%
                                </span>
                              </td>
                              <td className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-femac-900 text-white font-black uppercase text-sm">
                          <tr>
                            <td className="px-10 py-8 text-lg tracking-tighter">Terminal Output Totals</td>
                            <td className="px-10 py-8 text-center text-3xl text-femac-yellow">{report.totalScore} <span className="text-white/20 text-xl font-bold">/</span> {report.maxTotalScore}</td>
                            <td className="px-10 py-8 text-center text-3xl">{report.overallPercentage}%</td>
                            <td className="px-10 py-8 text-right text-lg tracking-widest underline decoration-femac-yellow decoration-4 underline-offset-8">{report.overallGrade}</td>
                          </tr>
                        </tfoot>
                      </table>
                      <div className="p-10 border-t border-slate-100 bg-slate-50 flex items-start space-x-6">
                         <div className="bg-white p-4 rounded-2xl shadow-sm"><Info className="text-femac-yellow" size={24}/></div>
                         <div>
                            <h5 className="text-[11px] font-black uppercase text-femac-900 tracking-widest mb-2">Teacher Evaluation Node</h5>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wide">{report.teacherComment || 'Registry Remark: Candidate data synchronization complete. No specific teacher notes logged.'}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 text-center flex flex-col items-center justify-center px-10">
            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mb-8">
              <SearchCode className="opacity-20" size={64} />
            </div>
            <h4 className="text-3xl font-black text-slate-300 uppercase tracking-tighter">No Reports Identified</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-3 max-w-sm">
              Adjust filters or search string to retrieve candidate data from Grade {activeGrade} Registry.
            </p>
          </div>
        )}
      </div>

      {/* Footer Support Node */}
      <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10"><LayoutGrid size={28} className="text-femac-yellow" /></div>
           <div>
              <p className="text-lg font-black uppercase tracking-tight">External Data Federation</p>
              <p className="text-[10px] font-bold text-femac-400 uppercase tracking-widest">Authorized linkage to ECZ Central Repository Node</p>
           </div>
        </div>
        <div className="flex items-center space-x-6">
           <div className="text-right">
              <p className="text-[10px] font-black text-femac-yellow uppercase tracking-widest mb-1">System Status</p>
              <p className="text-[9px] font-bold text-white/50 uppercase">Sync Frequency: 500ms • Region: Zambia Central</p>
           </div>
           <TrendingUp className="text-green-500" size={32} />
        </div>
      </div>
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
