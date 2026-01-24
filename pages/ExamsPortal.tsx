
import React, { useState, useEffect } from 'react';
import { MOCK_CLASSES, MOCK_ASSIGNMENTS } from '../constants';
import { MockDB } from '../services/mockDb';
import { GradeRecord, GradeStatus } from '../types';
import { CheckCircle, XCircle, Globe, Filter, ExternalLink } from 'lucide-react';

export const ExamsPortal: React.FC = () => {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [activeClassId, setActiveClassId] = useState(MOCK_CLASSES[0].id);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setGrades(MockDB.getGradesByClass(activeClassId));
  }, [activeClassId, refreshKey]);

  const assignments = MOCK_ASSIGNMENTS.filter(a => a.classId === activeClassId);

  const handleStatusChange = (assignmentId: string, newStatus: GradeStatus) => {
    MockDB.updateGradeStatusBatch(assignmentId, newStatus);
    setRefreshKey(prev => prev + 1); // Force re-render
  };

  const getStatusBadge = (status: GradeStatus) => {
    switch (status) {
      case GradeStatus.DRAFT: return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">DRAFT</span>;
      case GradeStatus.SUBMITTED: return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">PENDING APPROVAL</span>;
      case GradeStatus.APPROVED: return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">APPROVED (INTERNAL)</span>;
      case GradeStatus.PUBLISHED: return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">PUBLISHED</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       {/* Official ECZ External Link Banner */}
       <div className="bg-femac-yellow p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between border-2 border-femac-900/10 shadow-lg shadow-femac-yellow/20">
         <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="bg-femac-900 p-2 rounded-xl">
               <Globe className="text-femac-yellow" size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-femac-900/60 leading-none mb-1">External Resource</p>
               <p className="text-sm font-black text-femac-900 uppercase tracking-tight">Examination Council of Zambia (ECZ)</p>
            </div>
         </div>
         <a 
           href="https://portal.ecz.org.zm/" 
           target="_blank" 
           rel="noopener noreferrer"
           className="bg-femac-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center hover:bg-femac-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-femac-900/20"
         >
           Official Registration Portal <ExternalLink size={14} className="ml-2 text-femac-yellow" />
         </a>
       </div>

       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-femac-900 tracking-tighter uppercase leading-none">Exams Office Validation</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Review teacher submissions and publish results</p>
        </div>
         <div className="flex items-center space-x-3">
           <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Filter:</span>
           <select 
              value={activeClassId} 
              onChange={(e) => setActiveClassId(e.target.value)}
              className="p-3 border-2 border-slate-100 rounded-xl bg-white text-femac-900 font-black uppercase text-xs focus:border-femac-yellow outline-none transition-all"
            >
              {MOCK_CLASSES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map(assignment => {
            // Find status of this assignment (assuming batch consistency for prototype)
            const assignmentGrades = grades.filter(g => g.assignmentId === assignment.id);
            if (assignmentGrades.length === 0) return null;
            const currentStatus = assignmentGrades[0].status;

            return (
                <div key={assignment.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <div className="bg-slate-50 inline-block px-3 py-1 rounded-full mb-3">
                              {getStatusBadge(currentStatus)}
                            </div>
                            <h3 className="text-2xl font-black text-femac-900 uppercase tracking-tighter leading-tight group-hover:text-femac-yellow transition-colors">{assignment.title}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Date: {assignment.date}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-5 mb-8 border border-slate-50">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                            <span className="text-slate-400">Total Entries</span>
                            <span className="text-femac-900">{assignmentGrades.length}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Average Score</span>
                            <span className="text-femac-900 bg-femac-yellow/20 px-2 rounded-md">
                                {Math.round(assignmentGrades.reduce((a,b) => a + b.score, 0) / assignmentGrades.length)}%
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons based on State */}
                    <div className="mt-auto space-y-3 pt-6 border-t border-slate-50">
                        {currentStatus === GradeStatus.DRAFT && (
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center justify-center py-3">
                                <Filter size={14} className="mr-2 opacity-30"/> Awaiting Teacher Submission
                            </div>
                        )}

                        {currentStatus === GradeStatus.SUBMITTED && (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleStatusChange(assignment.id, GradeStatus.APPROVED)}
                                    className="bg-femac-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-femac-800 transition-all shadow-lg active:scale-95"
                                >
                                    <CheckCircle size={14} className="mr-2 text-femac-yellow" /> Approve
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(assignment.id, GradeStatus.DRAFT)}
                                    className="bg-red-50 text-red-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-red-100 transition-all active:scale-95"
                                >
                                    <XCircle size={14} className="mr-2" /> Reject
                                </button>
                            </div>
                        )}

                        {currentStatus === GradeStatus.APPROVED && (
                            <button 
                                onClick={() => handleStatusChange(assignment.id, GradeStatus.PUBLISHED)}
                                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-green-700 transition-all shadow-lg active:scale-95"
                            >
                                <Globe size={14} className="mr-2" /> Publish to Portals
                            </button>
                        )}

                         {currentStatus === GradeStatus.PUBLISHED && (
                            <div className="w-full text-center text-green-600 font-black text-[10px] uppercase tracking-[0.3em] py-4 bg-green-50 rounded-2xl flex items-center justify-center">
                                <Globe size={14} className="mr-2 animate-pulse" /> Data is Live
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
      
      {/* Help Card */}
      <div className="bg-slate-900 text-slate-400 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between border border-white/5">
        <div className="mb-6 md:mb-0">
          <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">Exams Integrity Notice</h4>
          <p className="text-xs font-medium leading-relaxed max-w-md">Approved internal grades must be published to become visible to parents and pupils. Rejection unlocks the gradebook for the respective teacher.</p>
        </div>
        <div className="flex space-x-4">
          <div className="text-center px-6 py-2 border-r border-white/10">
            <p className="text-white text-xl font-black">98%</p>
            <p className="text-[8px] font-black uppercase tracking-widest">Validation Rate</p>
          </div>
          <div className="text-center px-6 py-2">
            <p className="text-white text-xl font-black">2.4h</p>
            <p className="text-[8px] font-black uppercase tracking-widest">Avg Review Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};
