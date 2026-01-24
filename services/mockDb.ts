import { GradeRecord, GradeStatus, Assignment, FeeTransaction, Student } from '../types';
import { MOCK_GRADES, MOCK_ASSIGNMENTS, MOCK_FEES, MOCK_STUDENTS } from '../constants';

// Simple in-memory store for prototype
let gradesStore = [...MOCK_GRADES];
let assignmentsStore = [...MOCK_ASSIGNMENTS];
let feesStore = [...MOCK_FEES];
let studentsStore = [...MOCK_STUDENTS];

export const MockDB = {
  // Students
  getStudents: () => [...studentsStore],
  
  createStudent: (firstName: string, lastName: string, grade: number, parentId: string) => {
    const id = `S-2026-${String(studentsStore.length + 1).padStart(3, '0')}`;
    const newStudent: Student = { id, firstName, lastName, grade, parentId };
    studentsStore.push(newStudent);
    
    // Auto-generate an initial billing record for the new applicant
    const feeAmount = grade <= 7 ? 3500 : (grade <= 9 ? 4800 : 6200);
    feesStore.push({
      id: `f-init-${id}`,
      studentId: id,
      date: new Date().toISOString().split('T')[0],
      description: 'Initial Admission & Term 1 Fees',
      amount: feeAmount,
      type: 'BILL'
    });
    
    return newStudent;
  },

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