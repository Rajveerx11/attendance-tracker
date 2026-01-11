import { useParams, Link } from 'react-router-dom'
import { useAttendance } from '../hooks/useAttendance'
import { formatDate, getDayOfWeek, AttendanceStatus } from '../utils/attendanceCalc'

export default function HistoryPage() {
    const { subjectId } = useParams<{ subjectId: string }>()
    const { subjects, getRecordsForSubject, loading } = useAttendance()

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    const subject = subjects.find(s => s.id === subjectId)

    if (!subject) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Subject Not Found</h1>
                </div>
                <Link to="/" className="btn btn-ghost">← Back to Today</Link>
            </div>
        )
    }

    const records = getRecordsForSubject(subject.id)

    const getStatusLabel = (status: AttendanceStatus) => {
        switch (status) {
            case 'present': return 'Present'
            case 'absent': return 'Absent'
            case 'no_class': return 'No Class'
        }
    }

    const getStatusClass = (status: AttendanceStatus) => {
        switch (status) {
            case 'present': return 'safe'
            case 'absent': return 'danger'
            case 'no_class': return 'muted'
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{subject.name} - History</h1>
                <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                    ← Back to Today
                </Link>
            </div>

            {records.length === 0 ? (
                <div className="empty-state">
                    <p>No attendance records yet.</p>
                </div>
            ) : (
                <div className="card">
                    <ul className="history-list">
                        {records.map((record) => (
                            <li key={record.id} className="history-item">
                                <div>
                                    <div className="history-date">{formatDate(record.date)}</div>
                                    <div className="history-day">{getDayOfWeek(record.date)}</div>
                                </div>
                                <div className="history-type-status">
                                    <span className="history-type">
                                        {record.attendance_type.charAt(0).toUpperCase() + record.attendance_type.slice(1)}
                                    </span>
                                    <span className={`status-badge status-${getStatusClass(record.status)}`}>
                                        {getStatusLabel(record.status)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
