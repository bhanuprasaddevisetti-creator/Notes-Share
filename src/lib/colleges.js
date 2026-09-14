import { supabase } from '../supabaseClient'

export async function fetchColleges() {
  const { data, error } = await supabase.from('colleges').select('*').order('name')
  if (error) throw error
  return data
}

// Finds a college by (case-insensitive) name, or creates it if it doesn't exist yet.
// The first person to register a college "claims" the email domain as the
// verified domain for everyone who signs up after them.
export async function findOrCreateCollege(name, signupEmailDomain) {
  const trimmedName = name.trim()

  const { data: existing, error: findError } = await supabase
    .from('colleges')
    .select('*')
    .ilike('name', trimmedName)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing

  const { data: created, error: createError } = await supabase
    .from('colleges')
    .insert({ name: trimmedName, domain: signupEmailDomain })
    .select()
    .single()

  if (createError) throw createError
  return created
}
