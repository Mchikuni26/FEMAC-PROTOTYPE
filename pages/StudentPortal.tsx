import React, { useState } from 'react';
import { 
  Clock, FileText, Calendar, Download, ChevronRight, BookOpen, 
  MapPin, User, Star, DownloadCloud, AlertCircle, Coffee, Utensils,
  Book, FileCheck, Info, Sparkles, GraduationCap, Printer, Layout
} from 'lucide-react';
import { TIMETABLE_SCHEDULE, MOCK_MATERIALS } from '../constants.ts';

export const StudentPortal: React.FC = () => {
    const [selectedGrade, setSelectedGrade] = useState(9);
    const [activeTab, setActiveTab] = useState<'timetable' | 'materials'>('timetable');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    const getGradeSpecificSubject = (baseSubject: string, grade: number) => {
        if (baseSubject === '' || !baseSubject) return null;

        if (grade <= 7) {
            const primaryMap: Record<string, string> = {
                'Mathematics': 'Numeracy & Shapes',
                'Science': 'Environmental Science',
                'English': 'Literacy & Phonics',
                'ICT': 'Computer Basics',
                'Geography': 'Social Studies',
                'Biology': 'Nature Study',
                'History': 'Storytelling',
                'Physics': 'Creative Arts',
                'Chemistry': 'Home Economics'
            };
            return primaryMap[baseSubject] || baseSubject;
        } 
        else if (grade <= 9) {
            const juniorMap: Record<string, string> = {
                'Science': 'Integrated Science',
                'Physics': 'Civics',
                'Chemistry': 'Office Practice',
                'Biology': 'Agricultural Science'
            };
            return juniorMap[baseSubject] || baseSubject;
        }
        else {
            const seniorMap: Record<string, string> = {
                'Science': 'Pure Physics',
                'Mathematics': 'Additional Mathematics',
                'Social Studies': 'Commerce',
                'Reading': 'Literature in English',
                'Quiz': 'Pure Chemistry'
            };
            return seniorMap[baseSubject] || baseSubject;
        }
    };

    const getMaterialIcon = (category: string) => {
        switch (category) {
            case 'CALENDAR': return <Calendar size={20} className="text-blue-500" />;
            case 'RULES': return <FileCheck size={20} className="text-amber-500" />;
            case 'HOMEWORK': return <BookOpen size={20} className="text-purple-500" />;
            case 'ACTIVITIES': return <Sparkles size={20} className="text-green-500" />;
            default: return <FileText size={20} className="text-slate-500" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="bg-femac-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-femac-yellow opacity-10 rounded-full blur-3xl"></div>
                <div className="flex items-center space-x-6 relative z-10">
                    <div className="w-24 h-24 bg-femac-yellow rounded-[2.5rem] flex items-center justify-center text-femac-900 font-black text-3xl shadow-xl">
                        PC
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Student Center</h2>
                        <p className="text-femac-300 font-black uppercase tracking-[0.3em] text-[11px] mt-2">Academic Year 2026 Registry</p>
                        <div className="flex items-center space-x-4 mt-4">
                            <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Grade {selectedGrade} Registry Node</span>
                            <span className="bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">Active Enrollment</span>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
                    <button 
                        onClick={() => setActiveTab('timetable')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'timetable' ? 'bg-femac-yellow text-femac-900 shadow-lg' : 'text-femac-300 hover:text-white'}`}
                    >
                        Master Timetable
                    </button>
                    <button 
                        onClick={() => setActiveTab('materials')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'materials' ? 'bg-femac-yellow text-femac-900 shadow-lg' : 'text-femac-300 hover:text-white'}`}
                    >
                        Materials Hub
                    </button>
                </div>
            </div>

            {activeTab === 'timetable' ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-femac-900 rounded-xl text-femac-yellow">
                                <Layout size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-femac-900 uppercase tracking-tighter">Academic Schedule Registry</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Full Week Master Report View</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="flex-1 md:flex-none relative">
                                <select 
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
                                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-femac-900 font-black uppercase text-xs outline-none focus:border-femac-yellow shadow-sm appearance-none pr-10"
                                >
                                    {grades.map(g => <option key={g} value={g}>Grade {g} Level</option>)}
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                            </div>
                            <button className="flex items-center space-x-2 px-8 py-4 bg-femac-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-femac-yellow hover:text-femac-900 transition-all shadow-xl active:scale-95 group">
                                <Printer size={14} className="group-hover:scale-110 transition-transform" />
                                <span>Export Report</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-femac-900 text-white">
                                        <th className="p-8 text-left w-48 border-r border-white/5">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-femac-yellow">Time Slot</span>
                                        </th>
                                        {days.map(day => (
                                            <th key={day} className="p-8 text-center border-r border-white/5 last:border-0">
                                                <span className="text-[11px] font-black uppercase tracking-[0.4em]">{day}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {TIMETABLE_SCHEDULE.map((slot, idx) => {
                                        const isSpecial = slot.type !== 'LESSON';

                                        return (
                                            <tr 
                                                key={idx} 
                                                className={`${isSpecial ? 'bg-slate-50/80' : 'hover:bg-slate-50 transition-colors'}`}
                                            >
                                                <td className="p-8 border-r border-slate-50">
                                                    <p className="font-mono text-sm font-black text-femac-900 tracking-tighter leading-none">{slot.time}</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{slot.label}</p>
                                                </td>

                                                {isSpecial ? (
                                                    <td colSpan={5} className="p-8 text-center">
                                                        <div className={`flex items-center justify-center space-x-4 ${slot.type === 'BREAK' ? 'text-amber-600' : 'text-green-600'}`}>
                                                            {slot.type === 'BREAK' ? <Coffee size={18} /> : <Utensils size={18} />}
                                                            <span className="font-black uppercase tracking-[0.4em] text-xs">
                                                                Institutional {slot.label} — All Nodes Suspended
                                                            </span>
                                                        </div>
                                                    </td>
                                                ) : (
                                                    days.map(day => {
                                                        const baseSubject = slot.subjectsByDay[day];
                                                        const displaySubject = getGradeSpecificSubject(baseSubject, selectedGrade);
                                                        
                                                        return (
                                                            <td key={day} className="p-6 border-r border-slate-50 last:border-0 text-center align-middle">
                                                                {displaySubject ? (
                                                                    <div className="space-y-1">
                                                                        <p className="font-black text-femac-900 text-[11px] uppercase tracking-tight leading-tight">
                                                                            {displaySubject}
                                                                        </p>
                                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            Registry Verified
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">Unallocated</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                            <h3 className="text-2xl font-black text-femac-900 uppercase tracking-tight mb-6 flex items-center">
                                <DownloadCloud className="mr-3 text-femac-yellow" /> Materials Hub
                            </h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                Access grade-specific projects, holiday schedules, and institutional policies. All materials are synchronized with the 2026 Academic Registry.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Grade {selectedGrade} Files</p>
                                    <p className="text-2xl font-black text-femac-900">{MOCK_MATERIALS.length}</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Sync</p>
                                    <p className="text-sm font-black text-femac-yellow uppercase mt-1">Live Active</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-femac-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-femac-yellow opacity-10 blur-3xl group-hover:scale-150 transition-transform"></div>
                            <h4 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center">
                                <Info className="mr-3 text-femac-yellow" /> Registry Policy
                            </h4>
                            <p className="text-xs text-femac-200 leading-loose uppercase tracking-widest font-bold opacity-80 mb-6">
                                All schedules and materials are the intellectual property of FEMAC Academy. Unauthorized redistribution of registry files is monitored under Grade Node Protocol G-2026.
                            </p>
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-femac-yellow border-b border-femac-yellow pb-1 hover:text-white hover:border-white transition-colors">
                                View Terms & Conditions
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {MOCK_MATERIALS.map(material => (
                            <div key={material.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-femac-yellow transition-all flex items-center justify-between group">
                                <div className="flex items-center space-x-5">
                                    <div className="bg-slate-50 p-5 rounded-[1.5rem] group-hover:bg-femac-yellow/10 transition-colors">
                                        {getMaterialIcon(material.category)}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{material.fileType} • {material.size}</span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sync Date: {material.date}</span>
                                        </div>
                                        <h5 className="text-sm font-black text-femac-900 uppercase tracking-tight group-hover:text-femac-900 transition-colors">{material.title}</h5>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Resource Node</p>
                                    </div>
                                </div>
                                <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-femac-900 group-hover:text-white transition-all shadow-sm">
                                    <Download size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-slate-100 p-10 rounded-[3rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center space-x-5">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-femac-900"><GraduationCap size={32} /></div>
                    <div>
                        <p className="text-sm font-black text-femac-900 uppercase tracking-tight">Academic Integrity Assurance</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">This master report represents the current official academic schedule.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Zambia Educational Standard Compliant</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>Node Revision 2026.04.1</span>
                </div>
            </div>
        </div>
    );
};