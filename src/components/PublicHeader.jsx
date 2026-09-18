import { Link } from 'react-router-dom'

export default function PublicHeader({ session }) {
  return (
    <header
      style={{
        borderBottom: '1.5px solid var(--line)',
        background: 'var(--paper-raised)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            fontSize: '1.3rem',
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          <img src="/logo.svg" alt="" width="28" height="28" />
          NOTE-X
        </Link>
        <Link to={session ? '/home' : '/auth'}>
          <button className="primary">{session ? 'Continue to NOTE-X' : 'Sign in'}</button>
        </Link>
      </div>
    </header>
  )
}
