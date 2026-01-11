import { useState, useEffect, FormEvent } from 'react'
import { supabase } from '../lib/supabase'

interface Task {
    id: string
    user_id: string
    title: string
    completed: boolean
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [error, setError] = useState<string | null>(null)

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            setError(error.message)
            return
        }
        setTasks(data || [])
    }

    useEffect(() => {
        const loadTasks = async () => {
            setLoading(true)
            await fetchTasks()
            setLoading(false)
        }
        loadTasks()
    }, [])

    const handleAddTask = async (e: FormEvent) => {
        e.preventDefault()
        if (!newTaskTitle.trim()) return

        setError(null)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('Not authenticated')
            return
        }

        const { error } = await supabase
            .from('tasks')
            .insert({ title: newTaskTitle.trim(), user_id: user.id })

        if (error) {
            setError(error.message)
            return
        }

        setNewTaskTitle('')
        await fetchTasks()
    }

    const handleToggleTask = async (id: string, completed: boolean) => {
        setError(null)
        const { error } = await supabase
            .from('tasks')
            .update({ completed: !completed })
            .eq('id', id)

        if (error) {
            setError(error.message)
            return
        }

        await fetchTasks()
    }

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Tasks</h1>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Add Task Form */}
            <div className="add-section">
                <form className="inline-form" onSubmit={handleAddTask}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Add new task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        Add
                    </button>
                </form>
            </div>

            {/* Task List */}
            {tasks.length === 0 ? (
                <div className="empty-state">
                    <p>No tasks yet. Add your first task above!</p>
                </div>
            ) : (
                <div className="card">
                    {tasks.map((task) => (
                        <div key={task.id} className="task-item">
                            <input
                                type="checkbox"
                                className="task-checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTask(task.id, task.completed)}
                            />
                            <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                                {task.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
