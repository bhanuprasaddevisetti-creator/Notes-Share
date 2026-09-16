import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadNoteFile, createNote, hashFile, findDuplicateByHash } from '../lib/notes'

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
  const [duplicate, setDuplicate] = useState(null) // details of a matching file, if found
  const [fileHash, setFileHash] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e) {
    setFile(e.target.files[0])
    setDuplicate(null)
    setFileHash(null)
  }

  async function doUpload(hash) {
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
        fileHash: hash,
        uploaderId: profile.id,
      })
      navigate('/browse')
    } catch (err) {
      setStatus({ loading: false, error: err.message })
    }
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
      const hash = await hashFile(file)
      const match = await findDuplicateByHash(hash)
      if (match) {
        setFileHash(hash)
        setDuplicate(match)
        setStatus({ loading: false, error: '' })
        return
      }
      await doUpload(hash)
    } catch (err) {
      setStatus({ loading: false, error: err.message })
    }
  }

  function confirmUploadAnyway() {
    setDuplicate(null)
    doUpload(fileHash)
  }

  return (
    <div className="container" style={{ maxWidth: '520px', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>Upload notes</h1>
      <p>Share one file at a time — a scanned PDF, photos, or a document works fine.</p>

      <div className="card">
        {duplicate ? (
          <div>
            <h3 style={{ marginTop: 0 }}>This file already exists</h3>
            <p>
              An identical file was already uploaded as <strong>{duplicate.title}</strong>
              {duplicate.colleges?.name && <> for {duplicate.colleges.name}</>}
              {duplicate.profiles?.full_name && <>, by {duplicate.profiles.full_name}</>}.
            </p>
            <p className="hint-text">
              You can still upload it if you have a good reason (e.g. a different subject or year),
              or cancel and search for the existing one instead.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={confirmUploadAnyway} disabled={status.loading}>
                {status.loading ? 'Uploading…' : 'Upload anyway'}
              </button>
              <button className="ghost" onClick={() => setDuplicate(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
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
              <input id="file" type="file" required onChange={handleFileChange} />
            </div>

            {status.error && <p className="error-text">{status.error}</p>}

            <button className="primary" type="submit" disabled={status.loading} style={{ width: '100%' }}>
              {status.loading ? 'Checking file…' : 'Upload'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
