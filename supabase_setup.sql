-- ============================================
-- Attendance Tracker V1 - Database Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard
-- Go to: SQL Editor > New Query > Paste this > Run
-- ============================================

-- ========== CREATE TABLES ==========

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance records table with theory/practical support
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'no_class')) NOT NULL,
  attendance_type TEXT CHECK (attendance_type IN ('theory', 'practical')) NOT NULL DEFAULT 'theory',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, date, attendance_type)  -- One record per subject per date per type
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== ENABLE ROW LEVEL SECURITY ==========

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ========== CREATE RLS POLICIES ==========

-- Subjects: user can only access their own
CREATE POLICY "Users can manage own subjects"
  ON subjects FOR ALL
  USING (user_id = auth.uid());

-- Tasks: user can only access their own
CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  USING (user_id = auth.uid());

-- Attendance: user can only access records for subjects they own
CREATE POLICY "Users can manage attendance for own subjects"
  ON attendance_records FOR ALL
  USING (
    subject_id IN (
      SELECT id FROM subjects WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- DONE! Your database is now set up.
-- ============================================


-- ============================================
-- MIGRATION SCRIPT (if tables already exist)
-- Run this ONLY if you already have the old schema
-- ============================================
/*
-- Add attendance_type column to existing table
ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS attendance_type TEXT CHECK (attendance_type IN ('theory', 'practical')) DEFAULT 'theory';

-- Update status check to include no_class
ALTER TABLE attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_status_check;

ALTER TABLE attendance_records 
ADD CONSTRAINT attendance_records_status_check 
CHECK (status IN ('present', 'absent', 'no_class'));

-- Drop old unique constraint and add new one
ALTER TABLE attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_subject_id_date_key;

ALTER TABLE attendance_records 
ADD CONSTRAINT attendance_records_subject_id_date_attendance_type_key 
UNIQUE (subject_id, date, attendance_type);
*/
