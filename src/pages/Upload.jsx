import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadNoteFile, createNote } from '../lib/notes'

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate']

export default function Upload({ profile }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    subject: '',
    year: profile?.year || YEARS[0],
    description: '',
  })
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState({ loading: false, error: '' })

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) {
      setStatus({ loading: false, error: 'Choose a file to upload.' })
      return
    }
    if (!profile?.college_id) {
      setStatus({ loading: false, error: 'Your profile is missing a college — please contact support.' })
      return
    }

    setStatus({ loading: true, error: '' })
    try {
      const filePath = await uploadNoteFile(file, profile.id)
      await createNote({
        collegeId: profile.college_id,
        year: form.year,
        subject: form.subject,
        title: form.title,
        description: form.description,
        filePath,
        uploaderId: profile.id,
      })
      navigate('/browse')
    } catch (err) {
      setStatus({ loading: false, error: err.message })
    }
  }

  return (
    <div className="container" style={{ maxWidth: '520px', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>Upload notes</h1>
      <p>Share one file at a time — a scanned PDF, photos, or a document works fine.</p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Unit 3 — Normalization, full notes"
            />
          </div>

          <div className="field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              required
              value={form.subject}
              onChange={(e) => update('subject', e.target.value)}
              placeholder="e.g. DBMS"
            />
          </div>

          <div className="field">
            <label htmlFor="year">Year</label>
            <select id="year" value={form.year} onChange={(e) => update('year', e.target.value)}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="What's covered, whose lectures, anything worth knowing"
            />
          </div>

          <div className="field">
            <label htmlFor="file">File</label>
            <input id="file" type="file" required onChange={(e) => setFile(e.target.files[0])} />
          </div>

          {status.error && <p className="error-text">{status.error}</p>}

          <button className="primary" type="submit" disabled={status.loading} style={{ width: '100%' }}>
            {status.loading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  )
}
