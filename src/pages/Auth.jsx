import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { fetchColleges, findOrCreateCollege } from '../lib/colleges'
import { emailMatchesCollege } from '../lib/collegeEmail'

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate']

export default function Auth() {
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [colleges, setColleges] = useState([])
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    college: '',
    year: YEARS[0],
  })
  const [status, setStatus] = useState({ loading: false, error: '', message: '' })
  const navigate = useNavigate()

  useEffect(() => {
    fetchColleges().then(setColleges).catch(() => {})
  }, [])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleLogin(e) {
    e.preventDefault()
    setStatus({ loading: true, error: '', message: '' })
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (error) {
      setStatus({ loading: false, error: error.message, message: '' })
      return
    }
    navigate('/browse')
  }

  async function handleSignup(e) {
    e.preventDefault()
    setStatus({ loading: true, error: '', message: '' })

    if (!form.college.trim()) {
      setStatus({ loading: false, error: 'Enter your college name.', message: '' })
      return
    }

    try {
      const emailDomain = form.email.split('@')[1]?.toLowerCase()
      const college = await findOrCreateCollege(form.college, emailDomain)
      const verified = emailMatchesCollege(form.email, college.domain)

      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            college_id: college.id,
            year: form.year,
            verified,
          },
        },
      })

      if (error) throw error

      setStatus({
        loading: false,
        error: '',
        message: verified
          ? 'Check your inbox to confirm your email — your account will be marked as verified since it matches your college domain.'
          : `Check your inbox to confirm your email. Note: this email doesn't match ${college.name}'s registered domain (${college.domain || 'not set yet'}), so your account will show as self-declared, not verified.`,
      })
    } catch (err) {
      setStatus({ loading: false, error: err.message, message: '' })
    }
  }

  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
      <p>
        {mode === 'signup'
          ? 'Sign up with your college email if you have one — it gets your account verified automatically.'
          : 'Sign in to browse and upload notes.'}
      </p>

      <div className="card">
        <form onSubmit={mode === 'signup' ? handleSignup : handleLogin}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                required
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="e.g. Priya Sharma"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@college.ac.in"
            />
            {mode === 'signup' && (
              <p className="hint-text" style={{ marginTop: '0.3em' }}>
                Using your official college email gets you a verified badge.
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {mode === 'signup' && (
            <>
              <div className="field">
                <label htmlFor="college">College name</label>
                <input
                  id="college"
                  list="college-list"
                  required
                  value={form.college}
                  onChange={(e) => update('college', e.target.value)}
                  placeholder="Start typing your college..."
                />
                <datalist id="college-list">
                  {colleges.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
                <p className="hint-text" style={{ marginTop: '0.3em' }}>
                  Not listed? Just type the full name — it'll be added.
                </p>
              </div>

              <div className="field">
                <label htmlFor="year">Year of study</label>
                <select id="year" value={form.year} onChange={(e) => update('year', e.target.value)}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {status.error && <p className="error-text">{status.error}</p>}
          {status.message && (
            <p className="hint-text" style={{ color: 'var(--sage)', marginTop: '0.5em' }}>
              {status.message}
            </p>
          )}

          <button className="primary" type="submit" disabled={status.loading} style={{ width: '100%', marginTop: '0.6rem' }}>
            {status.loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '1.2rem', textAlign: 'center' }}>
        {mode === 'signup' ? 'Already have an account?' : "Don't have an account yet?"}{' '}
        <button
          className="ghost"
          type="button"
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : 'signup')
            setStatus({ loading: false, error: '', message: '' })
          }}
        >
          {mode === 'signup' ? 'Sign in' : 'Sign up'}
        </button>
      </p>
    </div>
  )
}
