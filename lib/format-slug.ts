const MAX_SLUG_LENGTH = 80

export function slugToTitle(slug: string): string {
  let decoded = slug
  try {
    decoded = decodeURIComponent(slug)
  } catch {
    // Malformed percent-encoding: fall back to the raw value.
  }

  return decoded
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/[^a-zA-Z0-9-\s]/g, '')
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
