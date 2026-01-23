import { GradeRecord, GradeStatus, Assignment, FeeTransaction } from '../types';
import { MOCK_GRADES, MOCK_ASSIGNMENTS, MOCK_FEES } from '../constants';

// Simple in-memory store for prototype
let gradesStore = [...MOCK_GRADES];
let assignmentsStore = [...MOCK_ASSIGNMENTS];
let feesStore = [...MOCK_FEES];

export const MockDB = {
  // Grades
  getGradesByClass: (classId: string) => {
    const assignments = assignmentsStore.filter(a => a.classId === classId).map(a => a.id);
    return gradesStore.filter(g => assignments.includes(g.assignmentId));
  },

  getGradesByStudent: (studentId: string) => {
    return gradesStore.filter(g => g.studentId === studentId);
  },

  updateGrade: (gradeId: string, score: number) => {
    const idx = gradesStore.findIndex(g => g.id === gradeId);
    if (idx !== -1) {
      gradesStore[idx] = { ...gradesStore[idx], score };
    }
  },

  // Maker-Checker Logic
  updateGradeStatusBatch: (assignmentId: string, newStatus: GradeStatus) => {
    gradesStore = gradesStore.map(g => {
      if (g.assignmentId === assignmentId) {
        return { ...g, status: newStatus };
      }
      return g;
    });
  },

  // Assignments
  createAssignment: (classId: string, title: string, maxScore: number) => {
    const newId = `a${Date.now()}`;
    const newAssignment: Assignment = {
      id: newId,
      classId,
      title,
      maxScore,
      type: 'Test',
      date: new Date().toISOString().split('T')[0]
    };
    assignmentsStore.push(newAssignment);
    return newAssignment;
  },

  // Fees
  getFeesByStudent: (studentId: string) => {
    return feesStore.filter(f => f.studentId === studentId);
  },

  makePayment: (studentId: string, amount: number) => {
    const newTxn: FeeTransaction = {
      id: `txn${Date.now()}`,
      studentId,
      date: new Date().toISOString().split('T')[0],
      description: 'Mobile Money Payment (Simulated)',
      amount: -amount,
      type: 'PAYMENT'
    };
    feesStore.push(newTxn);
    return newTxn;
  }
};