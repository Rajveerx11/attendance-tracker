import { useAttendance } from '../hooks/useAttendance'
import { Link } from 'react-router-dom'
import {
    calculateTotalClasses,
    calculateAttended,
    calculatePercentage,
    getStatus,
    AttendanceType
} from '../utils/attendanceCalc'
import { countMissingDates } from '../utils/missingDetection'

interface TypeStatsProps {
    subjectId: string
    type: AttendanceType
    getRecordsForSubject: ReturnType<typeof useAttendance>['getRecordsForSubject']
    allRecords: ReturnType<typeof useAttendance>['attendanceRecords']
}

function TypeStats({ subjectId, type, getRecordsForSubject, allRecords }: TypeStatsProps) {
    const records = getRecordsForSubject(subjectId, type)
    const total = calculateTotalClasses(records)
    const attended = calculateAttended(records)
    const percentage = calculatePercentage(attended, total)
    const status = getStatus(percentage)

    // Missing detection (read-only)
    const missingCount = countMissingDates(allRecords, subjectId, type)

    return (
        <div className="attendance-section">
            <div className="attendance-section-header">
                <span className="attendance-section-title">{type}</span>
                <span className={`status-badge status-${status}`}>
                    {percentage}%
                </span>
            </div>
            <div className="attendance-section-stats">
                <span>{attended} / {total} classes</span>
                {missingCount > 0 && (
                    <span className="missing-indicator">
                        • {missingCount} not recorded
                    </span>
                )}
            </div>
        </div>
    )
}

export default function SubjectsPage() {
    const { subjects, getRecordsForSubject, attendanceRecords, loading, deleteSubject } = useAttendance()

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Subjects</h1>
                <p className="page-date">View attendance history for each subject</p>
            </div>

            {subjects.length === 0 ? (
                <div className="empty-state">
                    <p>No subjects yet. Add subjects from the Today page!</p>
                </div>
            ) : (
                subjects.map((subject) => (
                    <div key={subject.id} className="subject-card">
                        <div className="subject-header">
                            <h3 className="subject-name">{subject.name}</h3>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                    if (confirm('Delete this subject? All attendance records will be lost.')) {
                                        deleteSubject(subject.id)
                                    }
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <TypeStats
                            subjectId={subject.id}
                            type="theory"
                            getRecordsForSubject={getRecordsForSubject}
                            allRecords={attendanceRecords}
                        />

                        <TypeStats
                            subjectId={subject.id}
                            type="practical"
                            getRecordsForSubject={getRecordsForSubject}
                            allRecords={attendanceRecords}
                        />

                        <div className="subject-actions" style={{ marginTop: 'var(--spacing-md)' }}>
                            <Link
                                to={`/history/${subject.id}`}
                                className="btn btn-ghost"
                            >
                                View History
                            </Link>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
