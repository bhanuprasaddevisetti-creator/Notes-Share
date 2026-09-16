import { Link } from 'react-router-dom'

export default function TopBar({ profile }) {
  return (
    <header
      style={{
        borderBottom: '1.5px solid var(--line)',
        background: 'var(--paper-raised)',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: '64px',
        padding: '0 1.5rem',
      }}
    >
      <Link
        to="/profile"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          textDecoration: 'none',
          color: 'var(--ink)',
        }}
      >
        <span
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--mustard)',
            border: '1.5px solid var(--mustard-deep)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          {profile?.full_name?.[0]?.toUpperCase() || '?'}
        </span>
        <img src="/logo.svg" alt="" width="24" height="24" />
        <span style={{ fontWeight: 500 }}>{profile?.full_name || 'Your profile'}</span>
        {profile?.verified && <span className="tag verified">verified</span>}
      </Link>
    </header>
  )
}
