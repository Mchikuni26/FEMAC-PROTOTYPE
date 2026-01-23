import React, { useState, useEffect } from 'react';
import { MOCK_STUDENTS, MOCK_ASSIGNMENTS } from '../constants';
import { MockDB } from '../services/mockDb';
import { GradeRecord, GradeStatus, FeeTransaction } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, Download, AlertTriangle, CreditCard } from 'lucide-react';

export const ParentPortal: React.FC = () => {
  const student = MOCK_STUDENTS[0]; // Purity Lemba
  const [fees, setFees] = useState<FeeTransaction[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    setFees(MockDB.getFeesByStudent(student.id));
    // ONLY fetch published grades for parents
    const allGrades = MockDB.getGradesByStudent(student.id);
    setGrades(allGrades.filter(g => g.status === GradeStatus.PUBLISHED));
  }, [student.id]);

  const balance = fees.reduce((acc, curr) => acc + curr.amount, 0);

  const handlePayment = () => {
    MockDB.makePayment(student.id, balance); // Pay full balance
    setFees(MockDB.getFeesByStudent(student.id));
    setShowPayModal(false);
    alert("Payment Successful via Mobile Money Mock!");
  };

  // Prepare Chart Data
  const chartData = grades.map(g => {
    const assignment = MOCK_ASSIGNMENTS.find(a => a.id === g.assignmentId);
    return {
      name: assignment?.title.substring(0, 10) + '...',
      score: g.score,
      max: assignment?.maxScore
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-femac-900 to-femac-700 p-6 rounded-xl text-white shadow-lg">
        <h2 className="text-2xl font-bold">Welcome, Mr. Lemba</h2>
        <p className="opacity-80">Parent Portal for {student.firstName} {student.lastName} (Grade {student.grade})</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financials */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-femac-900 flex items-center">
                <DollarSign className="mr-2" size={20}/> Fee Ledger
             </h3>
             <span className={`text-xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
               ZMW {balance.toLocaleString()}
             </span>
          </div>

          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {fees.map(fee => (
                <div key={fee.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded">
                    <div>
                        <p className="font-semibold text-slate-700">{fee.description}</p>
                        <p className="text-xs text-slate-500">{fee.date}</p>
                    </div>
                    <span className={fee.type === 'BILL' ? 'text-slate-800' : 'text-green-600'}>
                        {fee.type === 'BILL' ? '+' : '-'} {Math.abs(fee.amount).toLocaleString()}
                    </span>
                </div>
            ))}
          </div>

          {balance > 0 ? (
            <button 
              onClick={() => setShowPayModal(true)}
              className="w-full bg-femac-600 hover:bg-femac-700 text-white py-3 rounded-md font-semibold flex justify-center items-center transition-colors"
            >
                <CreditCard className="mr-2" size={18} /> Pay Balance Now
            </button>
          ) : (
            <div className="w-full bg-green-50 text-green-700 py-3 rounded-md font-semibold text-center border border-green-200">
                Fees Up To Date
            </div>
          )}
        </div>

        {/* Academics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-femac-900">Performance Overview</h3>
             <button className="text-blue-600 hover:underline text-sm flex items-center">
                <Download size={14} className="mr-1"/> Report Card
             </button>
          </div>

          {grades.length > 0 ? (
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#243b53" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          ) : (
              <div className="h-64 w-full flex flex-col justify-center items-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <AlertTriangle size={32} className="mb-2"/>
                  <p>No results published yet.</p>
              </div>
          )}
        </div>
      </div>

      {/* Mock Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4">Confirm Payment</h3>
                <p className="text-slate-600 mb-6">
                    You are about to pay <span className="font-bold">ZMW {balance.toLocaleString()}</span> via Mobile Money Integration.
                </p>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => setShowPayModal(false)}
                        className="flex-1 py-2 px-4 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handlePayment}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded font-bold"
                    >
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};