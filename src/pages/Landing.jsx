import { Link } from 'react-router-dom'

export default function Landing({ session }) {
  return (
    <>
      <section className="container" style={{ paddingTop: '4.5rem', paddingBottom: '3rem' }}>
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
          <h1>Find last semester's DBMS notes in ten seconds, not ten scrolls.</h1>
          <p style={{ fontSize: '1.05rem' }}>
            Your college already shares notes — just scattered across chats nobody can search.
            Shelf puts them in one place: pick your college, your year, your subject, and see
            what your seniors already uploaded.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.6rem' }}>
            <Link to={session ? '/browse' : '/auth'}>
              <button className="primary">
                {session ? 'Browse notes' : 'Get started'}
              </button>
            </Link>
            <Link to={session ? '/upload' : '/auth'}>
              <button>Upload a note</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.2rem',
          }}
        >
          <div className="card">
            <h3>1. Pick your shelf</h3>
            <p>College, year, subject — three taps and you're looking at the right stack.</p>
          </div>
          <div className="card">
            <h3>2. Skip the junk</h3>
            <p>
              Notes get upvoted by classmates who actually used them, so the good ones rise to
              the top.
            </p>
          </div>
          <div className="card">
            <h3>3. Give a little back</h3>
            <p>Have notes worth sharing? Upload once — your whole year benefits from it.</p>
          </div>
        </div>
      </section>
    </>
  )
}
