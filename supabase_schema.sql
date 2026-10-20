-- =========================================================================
-- Student Academic Performance & University Result Analyzer
-- Supabase PostgreSQL Schema, Row-Level Security (RLS), and Initial Seeds
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS arrears CASCADE;
DROP TABLE IF EXISTS university_results CASCADE;
DROP TABLE IF EXISTS ia_marks CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 3. Departments Table
CREATE TABLE departments (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    hod_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Students Table
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    reg_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    department VARCHAR(10) REFERENCES departments(code) ON DELETE CASCADE,
    semester VARCHAR(10) NOT NULL DEFAULT 'sem5',
    section VARCHAR(5) DEFAULT 'A',
    gender VARCHAR(10) DEFAULT 'Male',
    attendance NUMERIC(5,2) DEFAULT 85.00,
    cgpa NUMERIC(4,2) DEFAULT 7.50,
    semester_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subjects Table
CREATE TABLE subjects (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    credits INT DEFAULT 3,
    semester INT DEFAULT 5,
    department VARCHAR(10) REFERENCES departments(code) ON DELETE CASCADE,
    faculty VARCHAR(100),
    max_ia INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Internal Assessment Marks Table
CREATE TABLE ia_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_no VARCHAR(20) REFERENCES students(reg_no) ON DELETE CASCADE,
    subject_code VARCHAR(20) REFERENCES subjects(code) ON DELETE CASCADE,
    ia1 NUMERIC(5,2) DEFAULT 0.00,
    ia2 NUMERIC(5,2) DEFAULT 0.00,
    average NUMERIC(5,2) GENERATED ALWAYS AS ((ia1 + ia2) / 2.0) STORED,
    delta NUMERIC(5,2) GENERATED ALWAYS AS (ia2 - ia1) STORED,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reg_no, subject_code)
);

-- 7. University Examination Results Table
CREATE TABLE university_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_no VARCHAR(20) REFERENCES students(reg_no) ON DELETE CASCADE,
    name VARCHAR(100),
    subject_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    grade VARCHAR(5) NOT NULL,
    credits INT DEFAULT 4,
    result VARCHAR(10) NOT NULL, -- 'PASS' or 'FAIL'
    semester INT DEFAULT 5,
    exam_session VARCHAR(50) DEFAULT 'Nov/Dec 2024',
    verified_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Arrear History & Ledger Table
