import { supabase } from '../supabaseClient'

export async function getAdminStats() {
  const { data, error } = await supabase.rpc('get_admin_stats')
  if (error) throw error
  return data
}

export function formatBytes(bytes) {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}
