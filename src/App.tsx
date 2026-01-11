import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import TodayPage from './pages/TodayPage'
import SubjectsPage from './pages/SubjectsPage'
import HistoryPage from './pages/HistoryPage'
import TasksPage from './pages/TasksPage'
import LookupPage from './pages/LookupPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/auth" replace />
    }

    return <>{children}</>
}

function AppLayout() {
    const { signOut } = useAuth()

    return (
        <div className="app-container">
            <nav className="nav">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Today
                </NavLink>
                <NavLink to="/subjects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Subjects
                </NavLink>
                <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Tasks
                </NavLink>
                <NavLink to="/lookup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Lookup
                </NavLink>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={signOut}
                    style={{ marginLeft: 'auto' }}
                >
                    Logout
                </button>
            </nav>

            <Routes>
                <Route path="/" element={<TodayPage />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/history/:subjectId" element={<HistoryPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/lookup" element={<LookupPage />} />
            </Routes>
        </div>
    )
}

function AppRoutes() {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return (
        <Routes>
            <Route
                path="/auth"
                element={user ? <Navigate to="/" replace /> : <AuthPage />}
            />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    )
}
