import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    supabase
      .from('profiles')
      .select('*, colleges(name, domain)')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session])

  if (loading) return null

  return (
    <BrowserRouter>
      <Navbar session={session} profile={profile} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing session={session} />} />
          <Route
            path="/auth"
            element={session ? <Navigate to="/browse" replace /> : <Auth />}
          />
          <Route
            path="/browse"
            element={session ? <Dashboard profile={profile} /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/upload"
            element={session ? <Upload profile={profile} /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/admin"
            element={
              profile?.is_admin ? <AdminDashboard /> : <Navigate to={session ? '/browse' : '/auth'} replace />
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
