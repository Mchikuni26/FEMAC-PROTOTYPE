
import { 
  GradeRecord, GradeStatus, Assignment, FeeTransaction, 
  Student, ApplicationStatus, PaymentNotification, AssessmentType,
  StudentReport, SubjectPerformance, StaffMember, FinancialYearSummary, InstitutionalExpense 
} from '../types';
import { MOCK_GRADES, MOCK_ASSIGNMENTS, MOCK_FEES, MOCK_STUDENTS, MOCK_CLASSES, MOCK_STAFF } from '../constants';

// Simple in-memory store for prototype
let gradesStore = [...MOCK_GRADES];
let assignmentsStore = [...MOCK_ASSIGNMENTS];
let feesStore = [...MOCK_FEES];
let studentsStore = [...MOCK_STUDENTS];
let staffStore = [...MOCK_STAFF];
let notificationsStore: PaymentNotification[] = [];
let reportsStore: StudentReport[] = [];

// Growth Tracking Data
let historicalYearsStore: FinancialYearSummary[] = [
  { year: 2023, totalRevenue: 850000, totalExpenses: 420000, grossProfit: 850000, netProfit: 430000, totalSalaries: 380000, operationalCosts: 40000, studentCount: 180 },
  { year: 2024, totalRevenue: 1020000, totalExpenses: 510000, grossProfit: 1020000, netProfit: 510000, totalSalaries: 450000, operationalCosts: 60000, studentCount: 210 },
  { year: 2025, totalRevenue: 1180000, totalExpenses: 590000, grossProfit: 1180000, netProfit: 590000, totalSalaries: 520000, operationalCosts: 70000, studentCount: 245 }
];

let institutionalExpenses: InstitutionalExpense[] = [
  { id: 'exp-1', category: 'UTILITIES', amount: 4500, date: '2026-01-15', description: 'ZESCO Power Grid Settlement' },
  { id: 'exp-2', category: 'MAINTENANCE', amount: 8200, date: '2026-02-05', description: 'Science Lab Structural Repair' },
  { id: 'exp-3', category: 'RESOURCES', amount: 12500, date: '2026-02-18', description: 'New Grade 10 Textbooks Purchase' }
];

