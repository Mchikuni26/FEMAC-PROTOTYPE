import { UserRole, GradeStatus, User, Student, ClassSubject, Assignment, GradeRecord, FeeTransaction } from './types';

// --- MOCK USERS ---
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Mr. Banda', username: 'teacher', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 'u2', name: 'Mrs. Phiri', username: 'exams', role: UserRole.EXAMS_OFFICE, avatar: 'https://picsum.photos/100/100?random=2' },
  { id: 'u3', name: 'Purity Lemba', username: 'purity', role: UserRole.PUPIL, avatar: 'https://picsum.photos/100/100?random=3' },
  { id: 'u4', name: 'Mr. Lemba', username: 'parent', role: UserRole.PARENT, avatar: 'https://picsum.photos/100/100?random=4' },
  { id: 'u5', name: 'Principal Musonda', username: 'head', role: UserRole.HEADMASTER, avatar: 'https://picsum.photos/100/100?random=5' },
];

// --- MOCK STUDENTS ---
export const MOCK_STUDENTS: Student[] = [
  { id: 's1', firstName: 'Purity', lastName: 'Lemba', grade: 9, parentId: 'u4' },
  { id: 's2', firstName: 'John', lastName: 'Zulu', grade: 9, parentId: 'u99' },
  { id: 's3', firstName: 'Mary', lastName: 'Mwanza', grade: 9, parentId: 'u98' },
];

// --- MOCK CLASSES ---
export const MOCK_CLASSES: ClassSubject[] = [
  { id: 'c1', name: 'Integrated Science', gradeLevel: 9, teacherId: 'u1' },
  { id: 'c2', name: 'Mathematics', gradeLevel: 9, teacherId: 'u1' },
];

// --- MOCK ASSIGNMENTS ---
export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', classId: 'c1', title: 'Mid-Term Test', maxScore: 100, type: 'Test', date: '2023-10-15' },
  { id: 'a2', classId: 'c1', title: 'Lab Report: Photosynthesis', maxScore: 50, type: 'Homework', date: '2023-10-20' },
];

// --- MOCK GRADES (Initial State) ---
export const MOCK_GRADES: GradeRecord[] = [
  // Purity's grades
  { id: 'g1', assignmentId: 'a1', studentId: 's1', score: 85, status: GradeStatus.DRAFT }, 
  { id: 'g2', assignmentId: 'a2', studentId: 's1', score: 42, status: GradeStatus.DRAFT },
  // John's grades
  { id: 'g3', assignmentId: 'a1', studentId: 's2', score: 60, status: GradeStatus.DRAFT },
  { id: 'g4', assignmentId: 'a2', studentId: 's2', score: 35, status: GradeStatus.DRAFT },
];

// --- MOCK FEES ---
export const MOCK_FEES: FeeTransaction[] = [
  { id: 'f1', studentId: 's1', date: '2023-09-01', description: 'Term 3 Tuition Fees', amount: 1500, type: 'BILL' },
  { id: 'f2', studentId: 's1', date: '2023-09-01', description: 'PTA Fund', amount: 200, type: 'BILL' },
  { id: 'f3', studentId: 's1', date: '2023-09-05', description: 'Mobile Money Pmt - TXN882', amount: -1000, type: 'PAYMENT' },
];