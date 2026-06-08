import { type FormEvent, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-s)', boxShadow: '0 18px 60px rgba(0,0,0,0.12)' }}
      >
        <div className="mb-6">
          <div className="gradient-text text-lg font-bold tracking-tight">Resource Planner</div>
          <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Sign in to identify your changes.
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Select
            label="User"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            options={PRESET_USERS.map((user) => ({ value: user.id, label: user.displayName }))}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
          {error && <div className="text-xs text-red-500">{error}</div>}
          <Button type="submit" variant="primary" className="justify-center mt-1">
            Sign in
          </Button>
        </div>
      </motion.form>
    </div>
  )
}
