import { useState } from 'react'
import { getFileUrl, castVote, deleteNote } from '../lib/notes'
import EditNoteModal from './EditNoteModal'

export default function NoteCard({ note, currentUserId, isAdmin, onVoted, onDeleted, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const canEdit = isAdmin || note.uploader_id === currentUserId

  async function vote(value) {
    if (!currentUserId) return
    await castVote(note.id, currentUserId, value)
    onVoted?.()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${note.title}"? This can't be undone.`)) return
    await deleteNote(note.id)
    onDeleted?.()
  }

  return (
    <div className="card" style={{ display: 'flex', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          minWidth: '40px',
        }}
      >
        <button
          onClick={() => vote(1)}
          style={{ padding: '0.2em 0.5em', boxShadow: 'none', border: 'none', fontSize: '1.1rem' }}
          aria-label="Upvote"
        >
          ▲
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{note.score ?? 0}</span>
        <button
          onClick={() => vote(-1)}
          style={{ padding: '0.2em 0.5em', boxShadow: 'none', border: 'none', fontSize: '1.1rem' }}
          aria-label="Downvote"
        >
          ▼
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>{note.subject}</h3>
          <span className="tag" style={{ borderColor: 'var(--line)', color: 'var(--charcoal-soft)' }}>
            {note.title}
          </span>
        </div>
        <p className="hint-text" style={{ margin: '0.3em 0' }}>
          {note.colleges?.name} · {note.year}
        </p>
        {note.description && <p style={{ margin: '0.4em 0' }}>{note.description}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
          <a href={getFileUrl(note.file_path)} target="_blank" rel="noreferrer">
            <button style={{ padding: '0.4em 1em' }}>Open file</button>
          </a>
          <span className="hint-text">
            uploaded by {note.profiles?.full_name || 'a student'}
            {note.profiles?.verified && (
              <span className="tag verified" style={{ marginLeft: '0.4em' }}>
                verified
              </span>
            )}
          </span>
          {canEdit && (
            <button onClick={() => setEditing(true)} className="ghost" style={{ marginLeft: 'auto' }}>
              Edit
            </button>
          )}
          {isAdmin && (
            <button onClick={handleDelete} className="ghost" style={{ color: 'var(--rust)' }}>
              Delete
            </button>
          )}
        </div>
      </div>

      {editing && (
        <EditNoteModal
          note={note}
          currentUserId={currentUserId}
          onClose={() => setEditing(false)}
          onSaved={onUpdated}
        />
      )}
    </div>
  )
}