export const MockDB = {
  // Financial Growth Analytics
  getGrowthMetrics: () => {
    const currentYear = new Date().getFullYear();
    const verifiedPayments = feesStore.filter(f => f.type === 'PAYMENT').reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    const activeStaff = staffStore.filter(s => s.contractStatus === 'ACTIVE');
    const monthlySalaries = activeStaff.reduce((acc, curr) => acc + curr.salary, 0);
    
    // Estimation for the year so far (Current month is simplified)
    const monthIndex = new Date().getMonth() + 1;
    const yearSalaries = monthlySalaries * monthIndex;
    const totalOps = institutionalExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalExpenses = yearSalaries + totalOps;
    const grossProfit = verifiedPayments - totalOps; // Revenue minus operational costs
    const netProfit = grossProfit - yearSalaries; // Gross minus salaries

    return {
      current: {
        year: currentYear,
        totalRevenue: verifiedPayments,
        totalExpenses: totalExpenses,
        grossProfit: grossProfit,
        netProfit: netProfit,
        totalSalaries: yearSalaries,
        operationalCosts: totalOps,
        studentCount: studentsStore.filter(s => s.applicationStatus === ApplicationStatus.ACCEPTED).length
      } as FinancialYearSummary,
      history: historicalYearsStore
    };
  },

  getExpenses: () => [...institutionalExpenses],

  addExpense: (expense: Omit<InstitutionalExpense, 'id' | 'date'>) => {
    const newExpense: InstitutionalExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    institutionalExpenses.unshift(newExpense);
    return newExpense;
  },

  archiveFinancialYear: () => {
    const metrics = MockDB.getGrowthMetrics();
    const summary = metrics.current;
    
    // Check if already archived
    if (historicalYearsStore.find(h => h.year === summary.year)) {
      return;
    }

    historicalYearsStore.push(summary);
    
    feesStore = [];
    institutionalExpenses = [];
  },

  // Staff
  getStaff: () => {
    const today = new Date();
    return staffStore.map(staff => {
      const expiry = new Date(staff.contractExpiryDate);
      if (staff.contractStatus === 'ACTIVE' && expiry < today) {
        return { ...staff, contractStatus: 'EXPIRED' as const };
      }
      return staff;
    });
  },

  renewContract: (staffId: string) => {
    const idx = staffStore.findIndex(s => s.id === staffId);
    if (idx !== -1) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      staffStore[idx] = { 
        ...staffStore[idx], 
        contractStatus: 'ACTIVE', 
        contractExpiryDate: nextYear.toISOString().split('T')[0] 
      };
    }
  },

  terminateContract: (staffId: string) => {
    const idx = staffStore.findIndex(s => s.id === staffId);
    if (idx !== -1) {
      staffStore[idx] = { 
        ...staffStore[idx], 
        contractStatus: 'TERMINATED',
        contractExpiryDate: new Date().toISOString().split('T')[0]
      };
    }
  },

  // Students
  getStudents: () => [...studentsStore],
  getStudentById: (id: string) => studentsStore.find(s => s.id === id),

  createStudent: (details: Partial<Student>) => {
    const id = `S-2026-${String(studentsStore.length + 1).padStart(3, '0')}`;
    const newStudent: Student = { 
      id,
      firstName: details.firstName || '',
      lastName: details.lastName || '',
      grade: details.grade || 1,
      parentId: details.parentId || 'U-PAR-PROSPECT',
      applicationStatus: ApplicationStatus.PENDING,
      resultsUnlocked: false,
      dob: details.dob,
      gender: details.gender,
      previousSchool: details.previousSchool,
      guardianName: details.guardianName,
      parentNrc: details.parentNrc,
      relationship: details.relationship,
      occupation: details.occupation,
      phone: details.phone,
      email: details.email,
      address: details.address,
      emergencyName: details.emergencyName,
      emergencyPhone: details.emergencyPhone,
      submissionDate: new Date().toISOString().split('T')[0]
    };
    studentsStore.push(newStudent);
    
    const grade = newStudent.grade;
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

  updateStudentStatus: (studentId: string, status: ApplicationStatus) => {
    const idx = studentsStore.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      studentsStore[idx] = { ...studentsStore[idx], applicationStatus: status };
    }
  },

  unlockResults: (studentId: string) => {
    const idx = studentsStore.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      studentsStore[idx] = { ...studentsStore[idx], resultsUnlocked: true };
    }
  },

  // Reports
  saveReport: (report: StudentReport) => {
    const idx = reportsStore.findIndex(r => r.id === report.id);
    if (idx !== -1) {
      reportsStore[idx] = report;
    } else {
      reportsStore.push(report);
    }
    return report;
  },

  getReportsByStudent: (studentId: string) => {
    return reportsStore.filter(r => r.studentId === studentId);
  },

  getReportsByGrade: (grade: number) => {
    return reportsStore.filter(r => {
      const student = studentsStore.find(s => s.id === r.studentId);
      return student?.grade === grade;
    });
  },

  updateReportStatus: (reportId: string, status: GradeStatus) => {
    const idx = reportsStore.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      reportsStore[idx] = { ...reportsStore[idx], status };
    }
  },

  updateReportStatusBatch: (grade: number, type: AssessmentType, status: GradeStatus) => {
    reportsStore = reportsStore.map(r => {
      const student = studentsStore.find(s => s.id === r.studentId);
      if (student?.grade === grade && r.type === type) {
        return { ...r, status };
      }
      return r;
    });
  },

  // Legacy Grades
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

  updateGradeStatusBatch: (assignmentId: string, newStatus: GradeStatus) => {
    gradesStore = gradesStore.map(g => {
      if (g.assignmentId === assignmentId) {
        return { ...g, status: newStatus };
      }
      return g;
    });
  },

  createAssignment: (classId: string, title: string, maxScore: number, type: AssessmentType = 'Mid-week Assessment') => {
    const newId = `a${Date.now()}`;
    const newAssignment: Assignment = {
      id: newId,
      classId,
      title,
      maxScore,
      type,
      date: new Date().toISOString().split('T')[0]
    };
    assignmentsStore.push(newAssignment);

    const classInfo = MOCK_CLASSES.find(c => c.id === classId);
    if (classInfo) {
      const classStudents = studentsStore.filter(s => s.grade === classInfo.gradeLevel && s.applicationStatus === ApplicationStatus.ACCEPTED);
      classStudents.forEach(s => {
        gradesStore.push({
          id: `g-${newId}-${s.id}`,
          assignmentId: newId,
          studentId: s.id,
          score: 0,
          status: GradeStatus.DRAFT
        });
      });
    }

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
      description: 'Institutional Fee Settlement',
      amount: -amount,
      type: 'PAYMENT'
    };
    feesStore.push(newTxn);
    return newTxn;
  },

  // Notifications
  sendPaymentNotification: (notification: Omit<PaymentNotification, 'id' | 'status' | 'timestamp'>) => {
    const newNotif: PaymentNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };
    notificationsStore.push(newNotif);
    return newNotif;
  },

  getNotifications: () => [...notificationsStore],

  verifyNotification: (notifId: string) => {
    const notifIdx = notificationsStore.findIndex(n => n.id === notifId);
    if (notifIdx !== -1) {
      notificationsStore[notifIdx].status = 'VERIFIED';
      const studentId = notificationsStore[notifIdx].studentId;
      MockDB.unlockResults(studentId);
    }
  }
};
