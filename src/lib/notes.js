import { supabase } from '../supabaseClient'

const BUCKET = 'notes-files'

// Fingerprints a file's actual content (not its name) using SHA-256, entirely
// in the browser. Two files with identical content always produce the same
// hash, regardless of filename — this is how duplicate detection works.
export async function hashFile(file) {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Checks if a file with this exact content has already been uploaded anywhere.
export async function findDuplicateByHash(hash) {
  const { data, error } = await supabase
    .from('notes')
    .select('title, colleges(name), profiles(full_name)')
    .eq('file_hash', hash)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

// Checks if a note with the same college + subject + title already exists,
// even if the actual file content differs (e.g. a re-scanned copy).
export async function findDuplicateByMetadata(collegeId, subject, title) {
  const { data, error } = await supabase
    .from('notes')
    .select('title, colleges(name), profiles(full_name)')
    .eq('college_id', collegeId)
    .ilike('subject', subject.trim())
    .ilike('title', title.trim())
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

// Finds notes already uploaded for the same subject (and optionally same title/unit)
// at a given college. Used for a soft "these already exist" heads-up on upload.
export async function findSimilarNotes({ collegeId, subject, title, year }) {
  const { data, error } = await supabase
    .from('notes')
    .select('title, subject, year, profiles(full_name)')
    .eq('college_id', collegeId)
    .ilike('subject', subject.trim())
    .eq('year', year)
    .limit(5)
  if (error) throw error
  if (!data) return { sameSubject: [], sameUnit: [] }

  const normalizedTitle = title.trim().toLowerCase()
  return {
    sameSubject: data,
    sameUnit: data.filter((n) => n.title?.trim().toLowerCase() === normalizedTitle),
  }
}

export async function fetchNotes({ collegeId, year, subject }) {
  let query = supabase
    .from('notes')
    .select('*, profiles(full_name, verified), colleges(name)')
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })

  if (collegeId) query = query.eq('college_id', collegeId)
  if (year) query = query.eq('year', year)
  if (subject) query = query.ilike('subject', `%${subject}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function uploadNoteFile(file, userId) {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${userId}/${Date.now()}-${cleanName}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error
  return path
}

export function getFileUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function createNote({ collegeId, year, subject, title, description, filePath, fileHash, uploaderId }) {
  const { error } = await supabase.from('notes').insert({
    college_id: collegeId,
    year,
    subject,
    title,
    description,
    file_path: filePath,
    file_hash: fileHash,
    uploader_id: uploaderId,
  })
  if (error) throw error
}

export async function updateNote(noteId, { title, subject, year, description, filePath, fileHash }) {
  const updates = { title, subject, year, description }
  if (filePath) {
    updates.file_path = filePath
    updates.file_hash = fileHash
  }
  const { error } = await supabase.from('notes').update(updates).eq('id', noteId)
  if (error) throw error
}

export async function deleteNoteFile(path) {
  // Best-effort cleanup of a replaced file — ignore errors so a failed
  // cleanup never blocks the actual edit from completing.
  try {
    await supabase.storage.from(BUCKET).remove([path])
  } catch (_err) {
    // ignore
  }
}

export async function deleteNote(noteId) {
  const { error } = await supabase.from('notes').delete().eq('id', noteId)
  if (error) throw error
}

// value is 1 (upvote) or -1 (downvote). Calling again with the same value removes the vote.
export async function castVote(noteId, userId, value) {
  const { data: existing } = await supabase
    .from('votes')
    .select('*')
    .eq('note_id', noteId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing && existing.value === value) {
    await supabase.from('votes').delete().eq('id', existing.id)
  } else if (existing) {
    await supabase.from('votes').update({ value }).eq('id', existing.id)
  } else {
    await supabase.from('votes').insert({ note_id: noteId, user_id: userId, value })
  }
}