CREATE TABLE arrears (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_no VARCHAR(20) REFERENCES students(reg_no) ON DELETE CASCADE,
    subject_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    semester_failed INT NOT NULL,
    original_session VARCHAR(50) NOT NULL,
    status VARCHAR(10) DEFAULT 'ACTIVE', -- 'ACTIVE' or 'CLEARED'
    cleared_in_session VARCHAR(50),
    attempts INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL,
    subject VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- Enable Row-Level Security (RLS)
-- =========================================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrears ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public and Authenticated read & write for authorized educational portal operations
CREATE POLICY "Allow read access to all" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow read access to all" ON students FOR SELECT USING (true);
CREATE POLICY "Allow write access to students" ON students FOR ALL USING (true);

CREATE POLICY "Allow read access to all" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow write access to subjects" ON subjects FOR ALL USING (true);

CREATE POLICY "Allow read access to ia_marks" ON ia_marks FOR SELECT USING (true);
CREATE POLICY "Allow write access to ia_marks" ON ia_marks FOR ALL USING (true);

CREATE POLICY "Allow read access to university_results" ON university_results FOR SELECT USING (true);
CREATE POLICY "Allow write access to university_results" ON university_results FOR ALL USING (true);

CREATE POLICY "Allow read access to arrears" ON arrears FOR SELECT USING (true);
CREATE POLICY "Allow write access to arrears" ON arrears FOR ALL USING (true);

CREATE POLICY "Allow read access to audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow write access to audit_logs" ON audit_logs FOR ALL USING (true);

-- =========================================================================
-- Initial Seed Data
-- =========================================================================

-- Departments
INSERT INTO departments (code, name, hod_name) VALUES
('CSE', 'Computer Science & Engineering', 'Dr. R. Ramanathan'),
('ECE', 'Electronics & Communication Eng.', 'Dr. S. Kanthimathi'),
('IT', 'Information Technology', 'Dr. M. Geetha'),
('AIDS', 'Artificial Intelligence & Data Science', 'Dr. P. Karthik'),
('MECH', 'Mechanical Engineering', 'Dr. K. Annamalai')
ON CONFLICT (code) DO NOTHING;

-- Subjects
INSERT INTO subjects (code, name, credits, semester, department, faculty, max_ia) VALUES
('CS3591', 'Computer Networks', 4, 5, 'CSE', 'Prof. A. Senthil', 100),
('CS3501', 'Compiler Design', 4, 5, 'CSE', 'Dr. V. Meenakshi', 100),
('CS3551', 'Distributed Systems', 3, 5, 'CSE', 'Prof. T. Rajesh', 100),
('CS3511', 'Data Mining & Warehousing', 3, 5, 'CSE', 'Dr. B. Sudha', 100),
('CCS334', 'Big Data Analytics', 3, 5, 'CSE', 'Prof. N. Vignesh', 100)
ON CONFLICT (code) DO NOTHING;

-- Students
INSERT INTO students (id, reg_no, name, email, department, semester, section, gender, attendance, cgpa, semester_history) VALUES
('s01', '710022104001', 'Aarav Sharma', 'aarav.sharma@college.edu', 'CSE', 'sem5', 'A', 'Male', 94.0, 8.85, '[{"sem": 1, "sgpa": 8.6, "passCount": 6, "failCount": 0}, {"sem": 2, "sgpa": 8.75, "passCount": 6, "failCount": 0}, {"sem": 3, "sgpa": 8.9, "passCount": 6, "failCount": 0}, {"sem": 4, "sgpa": 8.85, "passCount": 6, "failCount": 0}]'::jsonb),
('s02', '710022104002', 'Bhavya Nair', 'bhavya.nair@college.edu', 'CSE', 'sem5', 'A', 'Female', 88.0, 8.12, '[{"sem": 1, "sgpa": 8.0, "passCount": 6, "failCount": 0}, {"sem": 2, "sgpa": 8.1, "passCount": 6, "failCount": 0}, {"sem": 3, "sgpa": 7.9, "passCount": 6, "failCount": 0}, {"sem": 4, "sgpa": 8.2, "passCount": 6, "failCount": 0}]'::jsonb),
('s03', '710022104003', 'Deepak Kumar', 'deepak.kumar@college.edu', 'CSE', 'sem5', 'A', 'Male', 72.0, 6.45, '[{"sem": 1, "sgpa": 7.1, "passCount": 6, "failCount": 0}, {"sem": 2, "sgpa": 6.8, "passCount": 5, "failCount": 1}, {"sem": 3, "sgpa": 6.2, "passCount": 5, "failCount": 1}, {"sem": 4, "sgpa": 6.4, "passCount": 6, "failCount": 0}]'::jsonb),
('s04', '710022104004', 'Divya R', 'divya.r@college.edu', 'CSE', 'sem5', 'A', 'Female', 98.0, 9.65, '[{"sem": 1, "sgpa": 9.5, "passCount": 6, "failCount": 0}, {"sem": 2, "sgpa": 9.7, "passCount": 6, "failCount": 0}, {"sem": 3, "sgpa": 9.6, "passCount": 6, "failCount": 0}, {"sem": 4, "sgpa": 9.8, "passCount": 6, "failCount": 0}]'::jsonb),
('s05', '710022104005', 'Gokul S', 'gokul.s@college.edu', 'CSE', 'sem5', 'A', 'Male', 64.0, 5.75, '[{"sem": 1, "sgpa": 6.2, "passCount": 5, "failCount": 1}, {"sem": 2, "sgpa": 5.8, "passCount": 4, "failCount": 2}, {"sem": 3, "sgpa": 5.5, "passCount": 4, "failCount": 2}, {"sem": 4, "sgpa": 5.4, "passCount": 5, "failCount": 1}]'::jsonb),
('s06', '710022104006', 'Harini K', 'harini.k@college.edu', 'CSE', 'sem5', 'A', 'Female', 92.0, 8.52, '[{"sem": 1, "sgpa": 8.4, "passCount": 6, "failCount": 0}, {"sem": 2, "sgpa": 8.5, "passCount": 6, "failCount": 0}, {"sem": 3, "sgpa": 8.6, "passCount": 6, "failCount": 0}, {"sem": 4, "sgpa": 8.5, "passCount": 6, "failCount": 0}]'::jsonb),
('s07', '710022104007', 'Imran Khan', 'imran.khan@college.edu', 'CSE', 'sem5', 'B', 'Male', 84.0, 7.68, '[{"sem": 1, "sgpa": 7.5, "passCount": 6, "failCount": 0}, {"sem": 2, "sgpa": 7.6, "passCount": 6, "failCount": 0}, {"sem": 3, "sgpa": 7.7, "passCount": 6, "failCount": 0}, {"sem": 4, "sgpa": 7.9, "passCount": 6, "failCount": 0}]'::jsonb),
('s11', '710022104011', 'Manoj Kumar P', 'manoj.kumar@college.edu', 'CSE', 'sem5', 'A', 'Male', 68.0, 5.92, '[{"sem": 1, "sgpa": 6.4, "passCount": 5, "failCount": 1}, {"sem": 2, "sgpa": 6.0, "passCount": 5, "failCount": 1}, {"sem": 3, "sgpa": 5.7, "passCount": 4, "failCount": 2}, {"sem": 4, "sgpa": 5.6, "passCount": 4, "failCount": 2}]'::jsonb)
ON CONFLICT (reg_no) DO NOTHING;

-- IA Marks
INSERT INTO ia_marks (reg_no, subject_code, ia1, ia2) VALUES
('710022104001', 'CS3591', 88.0, 94.0),
('710022104001', 'CS3501', 82.0, 90.0),
('710022104002', 'CS3591', 72.0, 84.0),
('710022104003', 'CS3591', 65.0, 44.0),
('710022104004', 'CS3591', 96.0, 98.0),
('710022104005', 'CS3591', 42.0, 36.0),
('710022104006', 'CS3591', 84.0, 89.0),
('710022104007', 'CS3591', 68.0, 78.0),
('710022104011', 'CS3591', 50.0, 42.0)
ON CONFLICT (reg_no, subject_code) DO NOTHING;

-- Arrears
INSERT INTO arrears (reg_no, subject_code, subject_name, semester_failed, original_session, status, cleared_in_session, attempts) VALUES
('710022104003', 'CS3352', 'Foundations of Data Science', 3, 'Nov/Dec 2023', 'CLEARED', 'Apr/May 2024', 2),
('710022104003', 'MA3354', 'Discrete Mathematics', 2, 'Apr/May 2023', 'ACTIVE', NULL, 3),
('710022104005', 'MA3151', 'Matrices and Calculus', 1, 'Jan/Feb 2023', 'CLEARED', 'Nov/Dec 2023', 2),
('710022104005', 'CS3491', 'Artificial Intelligence & ML', 4, 'Apr/May 2024', 'ACTIVE', NULL, 2),
('710022104005', 'CS3452', 'Theory of Computation', 4, 'Apr/May 2024', 'ACTIVE', NULL, 1),
('710022104011', 'CS3401', 'Algorithms', 4, 'Apr/May 2024', 'ACTIVE', NULL, 1),
('710022104011', 'MA3354', 'Discrete Mathematics', 3, 'Nov/Dec 2023', 'ACTIVE', NULL, 2);

-- University Results
INSERT INTO university_results (reg_no, name, subject_code, subject_name, grade, credits, result, semester, exam_session) VALUES
('710022104001', 'Aarav Sharma', 'CS3591', 'Computer Networks', 'O', 4, 'PASS', 5, 'Nov/Dec 2024'),
('710022104001', 'Aarav Sharma', 'CS3501', 'Compiler Design', 'A+', 4, 'PASS', 5, 'Nov/Dec 2024'),
('710022104002', 'Bhavya Nair', 'CS3591', 'Computer Networks', 'A', 4, 'PASS', 5, 'Nov/Dec 2024'),
('710022104003', 'Deepak Kumar', 'CS3591', 'Computer Networks', 'RA', 4, 'FAIL', 5, 'Nov/Dec 2024'),
('710022104004', 'Divya R', 'CS3591', 'Computer Networks', 'O', 4, 'PASS', 5, 'Nov/Dec 2024'),
('710022104005', 'Gokul S', 'CS3591', 'Computer Networks', 'RA', 4, 'FAIL', 5, 'Nov/Dec 2024'),
('710022104006', 'Harini K', 'CS3591', 'Computer Networks', 'A+', 4, 'PASS', 5, 'Nov/Dec 2024');

-- Storage Buckets Configuration Note:
-- In your Supabase Dashboard -> Storage, create two private buckets:
-- 1. 'university-results'
-- 2. 'ia-marksheets'
