import React, { useState, useEffect } from 'react';
import { MOCK_CLASSES, MOCK_ASSIGNMENTS, MOCK_STUDENTS } from '../constants';
import { MockDB } from '../services/mockDb';
import { GradeRecord, GradeStatus, User } from '../types';
import { Save, Lock, Plus, AlertCircle } from 'lucide-react';

interface TeacherPortalProps {
  currentUser?: User;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ currentUser }) => {
  // Filter classes to only show those belonging to the logged-in teacher
  const teacherClasses = MOCK_CLASSES.filter(c => c.teacherId === currentUser?.id);
  
  const [selectedClass, setSelectedClass] = useState(teacherClasses[0]?.id || '');
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const refreshGrades = () => {
    if (!selectedClass) return;
    setLoading(true);
    setTimeout(() => {
      setGrades(MockDB.getGradesByClass(selectedClass));
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    refreshGrades();
  }, [selectedClass]);

  const handleScoreChange = (gradeId: string, val: string) => {
    const numVal = parseInt(val);
    if (!isNaN(numVal)) {
      MockDB.updateGrade(gradeId, numVal);
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

  if (teacherClasses.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Classes Assigned</h3>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Contact registry office for allocation.</p>
      </div>
    );
  }

  const assignments = MOCK_ASSIGNMENTS.filter(a => a.classId === selectedClass);
  const currentClassInfo = teacherClasses.find(c => c.id === selectedClass);
  // Only show students in the correct grade for this class
  const classStudents = MOCK_STUDENTS.filter(s => s.grade === currentClassInfo?.gradeLevel);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-femac-900 border-l-4 border-femac-yellow pl-3 uppercase tracking-tighter">Authorized Gradebook</h2>
          <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mt-1">Registry Access for {currentUser?.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Class:</span>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-3 border-2 border-slate-100 rounded-xl bg-white text-femac-900 font-black uppercase text-xs outline-none focus:border-femac-yellow transition-all"
          >
            {teacherClasses.map(c => (<option key={c.id} value={c.id}>{c.name} (G{c.gradeLevel})</option>))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-[2rem] overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-[10px] text-slate-700 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-10 py-5 font-black tracking-widest">Pupil Academic ID</th>
                {assignments.map(a => (
                  <th key={a.id} className="px-6 py-5 min-w-[200px]">
                    <div className="flex flex-col">
                      <span className="font-black text-femac-900 text-sm tracking-tight">{a.title}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest">{a.maxScore} pts • {a.type}</span>
                      {(() => {
                         const sampleGrade = grades.find(g => g.assignmentId === a.id);
                         const isSubmitted = sampleGrade?.status !== GradeStatus.DRAFT;
                         return isSubmitted ? (
                           <span className="mt-2 inline-flex items-center text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg w-fit"><Lock size={10} className="mr-1" /> Locked Registry</span>
                         ) : (
                           <button onClick={() => handleSubmitGrades(a.id)} className="mt-2 text-[9px] text-femac-900 bg-femac-yellow px-3 py-1 rounded-lg font-black uppercase tracking-widest flex items-center hover:bg-femac-800 hover:text-white transition-all w-fit shadow-md"><Save size={10} className="mr-1" /> Submit Data</button>
                         );
                      })()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {classStudents.map(student => (
                <tr key={student.id} className="bg-white group hover:bg-femac-50/30 transition-colors">
                  <td className="px-10 py-6 font-black text-femac-900 tracking-tighter uppercase">{student.id}</td>
                  {assignments.map(a => {
                    const grade = grades.find(g => g.studentId === student.id && g.assignmentId === a.id);
                    const isLocked = grade?.status !== GradeStatus.DRAFT;
                    return (
                      <td key={a.id} className="px-6 py-6">
                        <div className="relative">
                          <input
                            type="number" min="0" max={a.maxScore} disabled={isLocked}
                            value={grade?.score || 0}
                            onChange={(e) => grade && handleScoreChange(grade.id, e.target.value)}
                            className={`w-24 p-3 border-2 rounded-xl text-center font-mono font-bold text-lg ${isLocked ? 'bg-slate-100 text-slate-400 border-slate-100' : 'bg-white border-slate-100 focus:border-femac-yellow focus:ring-4 focus:ring-femac-yellow/10'}`}
                          />
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
    </div>
  );
};