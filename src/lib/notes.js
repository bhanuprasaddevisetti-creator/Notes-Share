import { supabase } from '../supabaseClient'

const BUCKET = 'notes-files'

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

export async function createNote({ collegeId, year, subject, title, description, filePath, uploaderId }) {
  const { error } = await supabase.from('notes').insert({
    college_id: collegeId,
    year,
    subject,
    title,
    description,
    file_path: filePath,
    uploader_id: uploaderId,
  })
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
