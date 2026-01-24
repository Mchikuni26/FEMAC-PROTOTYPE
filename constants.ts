import { UserRole, GradeStatus, User, Student, ClassSubject, Assignment, GradeRecord, FeeTransaction } from './types';

// --- MOCK USERS ---
export const MOCK_USERS: User[] = [
  { id: 'U-TEA-G1', name: 'GRADE 1 TEACHER', username: 'teacher1', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=21' },
  { id: 'U-TEA-G2', name: 'GRADE 2 TEACHER', username: 'teacher2', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=22' },
  { id: 'U-TEA-G3', name: 'GRADE 3 TEACHER', username: 'teacher3', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=23' },
  { id: 'U-TEA-G4', name: 'GRADE 4 TEACHER', username: 'teacher4', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=24' },
  { id: 'U-TEA-G5', name: 'GRADE 5 TEACHER', username: 'teacher5', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=25' },
  { id: 'U-TEA-G6', name: 'GRADE 6 TEACHER', username: 'teacher6', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=26' },
  { id: 'U-TEA-G7', name: 'GRADE 7 TEACHER', username: 'teacher7', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=11' },
  { id: 'U-TEA-F1', name: 'FORM ONE TEACHER', username: 'form1', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=12' },
  { id: 'U-TEA-G9', name: 'GRADE 9 TEACHER', username: 'teacher9', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 'U-TEA-G10', name: 'GRADE 10 TEACHER', username: 'teacher10', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=13' },
  { id: 'U-EXA-001', name: 'EXAMS OFFICE', username: 'exams', role: UserRole.EXAMS_OFFICE, avatar: 'https://picsum.photos/100/100?random=2' },
  { id: 'U-PUP-001', name: 'STUDENT PORTAL', username: 'purity', role: UserRole.PUPIL, avatar: 'https://picsum.photos/100/100?random=3' },
  { id: 'U-PAR-001', name: 'PARENT PORTAL', username: 'parent', role: UserRole.PARENT, avatar: 'https://picsum.photos/100/100?random=4' },
  { id: 'U-EXE-001', name: 'EXECUTIVE HUB', username: 'head', role: UserRole.EXECUTIVE_ACCOUNTS, avatar: 'https://picsum.photos/100/100?random=5' },
];

// --- MOCK STUDENTS ---
export const MOCK_STUDENTS: Student[] = [
  { id: 'S-2026-001', firstName: 'PUPIL', lastName: '001', grade: 9, parentId: 'U-PAR-001' },
  { id: 'S-2026-002', firstName: 'PUPIL', lastName: '002', grade: 9, parentId: 'U-PAR-999' },
  { id: 'S-2026-004', firstName: 'PUPIL', lastName: '004', grade: 7, parentId: 'U-PAR-001' },
  { id: 'S-2026-005', firstName: 'PUPIL', lastName: '005', grade: 1, parentId: 'U-PAR-001' },
  { id: 'S-2026-008', firstName: 'PUPIL', lastName: '008', grade: 8, parentId: 'U-PAR-001' },
];

// --- MOCK CLASSES ---
export const MOCK_CLASSES: ClassSubject[] = [
  { id: 'c-g1-1', name: 'Literacy', gradeLevel: 1, teacherId: 'U-TEA-G1' },
  { id: 'c-g2-1', name: 'Numeracy', gradeLevel: 2, teacherId: 'U-TEA-G2' },
  { id: 'c-g3-1', name: 'Creative Arts', gradeLevel: 3, teacherId: 'U-TEA-G3' },
  { id: 'c-g4-1', name: 'Integrated Science', gradeLevel: 4, teacherId: 'U-TEA-G4' },
  { id: 'c-g5-1', name: 'Social Studies', gradeLevel: 5, teacherId: 'U-TEA-G5' },
  { id: 'c-g6-1', name: 'Technology', gradeLevel: 6, teacherId: 'U-TEA-G6' },
  { id: 'c-g7-1', name: 'Mathematics', gradeLevel: 7, teacherId: 'U-TEA-G7' },
  { id: 'c-g7-2', name: 'Social Studies', gradeLevel: 7, teacherId: 'U-TEA-G7' },
  { id: 'c-f1-1', name: 'English Language', gradeLevel: 8, teacherId: 'U-TEA-F1' },
  { id: 'c-g9-1', name: 'Integrated Science', gradeLevel: 9, teacherId: 'U-TEA-G9' },
  { id: 'c-g10-1', name: 'Biology', gradeLevel: 10, teacherId: 'U-TEA-G10' },
];

// --- MOCK ASSIGNMENTS ---
export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', classId: 'c-g9-1', title: 'Mid-Term Test', maxScore: 100, type: 'Test', date: '2026-10-15' },
  { id: 'a3', classId: 'c-g7-1', title: 'Fractions Mastery', maxScore: 50, type: 'Test', date: '2026-11-01' },
  { id: 'a4', classId: 'c-g10-1', title: 'Cell Structure Exam', maxScore: 100, type: 'Exam', date: '2026-11-05' },
  { id: 'a5', classId: 'c-g1-1', title: 'Phonics Assessment', maxScore: 20, type: 'Test', date: '2026-11-10' },
  { id: 'a6', classId: 'c-f1-1', title: 'Grammar Quiz', maxScore: 40, type: 'Test', date: '2026-11-12' },
];

// --- MOCK GRADES ---
export const MOCK_GRADES: GradeRecord[] = [
  { id: 'g1', assignmentId: 'a1', studentId: 'S-2026-001', score: 85, status: GradeStatus.PUBLISHED, comment: "High proficiency demonstrated." }, 
  { id: 'g5', assignmentId: 'a3', studentId: 'S-2026-004', score: 45, status: GradeStatus.DRAFT },
  { id: 'g6', assignmentId: 'a5', studentId: 'S-2026-005', score: 18, status: GradeStatus.DRAFT },
  { id: 'g7', assignmentId: 'a6', studentId: 'S-2026-008', score: 32, status: GradeStatus.DRAFT },
];

// --- MOCK FEES ---
export const MOCK_FEES: FeeTransaction[] = [
  { id: 'f1', studentId: 'S-2026-001', date: '2026-09-01', description: 'Term 3 Tuition Fees', amount: 1500, type: 'BILL' },
  { id: 'f3', studentId: 'S-2026-001', date: '2026-09-05', description: 'Internal Registry Pmt', amount: -1000, type: 'PAYMENT' },
];