import React from 'react';
import { Clock, FileText, Calendar } from 'lucide-react';

export const StudentPortal: React.FC = () => {
    const timetable = [
        { time: '07:30 - 08:30', subject: 'Mathematics', room: 'Class 9A' },
        { time: '08:30 - 09:30', subject: 'Integrated Science', room: 'Lab 2' },
        { time: '09:30 - 10:00', subject: 'Break', room: '-' },
        { time: '10:00 - 11:00', subject: 'English', room: 'Class 9A' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-femac-900">Student Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timetable */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-femac-800 text-white p-4 flex items-center">
                        <Clock className="mr-2" /> <h3 className="font-bold">Today's Timetable</h3>
                    </div>
                    <div className="p-0">
                        {timetable.map((slot, idx) => (
                            <div key={idx} className="flex border-b last:border-0 p-4 hover:bg-slate-50">
                                <div className="w-32 font-mono text-sm text-slate-500">{slot.time}</div>
                                <div>
                                    <div className="font-bold text-slate-800">{slot.subject}</div>
                                    <div className="text-xs text-slate-500">{slot.room}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Downloads */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center mb-4 text-femac-800">
                        <FileText className="mr-2" /> <h3 className="font-bold text-lg">My Materials</h3>
                    </div>
                    <div className="space-y-3">
                         {['Science Lab Manual.pdf', 'Math Homework Set 3.docx', 'School Rules 2024.pdf'].map((file, i) => (
                             <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                                 <span className="text-sm text-slate-700">{file}</span>
                                 <button className="text-blue-600 text-xs font-semibold hover:underline">Download</button>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    );
};