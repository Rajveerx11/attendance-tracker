import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AttendanceType, AttendanceStatus, getDayOfWeek, formatDate } from '../utils/attendanceCalc'

interface Subject {
    id: string
    name: string
}

type LookupResult = AttendanceStatus | 'not_recorded'

interface RecordInfo {
    id: string
    status: AttendanceStatus
}

/**
 * READ-ONLY date-wise attendance lookup
 * Returns record ID if exists (for editing)
 */
async function lookupAttendance(
    subjectId: string,
    date: string,
    attendanceType: AttendanceType
): Promise<{ result: LookupResult; recordInfo: RecordInfo | null; error: string | null }> {
    const { data, error } = await supabase
        .from('attendance_records')
        .select('id, status')
        .eq('subject_id', subjectId)
        .eq('date', date)
        .eq('attendance_type', attendanceType)
        .maybeSingle()

    if (error) {
        return { result: 'not_recorded', recordInfo: null, error: error.message }
    }

    if (!data) {
        return { result: 'not_recorded', recordInfo: null, error: null }
    }

    return {
        result: data.status as AttendanceStatus,
        recordInfo: { id: data.id, status: data.status as AttendanceStatus },
        error: null
    }
}

/**
 * Edit existing attendance record
 * Uses delete + insert pattern to respect unique constraint
 * ONLY works if record exists
 */
