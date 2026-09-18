import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import PublicHeader from './components/PublicHeader'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import AdminDashboard from './pages/AdminDashboard'
import SubAdminDashboard from './pages/SubAdminDashboard'
import Profile from './pages/Profile'
import Home from './pages/Home'

function AppShell({ session, profile }) {
  const location = useLocation()
  const isPublicPage = location.pathname === '/' || location.pathname === '/auth'

  if (session && !isPublicPage) {
    // Logged-in layout: sidebar on the left, minimal top bar, page content on the right.
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar profile={profile} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TopBar profile={profile} />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/home" element={<Home profile={profile} />} />
              <Route path="/browse" element={<Dashboard profile={profile} />} />
              <Route path="/upload" element={<Upload profile={profile} />} />
              <Route path="/profile" element={<Profile session={session} profile={profile} />} />
              <Route
                path="/admin"
                element={
                  profile?.is_admin ? (
                    <AdminDashboard />
                  ) : profile?.is_subadmin ? (
                    <SubAdminDashboard />
                  ) : (
                    <Navigate to="/home" replace />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    )
  }

  // Logged-out layout: simple header, public pages only.
  return (
    <>
      <PublicHeader session={session} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing session={session} />} />
          <Route path="/auth" element={session ? <Navigate to="/home" replace /> : <Auth />} />
          <Route path="*" element={<Navigate to={session ? '/home' : '/'} replace />} />
        </Routes>
      </main>
    </>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bannedMessage, setBannedMessage] = useState('')

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
      .then(async ({ data }) => {
        if (data?.banned) {
          setBannedMessage('Your account has been suspended. Contact the site admin if you think this is a mistake.')
          await supabase.auth.signOut()
          setProfile(null)
          return
        }
        setProfile(data)
      })
  }, [session])

  if (loading) return null

  if (bannedMessage) {
    return (
      <div className="container" style={{ paddingTop: '4rem', maxWidth: '480px' }}>
        <h1 style={{ fontSize: '1.6rem' }}>Account suspended</h1>
        <p>{bannedMessage}</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppShell session={session} profile={profile} />
    </BrowserRouter>
  )
}

export default App
