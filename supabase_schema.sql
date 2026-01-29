-- FAIMS - FEMAC ACADEMY Integrated Management System
-- High-Fidelity Database Schema for Supabase (PostgreSQL)

-- 1. ENUMS FOR ROLE-BASED LOGIC & WORKFLOWS
CREATE TYPE user_role AS ENUM (
  'PUPIL', 
  'PARENT', 
  'TEACHER', 
  'EXAMS_OFFICE', 
  'REGISTRAR', 
  'EXECUTIVE_ACCOUNTS'
);

CREATE TYPE grade_status AS ENUM (
  'DRAFT', 
  'SUBMITTED', 
  'APPROVED', 
  'PUBLISHED'
);

CREATE TYPE application_status AS ENUM (
  'PENDING', 
  'ACCEPTED', 
  'DECLINED', 
  'INTERVIEW'
);

CREATE TYPE expense_category AS ENUM (
  'UTILITIES', 
  'MAINTENANCE', 
  'RESOURCES', 
  'MARKETING'
);

CREATE TYPE fee_type AS ENUM (
  'BILL', 
  'PAYMENT'
);

CREATE TYPE notification_status AS ENUM (
  'PENDING', 
  'VERIFIED'
);

-- 2. CORE TABLES

-- School Settings (Singleton)
CREATE TABLE school_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Announcements (Notice Board)
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  imageUrl TEXT,
  priority TEXT DEFAULT 'NORMAL'
);

-- Staff (HR & Payroll)
CREATE TABLE staff (
  id TEXT PRIMARY KEY, -- Maps to 'U-TEA-G1', etc.
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  duties TEXT,
  salary NUMERIC(15, 2) DEFAULT 0,
  contractStatus TEXT DEFAULT 'ACTIVE',
  contractExpiryDate DATE,
  assignedGrade INTEGER,
  hireDate DATE DEFAULT CURRENT_DATE
);

-- Students (Central Registry)
CREATE TABLE students (
  id TEXT PRIMARY KEY, -- Maps to 'S-2026-001', etc.
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  grade INTEGER NOT NULL,
  parentId TEXT NOT NULL,
  applicationStatus application_status DEFAULT 'PENDING',
  resultsUnlocked BOOLEAN DEFAULT FALSE,
  dob DATE,
  gender TEXT,
  previousSchool TEXT,
  guardianName TEXT,
  parentNrc TEXT,
  relationship TEXT,
  occupation TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergencyName TEXT,
  emergencyPhone TEXT,
  submissionDate DATE DEFAULT CURRENT_DATE,
  interviewDate DATE
);

-- Chat Sessions (AI & Executive Interaction)
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parentId TEXT NOT NULL,
  parentName TEXT NOT NULL,
  status TEXT DEFAULT 'AI_ONLY', -- 'AI_ONLY', 'REQUESTED', 'ACTIVE', 'CLOSED'
  lastActivity TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessionId UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  senderId TEXT NOT NULL,
  senderRole user_role NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  isAi BOOLEAN DEFAULT FALSE
);

-- Institutional Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category expense_category NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT
);

-- Fees (Billing & Payment Ledger)
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studentId TEXT REFERENCES students(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  type fee_type NOT NULL
);

-- Payment Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studentId TEXT REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  method TEXT, -- 'MOMO', 'BANK'
  status notification_status DEFAULT 'PENDING',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details TEXT
);

-- Academic Reports (Grade Integrity Node)
CREATE TABLE reports (
  id TEXT PRIMARY KEY, -- Composite ID like 'REP-End-of-Term-S2026-001'
  studentId TEXT REFERENCES students(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  type TEXT NOT NULL,
  academicYear INTEGER NOT NULL,
  subjects JSONB NOT NULL, -- SubjectPerformance[]
  totalScore NUMERIC(10, 2),
  maxTotalScore NUMERIC(10, 2),
  overallPercentage NUMERIC(5, 2),
  overallGrade TEXT,
  teacherComment TEXT,
  status grade_status DEFAULT 'DRAFT',
  publishedAt TIMESTAMPTZ
);

-- 3. SEED INITIAL DATA
INSERT INTO school_settings (id, address, phone, email) 
VALUES (1, 'PLOT 442 KATUBA 17MILES, GREAT NORTH ROAD, CENTRAL, ZAMBIA', '+260 972 705 347', 'admissions@femac.edu.zm')
ON CONFLICT (id) DO NOTHING;

INSERT INTO announcements (title, content, priority)
VALUES ('2026 Enrollment Phase 1', 'Open applications for primary and secondary division now live.', 'NORMAL');
