/**
 * Missing Attendance Detection Utilities
 * 
 * RULE: Detection is READ-ONLY
 * RULE: Missing ≠ Absent
 * RULE: Only check dates within the range of existing records
 */

import { AttendanceRecord, AttendanceType } from './attendanceCalc'

/**
 * Get all dates between start and end (inclusive)
 */
function getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = []
    const current = new Date(startDate)
    const end = new Date(endDate)

    while (current <= end) {
        dates.push(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
    }

    return dates
}

/**
 * Detect missing attendance dates for a subject/type combination
 * 
 * Logic:
 * 1. Find the earliest and latest recorded dates for this subject/type
 * 2. Generate all dates in that range
 * 3. Return dates that have no record
 * 
 * Returns empty array if:
 * - No records exist (no date range to check)
 * - All dates in range are recorded
 */
export function detectMissingDates(
    records: AttendanceRecord[],
    subjectId: string,
    attendanceType: AttendanceType
): string[] {
    // Filter records for this subject and type
    const filteredRecords = records.filter(
        r => r.subject_id === subjectId && r.attendance_type === attendanceType
    )

    // If no records, nothing to detect (no date range exists)
    if (filteredRecords.length === 0) {
        return []
    }

    // Get recorded dates
    const recordedDates = new Set(filteredRecords.map(r => r.date))

    // Find date range
    const sortedDates = Array.from(recordedDates).sort()
    const startDate = sortedDates[0]
    const endDate = sortedDates[sortedDates.length - 1]

    // Generate all dates in range
    const allDates = getDateRange(startDate, endDate)

    // Find missing dates (dates with no record)
    const missingDates = allDates.filter(date => !recordedDates.has(date))

    return missingDates
}

/**
 * Count missing attendance days for a subject/type
 */
export function countMissingDates(
    records: AttendanceRecord[],
    subjectId: string,
    attendanceType: AttendanceType
): number {
    return detectMissingDates(records, subjectId, attendanceType).length
}
