/**
 * Attendance Calculation Utilities
 * 
 * RULE: No totals or percentages may be stored or cached.
 * All calculations MUST derive exclusively from raw attendance records.
 */

export type AttendanceStatus = 'present' | 'absent' | 'no_class'
export type AttendanceType = 'theory' | 'practical'

export interface AttendanceRecord {
    id: string
    subject_id: string
    date: string
    status: AttendanceStatus
    attendance_type: AttendanceType
}

/**
 * Calculate total classes conducted for a subject
 * NOTE: 'no_class' records are EXCLUDED from total
 */
export function calculateTotalClasses(records: AttendanceRecord[]): number {
    return records.filter(r => r.status !== 'no_class').length
}

/**
 * Calculate total classes attended for a subject
 * Only counts 'present' status
 */
export function calculateAttended(records: AttendanceRecord[]): number {
    return records.filter(r => r.status === 'present').length
}

/**
 * Calculate attendance percentage
 * Returns 0 if no classes conducted
 */
export function calculatePercentage(attended: number, total: number): number {
    if (total === 0) return 0
    return Math.round((attended / total) * 100)
}

/**
 * Get attendance status based on percentage
 * Safe: >= 75%
 * Danger: < 75%
 */
export function getStatus(percentage: number): 'safe' | 'danger' {
    return percentage >= 75 ? 'safe' : 'danger'
}

/**
 * Filter records by attendance type
 */
export function filterByType(records: AttendanceRecord[], type: AttendanceType): AttendanceRecord[] {
    return records.filter(r => r.attendance_type === type)
}

/**
 * Get day of week from date string
 */
export function getDayOfWeek(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getTodayISO(): string {
    return new Date().toISOString().split('T')[0]
}
