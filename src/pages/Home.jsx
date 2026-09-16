import { Link } from 'react-router-dom'

export default function Home({ profile }) {
  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', maxWidth: '640px' }}>
      <h1 style={{ fontSize: '1.9rem' }}>
        Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
      </h1>
      <p style={{ fontSize: '1.05rem' }}>
        NOTE-X is where your college's notes actually live — instead of scattered across
        WhatsApp groups nobody can search. Pick a subject, find what your classmates already
        shared, and upload your own when you have something worth passing on.
      </p>
      <p>
        Notes are organized by college, year, and subject, and the ones your classmates find
        most useful rise to the top through upvotes. Verified accounts (signed up with a real
        college email) are marked so you know where a note is coming from.
      </p>

      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.6rem' }}>
        <Link to="/browse">
          <button className="primary">Browse notes</button>
        </Link>
        <Link to="/upload">
          <button>Upload a note</button>
        </Link>
      </div>
    </div>
  )
}
