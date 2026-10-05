export const PASSWORD_MIN_LENGTH = 12
export const PASSWORD_MAX_LENGTH = 128

export interface PasswordRule {
  id: string
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (p) => p.length >= PASSWORD_MIN_LENGTH && p.length <= PASSWORD_MAX_LENGTH,
  },
  { id: 'lower', label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'A number', test: (p) => /\d/.test(p) },
  { id: 'symbol', label: 'A symbol (e.g. ! @ # $)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const COMMON_FRAGMENTS = ['password', 'qwerty', '123456', 'letmein', 'welcome', 'admin123']

/**
 * Returns a human-readable reason the password is rejected, or null if it
 * satisfies the policy. Shared by the server (auth hooks) and the client
 * (live checklist) so both enforce identical rules.
 */
export function validatePassword(password: string, email?: string | null): string | null {
  if (typeof password !== 'string' || password.length === 0) return 'Password is required.'
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`
  }

  const failed = PASSWORD_RULES.find((rule) => !rule.test(password))
  if (failed) return `Password must contain: ${failed.label.toLowerCase()}.`

  const lower = password.toLowerCase()
  if (COMMON_FRAGMENTS.some((fragment) => lower.includes(fragment))) {
    return 'Password is too common. Avoid words like "password" or simple sequences.'
  }

  const localPart = email?.split('@')[0]?.toLowerCase()
  if (localPart && localPart.length >= 3 && lower.includes(localPart)) {
    return 'Password must not contain your email name.'
  }

  return null
}
