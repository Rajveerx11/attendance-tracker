-- ============================================
-- Attendance Tracker - Historical Data Import
-- ============================================
-- ONE-TIME SEED: Run this AFTER creating subjects
-- 
-- Prerequisites:
-- 1. Tables created via supabase_setup.sql
-- 2. User authenticated and subjects created with EXACT names:
--    SFT, MAL, MAD, ETI, CSS, MAN
-- 3. Run this script in Supabase SQL Editor
--
-- This script automatically looks up subject IDs by name.
-- If a subject name doesn't exist, that INSERT will fail.
-- ============================================


-- ========== SFT (Theory) ==========
-- 4 records: 3 present, 1 absent
INSERT INTO attendance_records (subject_id, date, status, attendance_type)
SELECT id, '2025-12-26'::date, 'absent', 'theory' FROM subjects WHERE name = 'SFT'
UNION ALL
SELECT id, '2025-12-29'::date, 'present', 'theory' FROM subjects WHERE name = 'SFT'
UNION ALL
SELECT id, '2025-12-30'::date, 'present', 'theory' FROM subjects WHERE name = 'SFT'
UNION ALL
SELECT id, '2026-01-01'::date, 'present', 'theory' FROM subjects WHERE name = 'SFT';

-- ========== SFT (Practical) ==========
-- SKIPPED: No classes held → No records to insert


-- ========== MAL (Theory) ==========
-- 2 records: both present
INSERT INTO attendance_records (subject_id, date, status, attendance_type)
SELECT id, '2025-12-22'::date, 'present', 'theory' FROM subjects WHERE name = 'MAL'
UNION ALL
SELECT id, '2025-12-23'::date, 'present', 'theory' FROM subjects WHERE name = 'MAL';


-- ========== MAD (Theory) ==========
-- TODO: 1 absent lecture with UNKNOWN date
-- SKIPPED: Cannot insert record without precise date
-- Action required: User must recall the exact date


-- ========== ETI (Theory) ==========
-- 2 records: both present
INSERT INTO attendance_records (subject_id, date, status, attendance_type)
SELECT id, '2025-12-22'::date, 'present', 'theory' FROM subjects WHERE name = 'ETI'
UNION ALL
SELECT id, '2025-12-31'::date, 'present', 'theory' FROM subjects WHERE name = 'ETI';


-- ========== CSS (Theory) ==========
-- 2 records: both present
INSERT INTO attendance_records (subject_id, date, status, attendance_type)
SELECT id, '2025-12-22'::date, 'present', 'theory' FROM subjects WHERE name = 'CSS'
UNION ALL
SELECT id, '2025-12-23'::date, 'present', 'theory' FROM subjects WHERE name = 'CSS';


-- ========== MAN (Theory) ==========
-- TODO: 1 absent lecture with UNKNOWN date
-- SKIPPED: Cannot insert record without precise date
-- Action required: User must recall the exact date


-- ============================================
-- SUMMARY
-- ============================================
-- Total records to insert: 10
-- 
-- IMPORTANT: Before running this, create these subjects in the app:
--   SFT, MAL, MAD, ETI, CSS, MAN
--
-- SKIPPED (unknown dates):
--   - MAD: 1 absent lecture
--   - MAN: 1 absent lecture
-- ============================================
