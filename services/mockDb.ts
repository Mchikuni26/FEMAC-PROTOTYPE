
import { supabase } from '../supabase';
import { 
  GradeRecord, GradeStatus, Assignment, FeeTransaction, 
  Student, ApplicationStatus, PaymentNotification, AssessmentType,
  StudentReport, SubjectPerformance, StaffMember, FinancialYearSummary, InstitutionalExpense,
  ChatSession, ChatMessage, UserRole, Announcement, SchoolSettings 
} from '../types';

export const MockDB = {
  // Announcements
  getAnnouncements: async (): Promise<Announcement[]> => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });
    if (error) return [];
    return data || [];
  },

  addAnnouncement: async (announcement: Omit<Announcement, 'id' | 'date'>) => {
    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        ...announcement,
        date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteAnnouncement: async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  },

  // School Settings
  getSchoolSettings: async (): Promise<SchoolSettings> => {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .maybeSingle();
    
    if (error || !data) {
      return {
        address: 'PLOT 442 KATUBA 17MILES, GREAT NORTH ROAD, CENTRAL, ZAMBIA',
        phone: '+260 972 705 347',
        email: 'admissions@femac.edu.zm'
      };
    }
    return data;
  },

  updateSchoolSettings: async (settings: SchoolSettings) => {
    const { error } = await supabase.from('school_settings').upsert([{ id: 1, ...settings }]);
    if (error) throw error;
  },

  // Chat Logic
  getChatSessions: async (): Promise<ChatSession[]> => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*, chat_messages(*)');
    if (error) return [];
    return data.map(s => ({
      ...s,
      messages: s.chat_messages || []
    })).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  },
  
  getChatSessionByParent: async (parentId: string, parentName: string): Promise<ChatSession> => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*, chat_messages(*)')
      .eq('parentId', parentId)
      .neq('status', 'CLOSED')
      .maybeSingle();

    if (error || !data) {
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert([{
          parentId,
          parentName,
          status: 'AI_ONLY',
          lastActivity: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      return { ...newSession, messages: [] };
    }
    
    return { ...data, messages: (data.chat_messages || []).sort((a:any, b:any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) };
  },

  sendMessage: async (sessionId: string, senderId: string, role: UserRole, text: string, isAi: boolean = false) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        sessionId,
        senderId,
        senderRole: role,
        text,
        timestamp: new Date().toISOString(),
        isAi
      }])
      .select()
      .single();

    await supabase
      .from('chat_sessions')
      .update({ lastActivity: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
    return data;
  },

  requestExecutive: async (sessionId: string) => {
    await supabase.from('chat_sessions').update({ status: 'REQUESTED' }).eq('id', sessionId);
  },

  acceptChatRequest: async (sessionId: string) => {
    await supabase.from('chat_sessions').update({ status: 'ACTIVE' }).eq('id', sessionId);
  },

  closeChat: async (sessionId: string) => {
    await supabase.from('chat_sessions').update({ status: 'CLOSED' }).eq('id', sessionId);
  },

  // Financials & Growth
  getGrowthMetrics: async () => {
    const { data: fees } = await supabase.from('fees').select('*');
    const { data: staff } = await supabase.from('staff').select('*');
    const { data: expenses } = await supabase.from('expenses').select('*');
    const { data: students } = await supabase.from('students').select('*');

    const verifiedPayments = (fees || []).filter(f => f.type === 'PAYMENT').reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    const activeStaff = (staff || []).filter(s => s.contractStatus === 'ACTIVE');
    const monthlySalaries = activeStaff.reduce((acc, curr) => acc + curr.salary, 0);
    const totalOps = (expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
    
    const yearSalaries = monthlySalaries * 12; // Annualized for report
    const totalExpenses = yearSalaries + totalOps;
    const netProfit = verifiedPayments - totalExpenses;

    return {
      current: {
        year: new Date().getFullYear(),
        totalRevenue: verifiedPayments,
        totalExpenses,
        grossProfit: verifiedPayments - totalOps,
        netProfit,
        totalSalaries: yearSalaries,
        operationalCosts: totalOps,
        studentCount: (students || []).filter(s => s.applicationStatus === ApplicationStatus.ACCEPTED).length
      } as FinancialYearSummary,
      history: []
    };
  },

  getExpenses: async (): Promise<InstitutionalExpense[]> => {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    return data || [];
  },

  addExpense: async (expense: Omit<InstitutionalExpense, 'id' | 'date'>) => {
    await supabase.from('expenses').insert([{ ...expense, date: new Date().toISOString().split('T')[0] }]);
  },

  getStaff: async (): Promise<StaffMember[]> => {
    const { data } = await supabase.from('staff').select('*');
    return data || [];
  },

  renewContract: async (staffId: string) => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    await supabase.from('staff').update({
      contractStatus: 'ACTIVE',
      contractExpiryDate: nextYear.toISOString().split('T')[0]
    }).eq('id', staffId);
  },

  terminateContract: async (staffId: string) => {
    await supabase.from('staff').update({
      contractStatus: 'TERMINATED',
      contractExpiryDate: new Date().toISOString().split('T')[0]
    }).eq('id', staffId);
  },

  getStudents: async (): Promise<Student[]> => {
    const { data } = await supabase.from('students').select('*').order('id', { ascending: true });
    return data || [];
  },

  getStudentById: async (id: string): Promise<Student | null> => {
    const { data } = await supabase.from('students').select('*').eq('id', id).maybeSingle();
    return data;
  },

  createStudent: async (details: Partial<Student>) => {
    const { data: countData } = await supabase.from('students').select('id');
    const count = (countData?.length || 0) + 1;
    const id = `S-2026-${String(count).padStart(3, '0')}`;
    
    const newStudent: any = { 
      id,
      firstName: (details.firstName || '').toUpperCase(),
      lastName: (details.lastName || '').toUpperCase(),
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

    const { error } = await supabase.from('students').insert([newStudent]);
    if (error) throw error;

    const feeAmount = newStudent.grade <= 7 ? 3500 : (newStudent.grade <= 9 ? 4800 : 6200);
    await supabase.from('fees').insert([{
      studentId: id,
      date: new Date().toISOString().split('T')[0],
      description: 'INITIAL ADMISSION & TERM 1 FEES',
      amount: feeAmount,
      type: 'BILL'
    }]);
    
    return newStudent;
  },

  updateStudentStatus: async (studentId: string, status: ApplicationStatus, interviewDate?: string) => {
    await supabase.from('students').update({
      applicationStatus: status,
      interviewDate: interviewDate 
    }).eq('id', studentId);
  },

  unlockResults: async (studentId: string) => {
    await supabase.from('students').update({ resultsUnlocked: true }).eq('id', studentId);
  },

  saveReport: async (report: StudentReport) => {
    const { data: existing } = await supabase.from('reports').select('id').eq('id', report.id).maybeSingle();
    if (existing) {
      await supabase.from('reports').update(report).eq('id', report.id);
    } else {
      await supabase.from('reports').insert([report]);
    }
  },

  getReportsByStudent: async (studentId: string): Promise<StudentReport[]> => {
    const { data } = await supabase.from('reports').select('*').eq('studentId', studentId);
    return data || [];
  },

  getReportsByGrade: async (grade: number): Promise<StudentReport[]> => {
    const { data: students } = await supabase.from('students').select('id').eq('grade', grade);
    const ids = (students || []).map(s => s.id);
    const { data: reports } = await supabase.from('reports').select('*').in('studentId', ids);
    return reports || [];
  },

  updateReportStatus: async (reportId: string, status: GradeStatus) => {
    await supabase.from('reports').update({ status }).eq('id', reportId);
  },

  updateReportStatusBatch: async (grade: number, type: AssessmentType, status: GradeStatus) => {
    const { data: students } = await supabase.from('students').select('id').eq('grade', grade);
    const ids = (students || []).map(s => s.id);
    await supabase.from('reports').update({ status }).in('studentId', ids).eq('type', type);
  },

  getFeesByStudent: async (studentId: string): Promise<FeeTransaction[]> => {
    const { data } = await supabase.from('fees').select('*').eq('studentId', studentId).order('date', { ascending: false });
    return data || [];
  },
  
  makePayment: async (studentId: string, amount: number, description?: string) => {
    await supabase.from('fees').insert([{
      studentId,
      date: new Date().toISOString().split('T')[0],
      description: (description || 'INSTITUTIONAL FEE SETTLEMENT').toUpperCase(),
      amount: -amount,
      type: 'PAYMENT'
    }]);
  },

  getNotifications: async (): Promise<PaymentNotification[]> => {
    const { data } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  sendPaymentNotification: async (notification: Omit<PaymentNotification, 'id' | 'timestamp' | 'status'>) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notification,
        status: 'PENDING',
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  verifyNotification: async (notifId: string) => {
    const { data: notif } = await supabase.from('notifications').update({ status: 'VERIFIED' }).eq('id', notifId).select().single();
    if (notif) {
      await MockDB.unlockResults(notif.studentId);
    }
  },

  getGradesByStudent: async (studentId: string) => {
    const { data } = await supabase.from('reports').select('*').eq('studentId', studentId).eq('status', 'PUBLISHED');
    return data || [];
  }
};
