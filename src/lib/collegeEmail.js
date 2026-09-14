// Returns true if the email's domain matches the college's registered domain.
// Used to decide whether a signup counts as "verified" (real college email)
// or "self-declared" (any email, manually picked college).
export function emailMatchesCollege(email, collegeDomain) {
  if (!email || !collegeDomain) return false
  const emailDomain = email.split('@')[1]?.toLowerCase().trim()
  return emailDomain === collegeDomain.toLowerCase().trim()
}
