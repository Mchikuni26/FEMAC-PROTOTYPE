
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
  'Literacy / English',
  'Numeracy / Mathematics',
  'Integrated Science',
  'Social Studies',
  'Creative & Tech Studies',
  'Home Economics',
  'Physical Education'
];

const JUNIOR_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Integrated Science',
  'Social Studies',
  'Business Studies',
  'Religious Education',
  'Computer Studies',
  'Agricultural Science'
];

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ currentUser }) => {
  const teacherClasses = MOCK_CLASSES.filter(c => c.teacherId === currentUser?.id);
  const teacherGrades = Array.from(new Set(teacherClasses.map(c => c.gradeLevel)));
  
  const [selectedClassId, setSelectedClassId] = useState(teacherClasses[0]?.id || '');
  const [activePupilId, setActivePupilId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  
  // Current Editing Report State
  const [activeType, setActiveType] = useState<AssessmentType>('End-of-Term');
  const [editingReport, setEditingReport] = useState<Partial<StudentReport> | null>(null);

  const selectedClass = teacherClasses.find(c => c.id === selectedClassId);
  const activeGrade = selectedClass?.gradeLevel;

  useEffect(() => {
    const allStudents = MockDB.getStudents().filter(s => 
      s.applicationStatus === ApplicationStatus.ACCEPTED && 
      teacherGrades.includes(s.grade)
    );
    setStudents(allStudents);
  }, []);

  const handleOpenReport = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const existingReports = MockDB.getReportsByStudent(studentId);
    const report = existingReports.find(r => r.type === activeType);

    if (report) {
      setEditingReport(report);
    } else {
      const subjectsList = student.grade <= 7 ? PRIMARY_SUBJECTS : JUNIOR_SUBJECTS;
      const initialSubjects: SubjectPerformance[] = subjectsList.map(name => ({
        subjectName: name,
        score: 0,
        maxScore: 100,
        grade: 'U',
        percentage: 0
      }));

      setEditingReport({
        id: `REP-${activeType}-${studentId}-${Date.now()}`,
        studentId,
        type: activeType,
        term: 'Term 1',
        academicYear: 2026,
        subjects: initialSubjects,
        totalScore: 0,
        maxTotalScore: initialSubjects.length * 100,
        overallPercentage: 0,
        overallGrade: 'U',
        teacherComment: '',
        status: GradeStatus.DRAFT
      });
    }
    setActivePupilId(studentId);
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
    const pct = Math.round((score / sub.maxScore) * 100);
    
    newSubjects[index] = {
      ...sub,
      score,
      percentage: pct,
      grade: calculateGrade(pct)
    };

    const total = newSubjects.reduce((acc, curr) => acc + curr.score, 0);
    const maxTotal = newSubjects.reduce((acc, curr) => acc + curr.maxScore, 0);
    const overallPct = Math.round((total / maxTotal) * 100);

    setEditingReport({
      ...editingReport,
      subjects: newSubjects,
      totalScore: total,
      overallPercentage: overallPct,
      overallGrade: calculateGrade(overallPct)
    });
  };

  const handleSaveReport = () => {
    if (editingReport && editingReport.status === GradeStatus.DRAFT) {
      MockDB.saveReport(editingReport as StudentReport);
      alert("Academic report saved to local registry draft.");
    }
  };

  const handleSubmitReport = () => {
    if (confirm("SUBMIT FOR VALIDATION: This report will be transmitted to the Exams Registry. It will be LOCKED for editing. Continue?")) {
      const submittedReport = { ...editingReport, status: GradeStatus.SUBMITTED } as StudentReport;
      MockDB.saveReport(submittedReport);
      setEditingReport(submittedReport);
      alert("Report submitted successfully.");
    }
  };

  const handleBulkSubmitGrade = () => {
    if (!activeGrade) return;
    if (confirm(`BULK SUBMIT: Transmit ALL initialized Grade ${activeGrade} (${activeType}) reports to the Exams Portal? This action will LOCK all current drafts.`)) {
      MockDB.updateReportStatusBatch(activeGrade, activeType, GradeStatus.SUBMITTED);
      if (activePupilId) handleOpenReport(activePupilId); // Refresh current view
      alert(`All Grade ${activeGrade} ${activeType} reports have been synchronized with the Exams Portal.`);
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
      {/* Dynamic Header */}
      <div className="bg-femac-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-femac-yellow opacity-5 blur-[100px]"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-femac-yellow rounded-[2rem] flex items-center justify-center text-femac-900 shadow-xl">
              <ClipboardCheck size={36} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Academic Registry</h2>
              <p className="text-femac-300 font-black uppercase tracking-[0.3em] text-[10px] mt-3">Teacher: {currentUser?.name}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              {(['End-of-Term', 'Mid-Term', 'Mid-week Assessment'] as AssessmentType[]).map(type => (
                <button 
                  key={type}
                  onClick={() => { setActiveType(type); if(activePupilId) handleOpenReport(activePupilId); }}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === type ? 'bg-femac-yellow text-femac-900 shadow-lg' : 'text-femac-300 hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            {activeGrade && (
              <button 
                onClick={handleBulkSubmitGrade}
                className="bg-femac-yellow text-femac-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl flex items-center group"
              >
                <UploadCloud size={16} className="mr-2 group-hover:animate-bounce" /> 
                Submit Grade {activeGrade} Registry
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Pupil List Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[700px]">
            <div className="mb-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Class</label>
                <select 
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-femac-900 uppercase text-[10px] focus:border-femac-yellow appearance-none"
                >
                  {teacherClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (G{c.gradeLevel})</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search Pupil..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-femac-900 uppercase text-[10px] focus:border-femac-yellow"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-2 mb-4">Grade {activeGrade} Registry</p>
              {filteredStudents.length > 0 ? filteredStudents.map(s => (
                <button 
                  key={s.id}
                  onClick={() => handleOpenReport(s.id)}
                  className={`w-full flex items-center p-4 rounded-2xl transition-all border-2 ${activePupilId === s.id ? 'border-femac-yellow bg-femac-50/50' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase mr-4 ${activePupilId === s.id ? 'bg-femac-900 text-femac-yellow' : 'bg-slate-100 text-slate-500'}`}>
                    {s.firstName[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-femac-900 uppercase tracking-tight leading-none">{s.firstName} {s.lastName}</p>
                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">ID: {s.id}</p>
                  </div>
                </button>
              )) : (
                <div className="text-center py-10">
                  <AlertCircle size={24} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-[9px] font-black text-slate-300 uppercase">No pupils found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Report Entry Form */}
        <div className="lg:col-span-3">
          {activePupilId && editingReport ? (
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-femac-900 text-femac-yellow px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{activeType}</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Master Report Node</span>
                  </div>
                  <h3 className="text-3xl font-black text-femac-900 uppercase tracking-tighter">
                    {students.find(s => s.id === activePupilId)?.firstName} {students.find(s => s.id === activePupilId)?.lastName}
                  </h3>
                </div>
                <div className="flex gap-3">
                  {editingReport.status === GradeStatus.DRAFT && (
                    <>
                      <button onClick={handleSaveReport} className="bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center">
                        <Save size={16} className="mr-2" /> Save Draft
                      </button>
                      <button onClick={handleSubmitReport} className="bg-femac-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-xl flex items-center group">
                        <Send size={16} className="mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Submit Individual
                      </button>
                    </>
                  )}
                  {editingReport.status !== GradeStatus.DRAFT && (
                    <div className="bg-green-50 text-green-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-green-100 flex items-center">
                      <Lock size={16} className="mr-2" /> {editingReport.status === GradeStatus.SUBMITTED ? 'Awaiting Verification' : 'Finalized Registry'}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Matrix */}
              <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden mb-12">
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-slate-100">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-8 py-5">Subject Area</th>
                      <th className="px-8 py-5 text-center">Score (0-100)</th>
                      <th className="px-8 py-5 text-center">Percentage</th>
                      <th className="px-8 py-5 text-right">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editingReport.subjects?.map((sub, idx) => (
                      <tr key={idx} className="group hover:bg-white transition-colors">
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-femac-900 uppercase tracking-tight">{sub.subjectName}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <input 
                            disabled={editingReport.status !== GradeStatus.DRAFT}
                            type="number" 
                            min="0" max="100"
                            value={sub.score}
                            onChange={(e) => handleSubjectScoreChange(idx, parseInt(e.target.value) || 0)}
                            className="w-20 p-3 bg-white border-2 border-slate-100 rounded-xl font-mono font-black text-center focus:border-femac-yellow outline-none disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`font-black text-sm ${sub.percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                            {sub.percentage}%
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sub.grade}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-femac-900 text-white">
                    <tr className="font-black uppercase tracking-tighter">
                      <td className="px-8 py-8 text-lg">Overall Performance Node</td>
                      <td className="px-8 py-8 text-center text-2xl text-femac-yellow">{editingReport.totalScore}</td>
                      <td className="px-8 py-8 text-center text-2xl">{editingReport.overallPercentage}%</td>
                      <td className="px-8 py-8 text-right text-lg">{editingReport.overallGrade}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Comments Node */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 flex items-center">
                  <FileText size={14} className="mr-2 text-femac-yellow" /> Official Teacher's Registry Comment
                </label>
                <textarea 
                  disabled={editingReport.status !== GradeStatus.DRAFT}
                  rows={4}
                  value={editingReport.teacherComment}
                  onChange={(e) => setEditingReport({...editingReport, teacherComment: e.target.value})}
                  placeholder="Enter specific behavioral and academic observations for this evaluation period..."
                  className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none font-medium text-slate-700 focus:border-femac-yellow transition-all resize-none"
                />
              </div>

              <div className="mt-12 flex items-start space-x-4 p-8 bg-femac-50 rounded-[2rem] border border-femac-100">
                <ShieldCheck size={28} className="text-femac-900 shrink-0 mt-1" />
                <div>
                  <h5 className="text-[11px] font-black text-femac-900 uppercase tracking-widest mb-1">Validation Note</h5>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                    This report compiles scores for all core subjects. Submission locks the registry entry to prevent tampering and initiates the Exam Office validation workflow.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center py-40 text-center px-10">
              <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mb-8">
                <Users size={48} />
              </div>
              <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Select a Pupil to Begin Reporting</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-sm">
                Identify a candidate from the registry to initialize their End-of-Term or Mid-Term master report for Grade {activeGrade}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
