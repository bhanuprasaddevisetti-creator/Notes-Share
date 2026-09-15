import { Link } from 'react-router-dom'

export default function PublicHeader() {
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
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            fontSize: '1.3rem',
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          NOTE-X
        </Link>
        <Link to="/auth">
          <button className="primary">Sign in</button>
        </Link>
      </div>
    </header>
  )
}
