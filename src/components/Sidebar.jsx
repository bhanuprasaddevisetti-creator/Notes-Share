import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ profile }) {
  const location = useLocation()

  const links = [
    { to: '/browse', label: 'Browse' },
    { to: '/upload', label: 'Upload notes' },
  ]
  if (profile?.is_admin) links.push({ to: '/admin', label: 'Admin' })

  return (
    <aside
      style={{
        width: '200px',
        flexShrink: 0,
        borderRight: '1.5px solid var(--line)',
        background: 'var(--paper-raised)',
        minHeight: '100vh',
        padding: '1.5rem 1rem',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'block',
          fontFamily: 'var(--font-head)',
          fontWeight: 700,
          fontSize: '1.3rem',
          color: 'var(--ink)',
          textDecoration: 'none',
          marginBottom: '2rem',
          padding: '0 0.4rem',
        }}
      >
        NOTE-X
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {links.map((link) => {
          const active = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: 'none',
                color: active ? 'var(--ink)' : 'var(--ink-soft)',
                background: active ? 'var(--paper)' : 'transparent',
                fontWeight: active ? 600 : 500,
                padding: '0.55em 0.7em',
                borderRadius: 'var(--radius)',
                border: active ? '1.5px solid var(--line)' : '1.5px solid transparent',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
