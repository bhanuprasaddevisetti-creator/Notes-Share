import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  uploadNoteFile,
  createNote,
  hashFile,
  findDuplicateByHash,
  findSimilarNotes,
} from '../lib/notes'

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate']
const LARGE_FILE_MB = 10

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
  const [warning, setWarning] = useState(null) // { type, duplicate?, similar? }
  const [fileHash, setFileHash] = useState(null)

  const fileSizeMb = file ? file.size / (1024 * 1024) : 0
  const isLargeFile = fileSizeMb > LARGE_FILE_MB

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e) {
    setFile(e.target.files[0])
    setWarning(null)
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
      setFileHash(hash)

      // First: is this exact file already here? (strongest signal)
      const exactMatch = await findDuplicateByHash(hash)
      if (exactMatch) {
        setWarning({ type: 'duplicate', duplicate: exactMatch })
        setStatus({ loading: false, error: '' })
        return
      }

      // Second: are there already notes for this same subject + unit at this college?
      const similar = await findSimilarNotes({
        collegeId: profile.college_id,
        subject: form.subject,
        title: form.title,
        year: form.year,
      })
      if (similar.sameSubject.length > 0) {
        setWarning({ type: 'similar', similar })
        setStatus({ loading: false, error: '' })
        return
      }

      await doUpload(hash)
    } catch (err) {
      setStatus({ loading: false, error: err.message })
    }
  }

  function confirmUploadAnyway() {
    setWarning(null)
    doUpload(fileHash)
  }

  return (
    <div className="container" style={{ maxWidth: '520px', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>Upload notes</h1>
      <p>Share one file at a time — a scanned PDF, photos, or a document works fine.</p>

      <div className="card">
        {warning?.type === 'duplicate' ? (
          <div>
            <h3 style={{ marginTop: 0 }}>This exact file already exists</h3>
            <p>
              An identical file was already uploaded as <strong>{warning.duplicate.title}</strong>
              {warning.duplicate.colleges?.name && <> for {warning.duplicate.colleges.name}</>}
              {warning.duplicate.profiles?.full_name && <>, by {warning.duplicate.profiles.full_name}</>}.
            </p>
            <p className="hint-text">
              Uploading it again would just take up storage. Cancel and search for the existing one,
              unless you have a reason to keep both.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={confirmUploadAnyway} disabled={status.loading}>
                {status.loading ? 'Uploading…' : 'Upload anyway'}
              </button>
              <button className="ghost" onClick={() => setWarning(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : warning?.type === 'similar' ? (
          <div>
            <h3 style={{ marginTop: 0 }}>
              {warning.similar.sameUnit.length > 0
                ? 'Notes for this unit already exist'
                : 'Notes for this subject already exist'}
            </h3>
            <p>
              {warning.similar.sameSubject.length} note
              {warning.similar.sameSubject.length === 1 ? '' : 's'} already uploaded for{' '}
              <strong>{form.subject}</strong> ({form.year}) at your college:
            </p>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--charcoal-soft)' }}>
              {warning.similar.sameSubject.map((n, i) => (
                <li key={i}>
                  {n.title}
                  {n.profiles?.full_name && <> — {n.profiles.full_name}</>}
                </li>
              ))}
            </ul>
            <p className="hint-text">
              That's fine if yours covers something different or is better quality — multiple sets of
              notes for one unit are often useful. Just worth a look first.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="primary" onClick={confirmUploadAnyway} disabled={status.loading}>
                {status.loading ? 'Uploading…' : 'Upload mine anyway'}
              </button>
              <button className="ghost" onClick={() => setWarning(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="title">Unit / title</label>
              <input
                id="title"
                required
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Unit 3 — Normalization"
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
              {file && (
                <p className="hint-text" style={{ marginTop: '0.3em' }}>
                  {fileSizeMb.toFixed(1)} MB
                </p>
              )}
              {isLargeFile && (
                <p style={{ color: 'var(--rust)', fontSize: '0.85rem', marginTop: '0.3em' }}>
                  This file is fairly large. Compressing it first (try ilovepdf.com/compress-pdf)
                  keeps NOTE-X's storage free for longer — but you can upload it as is.
                </p>
              )}
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
