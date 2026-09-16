import { supabase } from '../supabaseClient'

export async function getAdminStats() {
  const { data, error } = await supabase.rpc('get_admin_stats')
  if (error) throw error
  return data
}

export async function getSubAdminStats() {
  const { data, error } = await supabase.rpc('get_subadmin_stats')
  if (error) throw error
  return data
}

export async function setUserBanned(userId, banned) {
  const { error } = await supabase.rpc('admin_set_banned', {
    target_user_id: userId,
    should_ban: banned,
  })
  if (error) throw error
}

export async function setUserSubadmin(userId, isSubadmin) {
  const { error } = await supabase.rpc('admin_set_subadmin', {
    target_user_id: userId,
    should_be_subadmin: isSubadmin,
  })
  if (error) throw error
}

export async function deleteUser(userId) {
  const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId })
  if (error) throw error
}

export async function deleteCollege(collegeId) {
  const { error } = await supabase.rpc('admin_delete_college', { target_college_id: collegeId })
  if (error) throw error
}

export function formatBytes(bytes) {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}
