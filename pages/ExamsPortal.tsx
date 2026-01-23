import React, { useState, useEffect } from 'react';
import { MOCK_CLASSES, MOCK_ASSIGNMENTS } from '../constants';
import { MockDB } from '../services/mockDb';
import { GradeRecord, GradeStatus } from '../types';
import { CheckCircle, XCircle, Globe, Filter } from 'lucide-react';

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
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-femac-900">Exams Office Validation</h2>
          <p className="text-slate-500">Review teacher submissions and publish results</p>
        </div>
         <select 
            value={activeClassId} 
            onChange={(e) => setActiveClassId(e.target.value)}
            className="p-2 border border-slate-300 rounded-md bg-white text-slate-700"
          >
            {MOCK_CLASSES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assignments.map(assignment => {
            // Find status of this assignment (assuming batch consistency for prototype)
            const assignmentGrades = grades.filter(g => g.assignmentId === assignment.id);
            if (assignmentGrades.length === 0) return null;
            const currentStatus = assignmentGrades[0].status;

            return (
                <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-femac-800">{assignment.title}</h3>
                            <p className="text-sm text-slate-500">Max Score: {assignment.maxScore} | Date: {assignment.date}</p>
                        </div>
                        <div>
                            {getStatusBadge(currentStatus)}
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded p-4 mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Total Entries:</span>
                            <span className="font-mono font-bold">{assignmentGrades.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Average Score:</span>
                            <span className="font-mono font-bold">
                                {Math.round(assignmentGrades.reduce((a,b) => a + b.score, 0) / assignmentGrades.length)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons based on State */}
                    <div className="flex space-x-3 pt-2 border-t border-slate-100">
                        {currentStatus === GradeStatus.DRAFT && (
                            <div className="text-sm text-slate-500 italic flex items-center">
                                <Filter size={16} className="mr-2"/> Waiting for teacher submission...
                            </div>
                        )}

                        {currentStatus === GradeStatus.SUBMITTED && (
                            <>
                                <button 
                                    onClick={() => handleStatusChange(assignment.id, GradeStatus.APPROVED)}
                                    className="flex-1 bg-femac-600 hover:bg-femac-700 text-white py-2 rounded flex items-center justify-center space-x-2"
                                >
                                    <CheckCircle size={16} /> <span>Approve</span>
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(assignment.id, GradeStatus.DRAFT)}
                                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded flex items-center justify-center space-x-2"
                                >
                                    <XCircle size={16} /> <span>Reject & Unlock</span>
                                </button>
                            </>
                        )}

                        {currentStatus === GradeStatus.APPROVED && (
                            <button 
                                onClick={() => handleStatusChange(assignment.id, GradeStatus.PUBLISHED)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center space-x-2"
                            >
                                <Globe size={16} /> <span>Publish to Parent Portal</span>
                            </button>
                        )}

                         {currentStatus === GradeStatus.PUBLISHED && (
                            <div className="w-full text-center text-green-700 font-medium py-2 flex items-center justify-center">
                                <Globe size={16} className="mr-2" /> Live on Portal
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};