import { Link } from 'react-router-dom'

export default function Landing({ session }) {
  return (
    <section className="container" style={{ paddingTop: '4.5rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '640px' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--charcoal-soft)',
            fontSize: '0.85rem',
            marginBottom: '0.6em',
          }}
        >
          for every WhatsApp group that ever buried a PDF
        </p>
        <h1>Find last semester's notes in ten seconds, not ten scrolls.</h1>
        <p style={{ fontSize: '1.05rem' }}>
          Your college already shares notes — just scattered across chats nobody can search.
          NOTE-X puts every subject in one place, organized by college, year, and subject.
        </p>
        <p className="hint-text">Sign in to browse what your seniors already uploaded.</p>

        <div style={{ marginTop: '1.6rem' }}>
          <Link to={session ? '/home' : '/auth'}>
            <button className="primary">{session ? 'Go to NOTE-X' : 'Sign in to get started'}</button>
          </Link>
        </div>
      </div>
    </section>
  )
}