async function editAttendance(
    recordId: string,
    subjectId: string,
    date: string,
    attendanceType: AttendanceType,
    newStatus: AttendanceStatus
): Promise<{ error: string | null }> {
    // Delete existing record
    const { error: deleteError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', recordId)

    if (deleteError) {
        return { error: `Delete failed: ${deleteError.message}` }
    }

    // Insert new record with updated status
    const { error: insertError } = await supabase
        .from('attendance_records')
        .insert({
            subject_id: subjectId,
            date: date,
            attendance_type: attendanceType,
            status: newStatus
        })

    if (insertError) {
        return { error: `Insert failed: ${insertError.message}` }
    }

    return { error: null }
}

export default function LookupPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [selectedSubject, setSelectedSubject] = useState<string>('')
    const [selectedType, setSelectedType] = useState<AttendanceType>('theory')
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [result, setResult] = useState<LookupResult | null>(null)
    const [recordInfo, setRecordInfo] = useState<RecordInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [subjectsLoading, setSubjectsLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [editLoading, setEditLoading] = useState(false)

    // Fetch subjects on mount
    useEffect(() => {
        const fetchSubjects = async () => {
            const { data, error } = await supabase
                .from('subjects')
                .select('id, name')
                .order('created_at', { ascending: true })

            if (error) {
                setError(error.message)
            } else {
                setSubjects(data || [])
                if (data && data.length > 0) {
                    setSelectedSubject(data[0].id)
                }
            }
            setSubjectsLoading(false)
        }
        fetchSubjects()
    }, [])

    const handleLookup = async () => {
        if (!selectedSubject || !selectedDate) {
            setError('Please select a subject and date')
            return
        }

        setLoading(true)
        setError(null)
        setResult(null)
        setRecordInfo(null)
        setEditMode(false)

        const { result, recordInfo, error } = await lookupAttendance(
            selectedSubject,
            selectedDate,
            selectedType
        )

        if (error) {
            setError(error)
        } else {
            setResult(result)
            setRecordInfo(recordInfo)
        }
        setLoading(false)
    }

    const handleEdit = async (newStatus: AttendanceStatus) => {
        if (!recordInfo || !selectedSubject || !selectedDate) {
            setError('Cannot edit: no existing record found')
            return
        }

        // Require confirmation
        const oldStatus = recordInfo.status
        const confirmMessage = `Change attendance from "${oldStatus}" to "${newStatus}"?\n\nSubject: ${selectedSubjectName}\nDate: ${formatDate(selectedDate)}\nType: ${selectedType}`

        if (!confirm(confirmMessage)) {
            return
        }

        setEditLoading(true)
        setError(null)

        const { error } = await editAttendance(
            recordInfo.id,
            selectedSubject,
            selectedDate,
            selectedType,
            newStatus
        )

        if (error) {
            setError(error)
        } else {
            // Refresh lookup to show updated state
            await handleLookup()
        }

        setEditLoading(false)
        setEditMode(false)
    }

    const getResultDisplay = (r: LookupResult) => {
        switch (r) {
            case 'present':
                return { label: 'Present', className: 'status-safe', icon: '✓' }
            case 'absent':
                return { label: 'Absent', className: 'status-danger', icon: '✗' }
            case 'no_class':
                return { label: 'No Class', className: 'status-muted', icon: '—' }
            case 'not_recorded':
                return { label: 'Not Recorded', className: 'status-not-recorded', icon: '?' }
        }
    }

    const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || ''

    if (subjectsLoading) {
        return <div className="loading">Loading...</div>
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Attendance Lookup</h1>
                <p className="page-date">Check or edit attendance for a specific date</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="card">
                <div className="lookup-form">
                    {/* Subject Selector */}
                    <div className="form-group">
                        <label className="form-label">Subject</label>
                        <select
                            className="form-input"
                            value={selectedSubject}
                            onChange={(e) => {
                                setSelectedSubject(e.target.value)
                                setResult(null)
                                setRecordInfo(null)
                                setEditMode(false)
                            }}
                        >
                            {subjects.length === 0 ? (
                                <option value="">No subjects available</option>
                            ) : (
                                subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Attendance Type Selector */}
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <div className="type-toggle">
                            <button
                                type="button"
                                className={`type-btn ${selectedType === 'theory' ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedType('theory')
                                    setResult(null)
                                    setRecordInfo(null)
                                    setEditMode(false)
                                }}
                            >
                                Theory
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${selectedType === 'practical' ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedType('practical')
                                    setResult(null)
                                    setRecordInfo(null)
                                    setEditMode(false)
                                }}
                            >
                                Practical
                            </button>
                        </div>
                    </div>

                    {/* Date Picker */}
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value)
                                setResult(null)
                                setRecordInfo(null)
                                setEditMode(false)
                            }}
                        />
                    </div>

                    {/* Lookup Button */}
                    <button
                        className="btn btn-primary"
                        onClick={handleLookup}
                        disabled={loading || !selectedSubject || !selectedDate}
                        style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
                    >
                        {loading ? 'Looking up...' : 'Look Up Attendance'}
                    </button>
                </div>
            </div>

            {/* Result Display */}
            {result !== null && (
                <div className="card lookup-result">
                    <div className="lookup-result-header">
                        <div className="lookup-result-subject">{selectedSubjectName}</div>
                        <div className="lookup-result-type">{selectedType}</div>
                    </div>
                    <div className="lookup-result-date">
                        <div className="lookup-date-main">{formatDate(selectedDate)}</div>
                        <div className="lookup-date-day">{getDayOfWeek(selectedDate)}</div>
                    </div>
                    <div className="lookup-result-status">
                        <span className={`lookup-status-badge ${getResultDisplay(result).className}`}>
                            <span className="lookup-status-icon">{getResultDisplay(result).icon}</span>
                            {getResultDisplay(result).label}
                        </span>
                    </div>

                    {/* Edit Controls - Only show if record exists */}
                    {recordInfo && !editMode && (
                        <div className="edit-controls">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setEditMode(true)}
                            >
                                ✎ Edit
                            </button>
                        </div>
                    )}

                    {/* Edit Mode - Show status options */}
                    {recordInfo && editMode && (
                        <div className="edit-panel">
                            <div className="edit-panel-title">Change status to:</div>
                            <div className="edit-options">
                                {(['present', 'absent', 'no_class'] as AttendanceStatus[])
                                    .filter(s => s !== recordInfo.status)
                                    .map(status => (
                                        <button
                                            key={status}
                                            className={`btn btn-sm ${status === 'present' ? 'btn-success' :
                                                    status === 'absent' ? 'btn-danger' :
                                                        'btn-ghost'
                                                }`}
                                            onClick={() => handleEdit(status)}
                                            disabled={editLoading}
                                        >
                                            {status === 'present' ? 'Present' :
                                                status === 'absent' ? 'Absent' :
                                                    'No Class'}
                                        </button>
                                    ))
                                }
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setEditMode(false)}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cannot edit message for not recorded */}
                    {result === 'not_recorded' && (
                        <div className="no-edit-message">
                            Cannot edit: No record exists for this date.
                            <br />
                            <span className="no-edit-hint">Use the Today page to create new records.</span>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {result === null && !loading && selectedDate && (
                <div className="empty-state">
                    <p>Click "Look Up Attendance" to check the record</p>
                </div>
            )}
        </div>
    )
}
