import { useState, FormEvent } from 'react'
import { useAttendance } from '../hooks/useAttendance'
import {
    calculateTotalClasses,
    calculateAttended,
    calculatePercentage,
    getStatus,
    AttendanceType,
    AttendanceStatus
} from '../utils/attendanceCalc'

interface AttendanceSectionProps {
    subjectId: string
    type: AttendanceType
    records: ReturnType<typeof useAttendance>['getRecordsForSubject']
    isMarkedToday: ReturnType<typeof useAttendance>['isMarkedToday']
    getTodayStatus: ReturnType<typeof useAttendance>['getTodayStatus']
    onMarkAttendance: (subjectId: string, status: AttendanceStatus, type: AttendanceType) => Promise<void>
    isLoading: boolean
}

function AttendanceSection({
    subjectId,
    type,
    records,
    isMarkedToday,
    getTodayStatus,
    onMarkAttendance,
    isLoading
}: AttendanceSectionProps) {
    const typeRecords = records(subjectId, type)
    const total = calculateTotalClasses(typeRecords)
    const attended = calculateAttended(typeRecords)
    const percentage = calculatePercentage(attended, total)
    const status = getStatus(percentage)
    const markedToday = isMarkedToday(subjectId, type)
    const todayStatus = getTodayStatus(subjectId, type)

    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)

    const getStatusLabel = (s: AttendanceStatus) => {
        switch (s) {
            case 'present': return '✓ Present'
            case 'absent': return '✗ Absent'
            case 'no_class': return '— No Class'
        }
    }

    return (
        <div className="attendance-section">
            <div className="attendance-section-header">
                <span className="attendance-section-title">{typeLabel}</span>
                <span className={`status-badge status-${status}`}>
                    {percentage}% {status === 'safe' ? '✓' : '!'}
                </span>
            </div>

            <div className="attendance-section-stats">
                <span>{attended} / {total} classes</span>
            </div>

            <div className="attendance-section-actions">
                {markedToday ? (
                    <span className="marked-status">
                        {getStatusLabel(todayStatus!)}
                    </span>
                ) : (
                    <>
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => onMarkAttendance(subjectId, 'present', type)}
                            disabled={isLoading}
                        >
                            Present
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onMarkAttendance(subjectId, 'absent', type)}
                            disabled={isLoading}
                        >
                            Absent
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => onMarkAttendance(subjectId, 'no_class', type)}
                            disabled={isLoading}
                        >
                            No Class
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default function TodayPage() {
    const {
        subjects,
        loading,
        error,
        addSubject,
        deleteSubject,
        markAttendance,
        getRecordsForSubject,
        isMarkedToday,
        getTodayStatus
    } = useAttendance()

    const [newSubjectName, setNewSubjectName] = useState('')
    const [actionError, setActionError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const handleAddSubject = async (e: FormEvent) => {
        e.preventDefault()
        if (!newSubjectName.trim()) return

        setActionError(null)
        const { error } = await addSubject(newSubjectName.trim())
        if (error) {
            setActionError(error)
        } else {
            setNewSubjectName('')
        }
    }

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('Delete this subject? All attendance records will be lost.')) return

        setActionError(null)
        const { error } = await deleteSubject(id)
        if (error) {
            setActionError(error)
        }
    }

    const handleMarkAttendance = async (subjectId: string, status: AttendanceStatus, type: AttendanceType) => {
        setActionError(null)
        setActionLoading(`${subjectId}-${type}`)

        const { error } = await markAttendance(subjectId, status, type)
        if (error) {
            setActionError(error)
        }

        setActionLoading(null)
    }

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Today's Attendance</h1>
                <p className="page-date">{today}</p>
            </div>

            {(error || actionError) && (
                <div className="error-message">{error || actionError}</div>
            )}

            {/* Add Subject Form */}
            <div className="add-section">
                <form className="inline-form" onSubmit={handleAddSubject}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Add new subject..."
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        Add
                    </button>
                </form>
            </div>

            {/* Subject List */}
            {subjects.length === 0 ? (
                <div className="empty-state">
                    <p>No subjects yet. Add your first subject above!</p>
                </div>
            ) : (
                subjects.map((subject) => {
                    const isLoading = actionLoading?.startsWith(subject.id) ?? false

                    return (
                        <div key={subject.id} className="subject-card">
                            <div className="subject-header">
                                <h3 className="subject-name">{subject.name}</h3>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleDeleteSubject(subject.id)}
                                    title="Delete subject"
                                >
                                    ✕
                                </button>
                            </div>

                            <AttendanceSection
                                subjectId={subject.id}
                                type="theory"
                                records={getRecordsForSubject}
                                isMarkedToday={isMarkedToday}
                                getTodayStatus={getTodayStatus}
                                onMarkAttendance={handleMarkAttendance}
                                isLoading={isLoading}
                            />

                            <AttendanceSection
                                subjectId={subject.id}
                                type="practical"
                                records={getRecordsForSubject}
                                isMarkedToday={isMarkedToday}
                                getTodayStatus={getTodayStatus}
                                onMarkAttendance={handleMarkAttendance}
                                isLoading={isLoading}
                            />
                        </div>
                    )
                })
            )}
        </div>
    )
}
