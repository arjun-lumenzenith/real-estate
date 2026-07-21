export interface TurnstileVerificationResult {
    success: boolean
    'error-codes'?: string[]
    hostname?: string
    action?: string
    cdata?: string
  }
  
  export async function verifyTurnstileToken(
    token: string,
    remoteIp?: string
  ): Promise<TurnstileVerificationResult> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY
  
    if (!secretKey) {
      throw new Error('TURNSTILE_SECRET_KEY is not configured')
    }
  
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          ...(remoteIp ? { remoteip: remoteIp } : {}),
        }),
      }
    )
  
    if (!response.ok) {
      throw new Error(
        `Turnstile verification request failed: ${response.status}`
      )
    }
  
    return response.json()
  }