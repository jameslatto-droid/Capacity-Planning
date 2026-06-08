import { type CSSProperties, type FormEvent, useState } from 'react'
import { motion } from 'motion/react'
import { PRESET_USERS } from '../../utils/auth'
import { useAuth } from '../../utils/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const [userId, setUserId] = useState<string>(PRESET_USERS[0]?.id ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (login(userId, password)) {
      setError('')
      setPassword('')
      return
    }
    setError('Invalid user or password')
  }

  const pageStyle = {
    '--login-bg-url': `url("${import.meta.env.BASE_URL}assets/WWTP.png")`,
  } as CSSProperties

  return (
    <div className="login-page" style={pageStyle}>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="login-card"
      >
        <div className="login-header">
          <h1 className="login-title">Resource Planner</h1>
          <p className="login-subtitle">Sign in to manage capacity, allocation and project demand.</p>
        </div>

        <div className="login-fields">
          <label className="login-field">
            <span className="login-label">User</span>
            <select
              className="login-input"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            >
              {PRESET_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="login-field">
            <span className="login-label">Password</span>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button">
            Sign in
          </button>
        </div>
      </motion.form>
    </div>
  )
}
