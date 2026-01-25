
import { UserRole, StaffMember, Student, ClassSubject, Assignment, GradeRecord, FeeTransaction, ApplicationStatus, TimetableSlot, SchoolMaterial, GradeStatus } from './types';

export const MOCK_USERS: any[] = [
  { id: 'U-TEA-G1', name: 'GRADE 1 TEACHER', username: 'teacher1', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=21' },
  { id: 'U-TEA-G2', name: 'GRADE 2 TEACHER', username: 'teacher2', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=22' },
  { id: 'U-TEA-G3', name: 'GRADE 3 TEACHER', username: 'teacher3', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=23' },
  { id: 'U-TEA-G4', name: 'GRADE 4 TEACHER', username: 'teacher4', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=24' },
  { id: 'U-TEA-G5', name: 'GRADE 5 TEACHER', username: 'teacher5', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=25' },
  { id: 'U-TEA-G6', name: 'GRADE 6 TEACHER', username: 'teacher6', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=26' },
  { id: 'U-TEA-G7', name: 'GRADE 7 TEACHER', username: 'teacher7', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=27' },
  { id: 'U-TEA-F1', name: 'FORM ONE TEACHER', username: 'teacherf1', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=28' },
  { id: 'U-TEA-G9', name: 'GRADE 9 TEACHER', username: 'teacher9', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 'U-EXA-001', name: 'EXAMS OFFICE', username: 'exams', role: UserRole.EXAMS_OFFICE, avatar: 'https://picsum.photos/100/100?random=2' },
  { id: 'U-PUP-001', name: 'STUDENT PORTAL', username: 'purity', role: UserRole.PUPIL, avatar: 'https://picsum.photos/100/100?random=3' },
  { id: 'U-PAR-001', name: 'PARENT PORTAL', username: 'parent', role: UserRole.PARENT, avatar: 'https://picsum.photos/100/100?random=4' },
  { id: 'U-EXE-001', name: 'EXECUTIVE HUB', username: 'head', role: UserRole.EXECUTIVE_ACCOUNTS, avatar: 'https://picsum.photos/100/100?random=5' },
];

export const MOCK_STAFF: StaffMember[] = [
  { id: 'U-TEA-G1', name: 'Mrs. Chanda Mulenga', username: 'teacher1', role: UserRole.TEACHER, duties: 'Grade 1 Lead Teacher & Literacy Coordinator', salary: 8500, contractStatus: 'ACTIVE', contractExpiryDate: '2026-01-10', assignedGrade: 1, hireDate: '2022-01-10' },
  { id: 'U-TEA-G2', name: 'Mr. John Banda', username: 'teacher2', role: UserRole.TEACHER, duties: 'Grade 2 Teacher & Sports Master', salary: 8200, contractStatus: 'ACTIVE', contractExpiryDate: '2026-05-15', assignedGrade: 2, hireDate: '2023-05-15' },
  { id: 'U-TEA-G3', name: 'Ms. Alice Zulu', username: 'teacher3', role: UserRole.TEACHER, duties: 'Grade 3 Teacher & Music Club Patron', salary: 8400, contractStatus: 'ACTIVE', contractExpiryDate: '2025-09-20', assignedGrade: 3, hireDate: '2021-09-20' },
  { id: 'U-TEA-G4', name: 'Mr. Peter Phiri', username: 'teacher4', role: UserRole.TEACHER, duties: 'Grade 4 Lead & Science Dept Assistant', salary: 8600, contractStatus: 'EXPIRED', contractExpiryDate: '2024-01-05', assignedGrade: 4, hireDate: '2019-01-05' },
  { id: 'U-TEA-G5', name: 'Mrs. Sarah Musonda', username: 'teacher5', role: UserRole.TEACHER, duties: 'Grade 5 Teacher & Guidance Counselor', salary: 9000, contractStatus: 'ACTIVE', contractExpiryDate: '2026-02-14', assignedGrade: 5, hireDate: '2020-02-14' },
  { id: 'U-EXA-001', name: 'Mr. Kelvin Mwamba', username: 'exams', role: UserRole.EXAMS_OFFICE, duties: 'Head of Exams & Academic Records', salary: 12500, contractStatus: 'ACTIVE', contractExpiryDate: '2026-06-01', hireDate: '2018-06-01' },
  { id: 'U-EXE-001', name: 'Dr. Malama Chikuni', username: 'head', role: UserRole.EXECUTIVE_ACCOUNTS, duties: 'Executive Director & CFO', salary: 25000, contractStatus: 'ACTIVE', contractExpiryDate: '2027-01-01', hireDate: '2015-01-01' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 'S-2026-001', firstName: 'PUPIL', lastName: '001', grade: 9, parentId: 'U-PAR-001', applicationStatus: ApplicationStatus.ACCEPTED, resultsUnlocked: false },
  { id: 'S-2026-004', firstName: 'PUPIL', lastName: '004', grade: 7, parentId: 'U-PAR-001', applicationStatus: ApplicationStatus.ACCEPTED, resultsUnlocked: false },
  { id: 'S-2026-008', firstName: 'PUPIL', lastName: '008', grade: 8, parentId: 'U-PAR-001', applicationStatus: ApplicationStatus.ACCEPTED, resultsUnlocked: false },
];

export const MOCK_MATERIALS: SchoolMaterial[] = [
  { id: 'm1', title: 'Official Academic Calendar 2026', category: 'CALENDAR', fileType: 'PDF', date: '2026-01-05', size: '1.2 MB' },
  { id: 'm2', title: 'FEMAC Code of Conduct & Rules', category: 'RULES', fileType: 'PDF', date: '2025-12-15', size: '850 KB' },
  { id: 'm3', title: 'Grade 9 Mathematics Holiday Packet', category: 'HOMEWORK', fileType: 'PDF', date: '2026-04-10', size: '2.4 MB' },
  { id: 'm4', title: 'Grade 7 Integrated Science Project', category: 'HOMEWORK', fileType: 'DOCX', date: '2026-04-12', size: '1.1 MB' },
  { id: 'm5', title: 'Yearly Sports & Cultural Schedule', category: 'ACTIVITIES', fileType: 'PDF', date: '2026-01-10', size: '3.5 MB' },
];

export const TIMETABLE_SCHEDULE: TimetableSlot[] = [
  { time: '08:00 - 09:00', label: 'Period 1', type: 'LESSON', subjectsByDay: { Monday: 'Mathematics', Tuesday: 'English', Wednesday: 'Science', Thursday: 'History', Friday: 'ICT' } },
  { time: '09:00 - 10:00', label: 'Period 2', type: 'LESSON', subjectsByDay: { Monday: 'Mathematics', Tuesday: 'Social Studies', Wednesday: 'English', Thursday: 'Business Studies', Friday: 'Mathematics' } },
  { time: '10:00 - 10:30', label: 'Short Period', type: 'LESSON', subjectsByDay: { Monday: 'Reading', Tuesday: 'Library', Wednesday: 'Quiz', Thursday: 'Circle Time', Friday: 'Debate' } },
  { time: '10:30 - 11:00', label: 'Morning Break', type: 'BREAK', subjectsByDay: {} },
  { time: '11:00 - 12:00', label: 'Period 3', type: 'LESSON', subjectsByDay: { Monday: 'Geography', Tuesday: 'Biology', Wednesday: 'Mathematics', Thursday: 'Home Economics', Friday: 'Geography' } },
  { time: '12:00 - 13:00', label: 'Period 4', type: 'LESSON', subjectsByDay: { Monday: 'Civics', Tuesday: 'French', Wednesday: 'Religious Edu', Thursday: 'Physical Edu', Friday: 'Art' } },
  { time: '13:00 - 14:00', label: 'Lunch Break', type: 'LUNCH', subjectsByDay: {} },
  { time: '14:00 - 15:00', label: 'Period 5', type: 'LESSON', subjectsByDay: { Monday: 'Physics', Tuesday: 'Chemistry', Wednesday: 'Practical', Thursday: 'English', Friday: 'Study Hall' } },
  { time: '15:00 - 16:00', label: 'Period 6', type: 'LESSON', subjectsByDay: { Monday: 'Club Activities', Tuesday: 'Sports', Wednesday: 'Clubs', Thursday: 'Sports', Friday: 'Counselling' } },
];

export const MOCK_CLASSES: ClassSubject[] = [
  { id: 'c-g1-all', name: 'Grade 1 Composite', gradeLevel: 1, teacherId: 'U-TEA-G1' },
  { id: 'c-g2-all', name: 'Grade 2 Composite', gradeLevel: 2, teacherId: 'U-TEA-G2' },
  { id: 'c-g3-all', name: 'Grade 3 Composite', gradeLevel: 3, teacherId: 'U-TEA-G3' },
  { id: 'c-g4-all', name: 'Grade 4 Composite', gradeLevel: 4, teacherId: 'U-TEA-G4' },
  { id: 'c-g5-all', name: 'Grade 5 Composite', gradeLevel: 5, teacherId: 'U-TEA-G5' },
  { id: 'c-g6-all', name: 'Grade 6 Composite', gradeLevel: 6, teacherId: 'U-TEA-G6' },
  { id: 'c-g7-all', name: 'Grade 7 Composite', gradeLevel: 7, teacherId: 'U-TEA-G7' },
  { id: 'c-f1-all', name: 'Form One General', gradeLevel: 8, teacherId: 'U-TEA-F1' },
  { id: 'c-g9-eng', name: 'English Language', gradeLevel: 9, teacherId: 'U-TEA-G9' },
  { id: 'c-g9-mat', name: 'Mathematics', gradeLevel: 9, teacherId: 'U-TEA-G9' },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', classId: 'c-g9-eng', title: 'Creative Writing Unit 1', maxScore: 20, type: 'Mid-week Assessment', date: '2026-09-15' },
  { id: 'a2', classId: 'c-g7-all', title: 'Science Project 1', maxScore: 50, type: 'Mid-week Assessment', date: '2026-09-20' },
  { id: 'a3', classId: 'c-f1-all', title: 'Introductory Algebra', maxScore: 100, type: 'Mid-Term', date: '2026-10-15' },
];

export const MOCK_GRADES: GradeRecord[] = [
  { id: 'g1', assignmentId: 'a1', studentId: 'S-2026-001', score: 18, status: GradeStatus.DRAFT }, 
  { id: 'g2', assignmentId: 'a2', studentId: 'S-2026-004', score: 42, status: GradeStatus.DRAFT },
  { id: 'g3', assignmentId: 'a3', studentId: 'S-2026-008', score: 85, status: GradeStatus.PUBLISHED },
];

export const MOCK_FEES: FeeTransaction[] = [
  { id: 'f1', studentId: 'S-2026-001', date: '2026-09-01', description: 'Term 3 Tuition Fees', amount: 1500, type: 'BILL' },
  { id: 'f2', studentId: 'S-2026-008', date: '2026-09-01', description: 'Form One Tuition', amount: 4800, type: 'BILL' },
];
