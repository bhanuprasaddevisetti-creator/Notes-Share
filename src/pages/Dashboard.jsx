import { useEffect, useState, useCallback } from 'react'
import { fetchColleges } from '../lib/colleges'
import { fetchNotes } from '../lib/notes'
import NoteCard from '../components/NoteCard'

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate']

export default function Dashboard({ profile }) {
  const [colleges, setColleges] = useState([])
  const [collegeId, setCollegeId] = useState('')
  const [year, setYear] = useState('')
  const [subject, setSubject] = useState('')
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchColleges().then(setColleges).catch(() => {})
  }, [])

  // Default the filter to the signed-in student's own college once we know it.
  useEffect(() => {
    if (profile?.college_id) setCollegeId(profile.college_id)
  }, [profile])

  const runSearch = useCallback(() => {
    setLoading(true)
    setError('')
    fetchNotes({ collegeId, year, subject })
      .then(setNotes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [collegeId, year, subject])

  useEffect(() => {
    runSearch()
  }, [runSearch])

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>Browse notes</h1>
      <p>Filter by college, year, and subject to find what your classmates already shared.</p>

      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.6rem',
        }}
      >
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="collegeFilter">College</label>
          <select id="collegeFilter" value={collegeId} onChange={(e) => setCollegeId(e.target.value)}>
            <option value="">All colleges</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="yearFilter">Year</label>
          <select id="yearFilter" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Any year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="subjectFilter">Subject</label>
          <input
            id="subjectFilter"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. DBMS"
          />
        </div>
      </div>

      {loading && <p>Loading notes…</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && notes.length === 0 && (
        <div className="card">
          <h3>Nothing here yet</h3>
          <p>No notes match these filters yet. Be the first to upload for this subject.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            currentUserId={profile?.id}
            isAdmin={profile?.is_admin}
            onVoted={runSearch}
            onDeleted={runSearch}
          />
        ))}
      </div>
    </div>
  )
}
