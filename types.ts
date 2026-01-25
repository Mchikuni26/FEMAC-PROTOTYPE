
export enum UserRole {
  PUPIL = 'PUPIL',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  EXAMS_OFFICE = 'EXAMS_OFFICE',
  REGISTRAR = 'REGISTRAR',
  EXECUTIVE_ACCOUNTS = 'EXECUTIVE_ACCOUNTS'
}

export enum GradeStatus {
  DRAFT = 'DRAFT',        // Editable by Teacher
  SUBMITTED = 'SUBMITTED', // Locked for Teacher, Visible to Exams
  APPROVED = 'APPROVED',   // Approved by Exams (Internal)
  PUBLISHED = 'PUBLISHED'  // Visible to Parents/Pupils
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
}

export interface StaffMember extends User {
  duties: string;
  salary: number;
  contractStatus: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  contractExpiryDate: string;
  assignedGrade?: number;
  hireDate: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: number; // 1-12
  parentId: string;
  applicationStatus?: ApplicationStatus;
  resultsUnlocked?: boolean;
  dob?: string;
  gender?: string;
  previousSchool?: string;
  guardianName?: string;
  parentNrc?: string;
  relationship?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  submissionDate?: string;
}

export interface FinancialYearSummary {
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  totalSalaries: number;
  operationalCosts: number;
  studentCount: number;
}

export interface InstitutionalExpense {
  id: string;
  category: 'UTILITIES' | 'MAINTENANCE' | 'RESOURCES' | 'MARKETING';
  amount: number;
  date: string;
  description: string;
}

export interface SubjectPerformance {
  subjectName: string;
  score: number;
  maxScore: number;
  grade: string;
  percentage: number;
}

export interface StudentReport {
  id: string;
  studentId: string;
  term: string;
  type: AssessmentType;
  academicYear: number;
  subjects: SubjectPerformance[];
  totalScore: number;
  maxTotalScore: number;
  overallPercentage: number;
  overallGrade: string;
  teacherComment: string;
  status: GradeStatus;
  publishedAt?: string;
}

export interface TimetableSlot {
  time: string;
  label: string;
  type: 'LESSON' | 'BREAK' | 'LUNCH';
  subjectsByDay: Record<string, string>;
}

export interface SchoolMaterial {
  id: string;
  title: string;
  category: 'CALENDAR' | 'RULES' | 'HOMEWORK' | 'ACTIVITIES';
  fileType: 'PDF' | 'DOCX';
  date: string;
  size: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ClassSubject {
  id: string;
  name: string;
  gradeLevel: number;
  teacherId: string;
}

export type AssessmentType = 'Mid-week Assessment' | 'Mid-Term' | 'End-of-Term';

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  maxScore: number;
  type: AssessmentType;
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
  amount: number;
  type: 'BILL' | 'PAYMENT';
}

export interface PaymentNotification {
  id: string;
  studentId: string;
  amount: number;
  method: 'MOMO' | 'BANK';
  status: 'PENDING' | 'VERIFIED';
  timestamp: string;
  details: string;
}
