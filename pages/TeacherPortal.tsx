
import React, { useState, useEffect } from 'react';
import { MOCK_CLASSES } from '../constants';
import { MockDB } from '../services/mockDb';
import { 
  GradeStatus, User, Student, SubjectPerformance, 
  StudentReport, AssessmentType, ApplicationStatus 
} from '../types';
import { 
  Lock, Search, User as UserIcon, ChevronRight, 
  FileText, CheckCircle, ClipboardCheck, Target, 
  GraduationCap, X, Send, ShieldCheck, Users, Save, 
  TrendingUp, Calculator, FileCheck, UploadCloud, AlertCircle
} from 'lucide-react';

interface TeacherPortalProps {
  currentUser?: User;
}

const PRIMARY_SUBJECTS = [
  'Literacy / English', 'Numeracy / Mathematics', 'Integrated Science',
  'Social Studies', 'Creative & Tech Studies', 'Home Economics', 'Physical Education'
];

const JUNIOR_SUBJECTS = [
  'English Language', 'Mathematics', 'Integrated Science', 'Social Studies',
  'Business Studies', 'Religious Education', 'Computer Studies', 'Agricultural Science'
];

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ currentUser }) => {
  const teacherClasses = MOCK_CLASSES.filter(c => c.teacherId === currentUser?.id);
  const teacherGrades = Array.from(new Set(teacherClasses.map(c => c.gradeLevel)));
  
  const [selectedClassId, setSelectedClassId] = useState(teacherClasses[0]?.id || '');
  const [activePupilId, setActivePupilId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [activeType, setActiveType] = useState<AssessmentType>('End-of-Term');
  const [editingReport, setEditingReport] = useState<Partial<StudentReport> | null>(null);

  const selectedClass = teacherClasses.find(c => c.id === selectedClassId);
  const activeGrade = selectedClass?.gradeLevel;

  useEffect(() => {
    const loadStudents = async () => {
      const allStudents = await MockDB.getStudents();
      const filtered = allStudents.filter(s => 
        s.applicationStatus === ApplicationStatus.ACCEPTED && 
        teacherGrades.includes(s.grade)
      );
      setStudents(filtered);
    };
    loadStudents();
  }, [teacherGrades]);

  useEffect(() => {
    if (activePupilId) {
      loadReport(activePupilId, activeType);
    }
  }, [activePupilId, activeType]);

  const loadReport = async (studentId: string, type: AssessmentType) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const existingReports = await MockDB.getReportsByStudent(studentId);
    const report = existingReports.find(r => r.type === type);

    if (report) {
      setEditingReport(report);
    } else {
      const subjectsList = student.grade <= 7 ? PRIMARY_SUBJECTS : JUNIOR_SUBJECTS;
      const initialSubjects: SubjectPerformance[] = subjectsList.map(name => ({
        subjectName: name, score: 0, maxScore: 100, grade: 'U', percentage: 0
      }));

      setEditingReport({
        id: `REP-${type}-${studentId}-${Date.now()}`,
        studentId, type, term: 'Term 1', academicYear: 2026,
        subjects: initialSubjects, totalScore: 0,
        maxTotalScore: initialSubjects.length * 100,
        overallPercentage: 0, overallGrade: 'U', teacherComment: '',
        status: GradeStatus.DRAFT
      });
    }
  };

  const calculateGrade = (pct: number) => {
    if (pct >= 80) return 'Distinction';
    if (pct >= 65) return 'Merit';
    if (pct >= 50) return 'Credit';
    if (pct >= 40) return 'Pass';
    return 'Unsatisfactory';
  };

  const handleSubjectScoreChange = (index: number, score: number) => {
    if (!editingReport || !editingReport.subjects) return;
    const newSubjects = [...editingReport.subjects];
    const sub = newSubjects[index];
    const safeScore = Math.min(sub.maxScore, Math.max(0, score));
    const pct = Math.round((safeScore / sub.maxScore) * 100);
    newSubjects[index] = { ...sub, score: safeScore, percentage: pct, grade: calculateGrade(pct) };
    const total = newSubjects.reduce((acc, curr) => acc + curr.score, 0);
    const maxTotal = newSubjects.reduce((acc, curr) => acc + curr.maxScore, 0);
    const overallPct = Math.round((total / maxTotal) * 100);
    setEditingReport({ ...editingReport, subjects: newSubjects, totalScore: total, overallPercentage: overallPct, overallGrade: calculateGrade(overallPct) });
  };

  const handleSaveReport = async () => {
    if (editingReport && editingReport.status === GradeStatus.DRAFT) {
      await MockDB.saveReport(editingReport as StudentReport);
      alert("Academic report saved to local registry draft.");
    }
  };

  const handleSubmitReport = async () => {
    if (confirm("SUBMIT FOR VALIDATION: This report will be transmitted to the Exams Registry. It will be LOCKED for editing. Continue?")) {
      const submittedReport = { ...editingReport, status: GradeStatus.SUBMITTED } as StudentReport;
      await MockDB.saveReport(submittedReport);
      setEditingReport(submittedReport);
      alert("Report submitted successfully.");
    }
  };

  const filteredStudents = students.filter(s => 
    (activeGrade ? s.grade === activeGrade : true) && (
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-femac-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-femac-yellow opacity-5 blur-[100px]"></div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-20 h-20 bg-femac-yellow rounded-[2rem] flex items-center justify-center text-femac-900 shadow-xl">
            <ClipboardCheck size={36} />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Academic Registry</h2>
            <p className="text-femac-300 font-black uppercase tracking-[0.3em] text-[10px] mt-3">Teacher: {currentUser?.name}</p>
          </div>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10">
          {(['End-of-Term', 'Mid-Term', 'Mid-week Assessment'] as AssessmentType[]).map(type => (
            <button key={type} onClick={() => setActiveType(type)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === type ? 'bg-femac-yellow text-femac-900 shadow-lg' : 'text-femac-300 hover:text-white'}`}>{type}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[700px]">
            <div className="mb-6 space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Class</label>
              <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-femac-900 uppercase text-[10px] appearance-none focus:border-femac-yellow">
                {teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name} (G{c.gradeLevel})</option>)}
              </select>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search Pupil..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-femac-900 uppercase text-[10px] focus:border-femac-yellow" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {filteredStudents.map(s => (
                <button key={s.id} onClick={() => setActivePupilId(s.id)} className={`w-full flex items-center p-4 rounded-2xl transition-all border-2 ${activePupilId === s.id ? 'border-femac-yellow bg-femac-50/50' : 'border-transparent hover:bg-slate-50'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase mr-4 ${activePupilId === s.id ? 'bg-femac-900 text-femac-yellow' : 'bg-slate-100 text-slate-500'}`}>{s.firstName[0]}</div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-femac-900 uppercase tracking-tight leading-none">{s.firstName} {s.lastName}</p>
                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">ID: {s.id}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activePupilId && editingReport ? (
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-500">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-femac-900 text-femac-yellow px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{activeType}</span>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${editingReport.status === GradeStatus.DRAFT ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-600'}`}>Node: {editingReport.status}</span>
                    </div>
                    <h3 className="text-3xl font-black text-femac-900 uppercase tracking-tighter">
                      {students.find(s => s.id === activePupilId)?.firstName} {students.find(s => s.id === activePupilId)?.lastName}
                    </h3>
                  </div>
                  {editingReport.status === GradeStatus.DRAFT && (
                    <div className="flex gap-3">
                      <button onClick={handleSaveReport} className="bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center"><Save size={16} className="mr-2" /> Save Draft</button>
                      <button onClick={handleSubmitReport} className="bg-femac-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-xl flex items-center"><Send size={16} className="mr-2" /> Submit Registry</button>
                    </div>
                  )}
               </div>

               <div className="overflow-hidden rounded-3xl border border-slate-100 mb-8">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <tr>
                       <th className="px-6 py-4">Subject Node</th>
                       <th className="px-6 py-4">Raw Score</th>
                       <th className="px-6 py-4">Percentage</th>
                       <th className="px-6 py-4">Grade Alignment</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {editingReport.subjects?.map((sub, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-5 font-black text-femac-900 text-xs uppercase">{sub.subjectName}</td>
                         <td className="px-6 py-5">
                           <input 
                             disabled={editingReport.status !== GradeStatus.DRAFT}
                             type="number" 
                             value={sub.score} 
                             onChange={(e) => handleSubjectScoreChange(idx, parseInt(e.target.value))} 
                             className="w-20 p-3 bg-white border border-slate-200 rounded-xl outline-none font-black text-center text-femac-900 focus:border-femac-yellow disabled:opacity-50" 
                           />
                         </td>
                         <td className="px-6 py-5 font-black text-femac-900">{sub.percentage}%</td>
                         <td className="px-6 py-5"><span className="bg-femac-50 text-femac-900 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-femac-100">{sub.grade}</span></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Master Comment Registry</p>
                    <textarea 
                      disabled={editingReport.status !== GradeStatus.DRAFT}
                      value={editingReport.teacherComment}
                      onChange={(e) => setEditingReport({...editingReport, teacherComment: e.target.value.toUpperCase()})}
                      rows={4}
                      className="w-full p-6 bg-white border border-slate-200 rounded-3xl outline-none font-bold text-slate-700 text-xs uppercase leading-relaxed focus:border-femac-yellow disabled:opacity-50"
                      placeholder="ENTER ACADEMIC OBSERVATIONS..."
                    />
                  </div>
                  <div className="bg-femac-900 p-10 rounded-[2.5rem] text-white flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase text-femac-400 tracking-widest mb-2">Final Performance Node</p>
                    <div className="flex items-end space-x-4">
                      <h5 className="text-7xl font-black tracking-tighter text-femac-yellow">{editingReport.overallPercentage}%</h5>
                      <span className="text-sm font-black uppercase tracking-widest mb-3 opacity-60">{editingReport.overallGrade}</span>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                       <p className="text-[9px] font-black uppercase text-femac-400 tracking-widest">Aggregate Registry Score</p>
                       <p className="text-xl font-black text-white">{editingReport.totalScore} / {editingReport.maxTotalScore}</p>
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center py-40 text-center px-10 text-slate-300">
              <Users size={48} className="mb-6 opacity-20" />
              <h4 className="text-2xl font-black uppercase tracking-tighter">Select a Pupil to Synchronize Reports</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
