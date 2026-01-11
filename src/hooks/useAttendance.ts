import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { AttendanceRecord, AttendanceType, AttendanceStatus, getTodayISO, filterByType } from '../utils/attendanceCalc'

export interface Subject {
    id: string
    user_id: string
    name: string
}

/**
 * Hook for attendance operations
 * 
 * RULES:
 * - INSERT only - no upsert
 * - Explicit failure on duplicate (same subject + date + attendance_type)
 * - No caching of totals or percentages
 */
export function useAttendance() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch all subjects for current user
    const fetchSubjects = useCallback(async () => {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) {
            setError(error.message)
            return
        }
        setSubjects(data || [])
    }, [])

    // Fetch all attendance records for user's subjects
    const fetchAttendanceRecords = useCallback(async () => {
        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .order('date', { ascending: false })

        if (error) {
            setError(error.message)
            return
        }
        setAttendanceRecords(data || [])
    }, [])

    // Initial data fetch
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchSubjects(), fetchAttendanceRecords()])
            setLoading(false)
        }
        loadData()
    }, [fetchSubjects, fetchAttendanceRecords])

    // Add a new subject
    const addSubject = async (name: string): Promise<{ error: string | null }> => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Not authenticated' }

        const { error } = await supabase
            .from('subjects')
            .insert({ name, user_id: user.id })

        if (error) return { error: error.message }

        await fetchSubjects()
        return { error: null }
    }

    // Delete a subject
    const deleteSubject = async (id: string): Promise<{ error: string | null }> => {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id)

        if (error) return { error: error.message }

        await Promise.all([fetchSubjects(), fetchAttendanceRecords()])
        return { error: null }
    }

    /**
     * Mark attendance for a subject
     * 
     * IMPORTANT: Uses INSERT only, NOT upsert
     * Will explicitly fail if record already exists for this subject+date+attendance_type
     */
    const markAttendance = async (
        subjectId: string,
        status: AttendanceStatus,
        attendanceType: AttendanceType
    ): Promise<{ error: string | null }> => {
        const today = getTodayISO()

        // Check if attendance already exists for today for this type
        const existingRecord = attendanceRecords.find(
            r => r.subject_id === subjectId && r.date === today && r.attendance_type === attendanceType
        )

        if (existingRecord) {
            return { error: `${attendanceType.charAt(0).toUpperCase() + attendanceType.slice(1)} attendance already recorded for today. Cannot overwrite.` }
        }

        // INSERT only - no upsert to ensure deterministic behavior
        const { error } = await supabase
            .from('attendance_records')
            .insert({
                subject_id: subjectId,
                date: today,
                status,
                attendance_type: attendanceType
            })

        if (error) {
            // Handle unique constraint violation
            if (error.code === '23505') {
                return { error: `${attendanceType.charAt(0).toUpperCase() + attendanceType.slice(1)} attendance already recorded for today. Cannot overwrite.` }
            }
            return { error: error.message }
        }

        await fetchAttendanceRecords()
        return { error: null }
    }

    // Get attendance records for a specific subject
    const getRecordsForSubject = useCallback((subjectId: string, attendanceType?: AttendanceType): AttendanceRecord[] => {
        const subjectRecords = attendanceRecords.filter(r => r.subject_id === subjectId)
        if (attendanceType) {
            return filterByType(subjectRecords, attendanceType)
        }
        return subjectRecords
    }, [attendanceRecords])

    // Check if attendance is already marked for a subject today for a specific type
    const isMarkedToday = useCallback((subjectId: string, attendanceType: AttendanceType): boolean => {
        const today = getTodayISO()
        return attendanceRecords.some(
            r => r.subject_id === subjectId && r.date === today && r.attendance_type === attendanceType
        )
    }, [attendanceRecords])

    // Get today's attendance status for a subject for a specific type
    const getTodayStatus = useCallback((subjectId: string, attendanceType: AttendanceType): AttendanceStatus | null => {
        const today = getTodayISO()
        const record = attendanceRecords.find(
            r => r.subject_id === subjectId && r.date === today && r.attendance_type === attendanceType
        )
        return record?.status ?? null
    }, [attendanceRecords])

    return {
        subjects,
        attendanceRecords,
        loading,
        error,
        addSubject,
        deleteSubject,
        markAttendance,
        getRecordsForSubject,
        isMarkedToday,
        getTodayStatus,
        refetch: async () => {
            await Promise.all([fetchSubjects(), fetchAttendanceRecords()])
        }
    }
}
