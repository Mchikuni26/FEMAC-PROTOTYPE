export enum UserRole {
  PUPIL = 'PUPIL',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  EXAMS_OFFICE = 'EXAMS_OFFICE',
  REGISTRAR = 'REGISTRAR',
  HEADMASTER = 'HEADMASTER'
}

export enum GradeStatus {
  DRAFT = 'DRAFT',        // Editable by Teacher
  SUBMITTED = 'SUBMITTED', // Locked for Teacher, Visible to Exams
  APPROVED = 'APPROVED',   // Approved by Exams (Internal)
  PUBLISHED = 'PUBLISHED'  // Visible to Parents/Pupils
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: number; // 1-12
  parentId: string;
}

export interface ClassSubject {
  id: string;
  name: string;
  gradeLevel: number;
  teacherId: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  maxScore: number;
  type: 'Test' | 'Exam' | 'Homework';
  date: string;
}

export interface GradeRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number;
  status: GradeStatus;
  comment?: string;
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  date: string;
  description: string;
  amount: number; // Positive for Bill, Negative for Payment
  type: 'BILL' | 'PAYMENT';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}