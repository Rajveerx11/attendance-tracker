import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { signIn, signUp } = useAuth()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error } = isLogin
            ? await signIn(email, password)
            : await signUp(email, password)

        if (error) {
            setError(error.message)
        }
        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? (
                        <>
                            Don't have an account?{' '}
                            <span className="auth-link" onClick={() => setIsLogin(false)}>
                                Sign up
                            </span>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <span className="auth-link" onClick={() => setIsLogin(true)}>
                                Sign in
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
