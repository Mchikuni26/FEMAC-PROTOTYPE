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
  // Grade 1
  { id: 'c-g1-lit', name: 'Literacy', gradeLevel: 1, teacherId: 'U-TEA-G1' },
  { id: 'c-g1-num', name: 'Numeracy', gradeLevel: 1, teacherId: 'U-TEA-G1' },
  { id: 'c-g1-sci', name: 'Integrated Science', gradeLevel: 1, teacherId: 'U-TEA-G1' },
  { id: 'c-g1-soc', name: 'Social Studies', gradeLevel: 1, teacherId: 'U-TEA-G1' },
  { id: 'c-g1-art', name: 'Creative Arts', gradeLevel: 1, teacherId: 'U-TEA-G1' },

  // Grade 2
  { id: 'c-g2-lit', name: 'Literacy', gradeLevel: 2, teacherId: 'U-TEA-G2' },
  { id: 'c-g2-num', name: 'Numeracy', gradeLevel: 2, teacherId: 'U-TEA-G2' },
  { id: 'c-g2-sci', name: 'Integrated Science', gradeLevel: 2, teacherId: 'U-TEA-G2' },
  { id: 'c-g2-soc', name: 'Social Studies', gradeLevel: 2, teacherId: 'U-TEA-G2' },
  { id: 'c-g2-art', name: 'Creative Arts', gradeLevel: 2, teacherId: 'U-TEA-G2' },

  // Grade 3
  { id: 'c-g3-lit', name: 'Literacy', gradeLevel: 3, teacherId: 'U-TEA-G3' },
  { id: 'c-g3-num', name: 'Numeracy', gradeLevel: 3, teacherId: 'U-TEA-G3' },
  { id: 'c-g3-sci', name: 'Integrated Science', gradeLevel: 3, teacherId: 'U-TEA-G3' },
  { id: 'c-g3-soc', name: 'Social Studies', gradeLevel: 3, teacherId: 'U-TEA-G3' },
  { id: 'c-g3-art', name: 'Creative Arts', gradeLevel: 3, teacherId: 'U-TEA-G3' },

  // Grade 4
  { id: 'c-g4-lit', name: 'Literacy', gradeLevel: 4, teacherId: 'U-TEA-G4' },
  { id: 'c-g4-num', name: 'Numeracy', gradeLevel: 4, teacherId: 'U-TEA-G4' },
  { id: 'c-g4-sci', name: 'Integrated Science', gradeLevel: 4, teacherId: 'U-TEA-G4' },
  { id: 'c-g4-soc', name: 'Social Studies', gradeLevel: 4, teacherId: 'U-TEA-G4' },
  { id: 'c-g4-ict', name: 'Technology (ICT)', gradeLevel: 4, teacherId: 'U-TEA-G4' },

  // Grade 5
  { id: 'c-g5-lit', name: 'Literacy', gradeLevel: 5, teacherId: 'U-TEA-G5' },
  { id: 'c-g5-num', name: 'Numeracy', gradeLevel: 5, teacherId: 'U-TEA-G5' },
  { id: 'c-g5-sci', name: 'Integrated Science', gradeLevel: 5, teacherId: 'U-TEA-G5' },
  { id: 'c-g5-soc', name: 'Social Studies', gradeLevel: 5, teacherId: 'U-TEA-G5' },
  { id: 'c-g5-hec', name: 'Home Economics', gradeLevel: 5, teacherId: 'U-TEA-G5' },

  // Grade 6
  { id: 'c-g6-lit', name: 'Literacy', gradeLevel: 6, teacherId: 'U-TEA-G6' },
  { id: 'c-g6-num', name: 'Numeracy', gradeLevel: 6, teacherId: 'U-TEA-G6' },
  { id: 'c-g6-sci', name: 'Integrated Science', gradeLevel: 6, teacherId: 'U-TEA-G6' },
  { id: 'c-g6-soc', name: 'Social Studies', gradeLevel: 6, teacherId: 'U-TEA-G6' },
  { id: 'c-g6-ict', name: 'Technology (ICT)', gradeLevel: 6, teacherId: 'U-TEA-G6' },

  // Grade 7
  { id: 'c-g7-lit', name: 'Literacy', gradeLevel: 7, teacherId: 'U-TEA-G7' },
  { id: 'c-g7-num', name: 'Numeracy', gradeLevel: 7, teacherId: 'U-TEA-G7' },
  { id: 'c-g7-sci', name: 'Integrated Science', gradeLevel: 7, teacherId: 'U-TEA-G7' },
  { id: 'c-g7-soc', name: 'Social Studies', gradeLevel: 7, teacherId: 'U-TEA-G7' },
  { id: 'c-g7-cts', name: 'Creative Technology', gradeLevel: 7, teacherId: 'U-TEA-G7' },

  // Grade 8 (Form 1)
  { id: 'c-f1-eng', name: 'English Language', gradeLevel: 8, teacherId: 'U-TEA-F1' },
  { id: 'c-f1-mat', name: 'Mathematics', gradeLevel: 8, teacherId: 'U-TEA-F1' },
  { id: 'c-f1-sci', name: 'Integrated Science', gradeLevel: 8, teacherId: 'U-TEA-F1' },
  { id: 'c-f1-soc', name: 'Social Studies', gradeLevel: 8, teacherId: 'U-TEA-F1' },
  { id: 'c-f1-ict', name: 'Information Technology', gradeLevel: 8, teacherId: 'U-TEA-F1' },
  { id: 'c-f1-bus', name: 'Business Studies', gradeLevel: 8, teacherId: 'U-TEA-F1' },

  // Grade 9
  { id: 'c-g9-eng', name: 'English Language', gradeLevel: 9, teacherId: 'U-TEA-G9' },
  { id: 'c-g9-mat', name: 'Mathematics', gradeLevel: 9, teacherId: 'U-TEA-G9' },
  { id: 'c-g9-sci', name: 'Integrated Science', gradeLevel: 9, teacherId: 'U-TEA-G9' },
  { id: 'c-g9-soc', name: 'Social Studies', gradeLevel: 9, teacherId: 'U-TEA-G9' },
  { id: 'c-g9-ict', name: 'Information Technology', gradeLevel: 9, teacherId: 'U-TEA-G9' },
  { id: 'c-g9-bus', name: 'Business Studies', gradeLevel: 9, teacherId: 'U-TEA-G9' },

  // Grade 10
  { id: 'c-g10-eng', name: 'English Language', gradeLevel: 10, teacherId: 'U-TEA-G10' },
  { id: 'c-g10-mat', name: 'Mathematics', gradeLevel: 10, teacherId: 'U-TEA-G10' },
  { id: 'c-g10-bio', name: 'Biology', gradeLevel: 10, teacherId: 'U-TEA-G10' },
  { id: 'c-g10-che', name: 'Chemistry', gradeLevel: 10, teacherId: 'U-TEA-G10' },
  { id: 'c-g10-phy', name: 'Physics', gradeLevel: 10, teacherId: 'U-TEA-G10' },
  { id: 'c-g10-geo', name: 'Geography', gradeLevel: 10, teacherId: 'U-TEA-G10' },
  { id: 'c-g10-his', name: 'History', gradeLevel: 10, teacherId: 'U-TEA-G10' },
];

// --- MOCK ASSIGNMENTS ---
export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', classId: 'c-g9-eng', title: 'Mid-Term Test', maxScore: 100, type: 'Test', date: '2026-10-15' },
  { id: 'a3', classId: 'c-g7-num', title: 'Fractions Mastery', maxScore: 50, type: 'Test', date: '2026-11-01' },
  { id: 'a4', classId: 'c-g10-bio', title: 'Cell Structure Exam', maxScore: 100, type: 'Exam', date: '2026-11-05' },
  { id: 'a5', classId: 'c-g1-lit', title: 'Phonics Assessment', maxScore: 20, type: 'Test', date: '2026-11-10' },
  { id: 'a6', classId: 'c-f1-eng', title: 'Grammar Quiz', maxScore: 40, type: 'Test', date: '2026-11-12' },
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