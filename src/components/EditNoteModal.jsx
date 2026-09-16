import { useState } from 'react'
import Modal from './Modal'
import { updateNote, uploadNoteFile, deleteNoteFile, hashFile } from '../lib/notes'

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate']

export default function EditNoteModal({ note, currentUserId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: note.title,
    subject: note.subject,
    year: note.year,
    description: note.description || '',
  })
  const [newFile, setNewFile] = useState(null)
  const [status, setStatus] = useState({ loading: false, error: '' })

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus({ loading: true, error: '' })
    try {
      let filePath = null
      let fileHash = null
      if (newFile) {
        fileHash = await hashFile(newFile)
        filePath = await uploadNoteFile(newFile, currentUserId)
      }

      await updateNote(note.id, { ...form, filePath, fileHash })

      // Clean up the old file only after the note record points at the new one.
      if (filePath && note.file_path) {
        deleteNoteFile(note.file_path)
      }

      onSaved?.()
      onClose()
    } catch (err) {
      setStatus({ loading: false, error: err.message })
    }
  }

  return (
    <Modal title="Edit note" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="edit-title">Title</label>
          <input id="edit-title" required value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="edit-subject">Subject</label>
          <input id="edit-subject" required value={form.subject} onChange={(e) => update('subject', e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="edit-year">Year</label>
          <select id="edit-year" value={form.year} onChange={(e) => update('year', e.target.value)}>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="edit-description">Description</label>
          <textarea
            id="edit-description"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="edit-file">Replace file (optional)</label>
          <input id="edit-file" type="file" onChange={(e) => setNewFile(e.target.files[0])} />
          <p className="hint-text" style={{ marginTop: '0.3em' }}>
            Leave empty to keep the current file.
          </p>
        </div>

        {status.error && <p className="error-text">{status.error}</p>}

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="primary" type="submit" disabled={status.loading}>
            {status.loading ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
