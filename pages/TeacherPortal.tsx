import React, { useState, useEffect } from 'react';
import { MOCK_CLASSES, MOCK_ASSIGNMENTS, MOCK_STUDENTS } from '../constants';
import { MockDB } from '../services/mockDb';
import { GradeRecord, GradeStatus } from '../types';
import { Save, Lock, Plus, AlertCircle } from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState(MOCK_CLASSES[0].id);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentClass = MOCK_CLASSES.find(c => c.id === selectedClass);
  const assignments = MOCK_ASSIGNMENTS.filter(a => a.classId === selectedClass);

  const refreshGrades = () => {
    setLoading(true);
    // Simulate API Delay
    setTimeout(() => {
      setGrades(MockDB.getGradesByClass(selectedClass));
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    refreshGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const handleScoreChange = (gradeId: string, val: string) => {
    const numVal = parseInt(val);
    if (!isNaN(numVal)) {
      MockDB.updateGrade(gradeId, numVal);
      // Optimistic update for UI
      setGrades(prev => prev.map(g => g.id === gradeId ? { ...g, score: numVal } : g));
    }
  };

  const handleSubmitGrades = (assignmentId: string) => {
    if (confirm("Are you sure you want to submit? This will LOCK the grades for approval.")) {
      MockDB.updateGradeStatusBatch(assignmentId, GradeStatus.SUBMITTED);
      refreshGrades();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-femac-900">Teacher Gradebook</h2>
          <p className="text-slate-500">Manage assessments and input grades</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-2 focus:ring-femac-500 outline-none"
          >
            {MOCK_CLASSES.map(c => (
              <option key={c.id} value={c.id}>{c.name} (Grade {c.gradeLevel})</option>
            ))}
          </select>
          <button className="flex items-center space-x-2 bg-femac-600 text-white px-4 py-2 rounded-md hover:bg-femac-700">
            <Plus size={18} />
            <span className="hidden md:inline">New Assessment</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          Grades submitted successfully to the Exams Office.
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading gradebook...</div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">Student Name</th>
                  {assignments.map(a => (
                    <th key={a.id} className="px-6 py-4 min-w-[150px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-femac-900">{a.title}</span>
                        <span className="text-[10px] text-slate-500">{a.maxScore} pts • {a.type}</span>
                        {/* Assignment Status Indicator */}
                        {(() => {
                           const sampleGrade = grades.find(g => g.assignmentId === a.id);
                           const isSubmitted = sampleGrade?.status !== GradeStatus.DRAFT;
                           return isSubmitted ? (
                             <span className="mt-1 inline-flex items-center text-xs text-amber-600">
                               <Lock size={10} className="mr-1" /> Locked
                             </span>
                           ) : (
                             <button 
                               onClick={() => handleSubmitGrades(a.id)}
                               className="mt-1 text-xs text-blue-600 hover:underline flex items-center"
                             >
                               <Save size={10} className="mr-1" /> Submit
                             </button>
                           );
                        })()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_STUDENTS.map(student => (
                  <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-femac-900">
                      {student.lastName}, {student.firstName}
                    </td>
                    {assignments.map(a => {
                      const grade = grades.find(g => g.studentId === student.id && g.assignmentId === a.id);
                      const isLocked = grade?.status !== GradeStatus.DRAFT;
                      
                      return (
                        <td key={a.id} className="px-6 py-4">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max={a.maxScore}
                              disabled={isLocked}
                              value={grade?.score || 0}
                              onChange={(e) => grade && handleScoreChange(grade.id, e.target.value)}
                              className={`
                                w-20 p-2 border rounded text-center font-mono
                                ${isLocked ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 focus:ring-2 focus:ring-femac-500'}
                              `}
                            />
                            {isLocked && (
                                <div className="absolute right-0 top-0 -mr-6 mt-3 text-slate-300">
                                    <Lock size={14} />
                                </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Maker-Checker Protocol Active</p>
          <p>Once you click "Submit" on a column, grades are locked and sent to the Exams Office for verification. You cannot edit them unless an Exam Officer rejects the submission.</p>
        </div>
      </div>
    </div>
  );
};