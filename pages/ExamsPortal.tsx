import React, { useState, useEffect } from 'react';
import { MOCK_CLASSES, MOCK_ASSIGNMENTS, MOCK_STUDENTS } from '../constants';
import { MockDB } from '../services/mockDb';
import { GradeRecord, GradeStatus, Student } from '../types';
// Import Calendar and other missing icons from lucide-react
import { 
  CheckCircle, XCircle, Globe, Filter, ExternalLink, Eye, 
  ChevronDown, ChevronUp, UserCheck, ShieldCheck, Search, 
  Calendar, FileText, AlertCircle 
} from 'lucide-react';

export const ExamsPortal: React.FC = () => {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [activeClassId, setActiveClassId] = useState(MOCK_CLASSES[0].id);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setGrades(MockDB.getGradesByClass(activeClassId));
  }, [activeClassId, refreshKey]);

  const currentClass = MOCK_CLASSES.find(c => c.id === activeClassId);
  const assignments = MOCK_ASSIGNMENTS.filter(a => a.classId === activeClassId);

  const handleStatusChange = (assignmentId: string, newStatus: GradeStatus) => {
    const statusMsg = newStatus === GradeStatus.PUBLISHED ? "PUBLISH" : (newStatus === GradeStatus.APPROVED ? "APPROVE" : "REJECT");
    if (confirm(`Authorize registry to ${statusMsg} all results for this assignment?`)) {
      MockDB.updateGradeStatusBatch(assignmentId, newStatus);
      setRefreshKey(prev => prev + 1);
    }
  };

  const getStatusBadge = (status: GradeStatus) => {
    switch (status) {
      case GradeStatus.DRAFT: return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">Teacher Draft</span>;
      case GradeStatus.SUBMITTED: return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">Awaiting Validation</span>;
      case GradeStatus.APPROVED: return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200">Internal Approved</span>;
      case GradeStatus.PUBLISHED: return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-200">Live on Portals</span>;
    }
  };

  // Helper to group classes by grade for the dropdown
  const gradesLevels = Array.from(new Set(MOCK_CLASSES.map(c => c.gradeLevel))).sort((a, b) => a - b);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Official Registry Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="bg-femac-900 p-5 rounded-[2rem] shadow-xl shadow-femac-900/20">
            <ShieldCheck className="text-femac-yellow" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-femac-900 tracking-tighter uppercase leading-none">Exams Validation Registry</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span> Authorized Portal Integrity Node
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <select 
              value={activeClassId} 
              onChange={(e) => {
                setActiveClassId(e.target.value);
                setExpandedAssignmentId(null);
              }}
              className="w-full md:w-64 appearance-none p-4 pr-12 border-2 border-slate-100 rounded-2xl bg-slate-50 text-femac-900 font-black uppercase text-xs focus:border-femac-yellow outline-none transition-all shadow-sm cursor-pointer"
            >
              {gradesLevels.map(gl => (
                <optgroup key={gl} label={`GRADE ${gl}`} className="font-bold text-slate-400">
                  {MOCK_CLASSES.filter(c => c.gradeLevel === gl).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
          
          <a 
            href="https://portal.ecz.org.zm/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-femac-yellow text-femac-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-femac-900 hover:text-white transition-all transform active:scale-95 shadow-lg shadow-femac-yellow/20"
          >
            ECZ Registry <ExternalLink size={14} className="ml-2" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assignments.length > 0 ? (
          assignments.map(assignment => {
            const assignmentGrades = grades.filter(g => g.assignmentId === assignment.id);
            if (assignmentGrades.length === 0) return null;
            const currentStatus = assignmentGrades[0].status;
            const isExpanded = expandedAssignmentId === assignment.id;

            return (
              <div key={assignment.id} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-femac-yellow/30">
                {/* Assignment Header Card */}
                <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex-1 flex items-start space-x-6">
                    <div className={`p-5 rounded-[1.5rem] shadow-lg ${currentStatus === GradeStatus.PUBLISHED ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-femac-900'}`}>
                      {currentStatus === GradeStatus.PUBLISHED ? <Globe size={28} /> : <FileText size={28} />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusBadge(currentStatus)}
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">UID: {assignment.id}</span>
                      </div>
                      <h3 className="text-2xl font-black text-femac-900 uppercase tracking-tighter leading-tight">{assignment.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center"><Calendar size={12} className="mr-1" /> {assignment.date}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center"><UserCheck size={12} className="mr-1" /> {assignmentGrades.length} Registered Pupils</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button 
                      onClick={() => setExpandedAssignmentId(isExpanded ? null : assignment.id)}
                      className={`flex items-center space-x-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isExpanded ? 'bg-femac-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      <Eye size={16} className={isExpanded ? 'text-femac-yellow' : ''} /> 
                      <span>{isExpanded ? 'Close Detailed Review' : 'Review Pupil Scores'}</span>
                    </button>

                    {/* Action Block */}
                    <div className="flex gap-2">
                      {currentStatus === GradeStatus.SUBMITTED && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(assignment.id, GradeStatus.APPROVED)}
                            className="bg-femac-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-femac-800 transition-all shadow-lg flex items-center"
                          >
                            <CheckCircle size={16} className="mr-2 text-femac-yellow" /> Approve
                          </button>
                          <button 
                            onClick={() => handleStatusChange(assignment.id, GradeStatus.DRAFT)}
                            className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center"
                          >
                            <XCircle size={16} className="mr-2" /> Reject
                          </button>
                        </>
                      )}

                      {currentStatus === GradeStatus.APPROVED && (
                        <button 
                          onClick={() => handleStatusChange(assignment.id, GradeStatus.PUBLISHED)}
                          className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg flex items-center animate-pulse"
                        >
                          <Globe size={16} className="mr-2" /> Publish Results
                        </button>
                      )}

                      {currentStatus === GradeStatus.PUBLISHED && (
                        <div className="px-6 py-4 bg-green-50 text-green-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center border border-green-100">
                          <CheckCircle size={16} className="mr-2" /> Live In Portals
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Pupil Review Table */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-100 p-8 animate-in slide-in-from-top duration-300">
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-inner">
                      <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                        <h4 className="text-sm font-black text-femac-900 uppercase tracking-widest">Pupil Score Registry Review</h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Weight: {assignment.maxScore} pts</span>
                      </div>
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                          <tr>
                            <th className="px-8 py-4">Pupil Academic ID</th>
                            <th className="px-8 py-4">Full Name</th>
                            <th className="px-8 py-4 text-center">Score Output</th>
                            <th className="px-8 py-4 text-center">Percentage</th>
                            <th className="px-8 py-4">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assignmentGrades.map(grade => {
                            const student = MOCK_STUDENTS.find(s => s.id === grade.studentId);
                            const pct = Math.round((grade.score / assignment.maxScore) * 100);
                            return (
                              <tr key={grade.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-8 py-4 font-black text-femac-900 uppercase text-xs tracking-tighter">{grade.studentId}</td>
                                <td className="px-8 py-4 font-bold text-slate-600 uppercase text-[10px]">{student ? `${student.firstName} ${student.lastName}` : 'N/A'}</td>
                                <td className="px-8 py-4 text-center font-mono font-black text-slate-800 text-sm">{grade.score} / {assignment.maxScore}</td>
                                <td className="px-8 py-4 text-center">
                                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${pct >= 50 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {pct}%
                                  </span>
                                </td>
                                <td className="px-8 py-4 italic text-slate-400 text-xs font-medium">{grade.comment || 'Official Registry Record'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {assignmentGrades.length === 0 && (
                        <div className="p-20 text-center">
                          <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-300">No score entries found for this assignment</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
            <Filter size={48} className="mx-auto text-slate-200 mb-4" />
            <h4 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Active Assignments for {currentClass?.name}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Check another grade or subject registry</p>
          </div>
        )}
      </div>

      {/* Strategic Footer Metrics */}
      <div className="bg-femac-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-femac-yellow opacity-5 blur-[100px] group-hover:opacity-10 transition-opacity"></div>
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
          <div className="max-w-md">
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-femac-yellow mb-3">Validation Integrity Notice</h4>
            <p className="text-xs text-femac-200 leading-relaxed font-medium">
              Once results are published, they become immutable records accessible by pupils and parents. Ensure all student entries are verified against the physical score sheets before authorization.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <p className="text-3xl font-black text-white leading-none mb-1">100%</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-femac-400">Data Integrity</p>
            </div>
            <div className="text-center border-x border-white/10 px-8">
              <p className="text-3xl font-black text-white leading-none mb-1">0.8s</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-femac-400">Sync Latency</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white leading-none mb-1">7.4k</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-femac-400">Monthly Syncs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
