import { NextRequest, NextResponse } from 'next/server'
import { verifyTurnstileToken } from '@/lib/turnstile'

export const dynamic = 'force-dynamic'

// GET leads - public endpoint for searching
export async function GET(req: NextRequest) {
  try {
    // Try to use database if available
    try {
      const { createLeadSchema } = await import('@/lib/validations')
      const { getDb, withDbRetry } = await import('@/lib/db')
      const { lead } = await import('@/lib/db/schema')
      const { rateLimit, rateLimitConfigs } = await import('@/lib/rate-limit')

      const ip = req.headers.get('x-forwarded-for') || 'unknown'

      // Rate limit
      const rateLimitResult = await rateLimit(`api:${ip}`, rateLimitConfigs.search)
      if (!rateLimitResult.success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': String(rateLimitResult.remaining),
              'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            },
          }
        )
      }

      let query = await withDbRetry(() =>
        getDb().select().from(lead))
      const result = await query.limit(20)

      return NextResponse.json({
        success: true,
        data: result,
      })
    } catch (dbError) {
      console.warn('[GET /api/leads] Database unavailable :', dbError)
      return NextResponse.json({
        success: true,
        data: [],
        fallback: true,
      })
    }
  } catch (error) {
    console.error('[GET /api/leads] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new lead
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      turnstileToken,
      ...leadData
    } = body

    // CAPTCHA token must exist
    if (!turnstileToken) {
      return NextResponse.json(
        {
          error: 'Security verification is required.',
        },
        {
          status: 400,
        }
      )
    }

    // Get client IP
    const forwardedFor = req.headers.get('x-forwarded-for')
    const clientIp = forwardedFor
      ?.split(',')
      .at(0)
      ?.trim()

    // Verify token with Cloudflare
    const turnstileResult = await verifyTurnstileToken(
      turnstileToken,
      clientIp
    )

    if (!turnstileResult.success) {
      console.warn('[POST /api/leads] Turnstile validation failed', {
        errorCodes: turnstileResult['error-codes'],
      })

      return NextResponse.json(
        {
          error: 'Security verification failed. Please try again.',
        },
        {
          status: 403,
        }
      )
    }

    // Only after CAPTCHA succeeds do we access the database
    try {
      const { createLeadSchema } = await import('@/lib/validations')
      const { getDb, withDbRetry } = await import('@/lib/db')
      const { lead } = await import('@/lib/db/schema')
      const { rateLimit, rateLimitConfigs } = await import('@/lib/rate-limit')
      
      const ip = req.headers.get('x-forwarded-for') || 'unknown'

      // Rate limit - stricter for lead creation
      const rateLimitResult = await rateLimit(`leads:${ip}`, rateLimitConfigs.leads)
      if (!rateLimitResult.success) {
        return NextResponse.json(
          { error: 'Too many lead submissions. Please try again later.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': String(rateLimitResult.remaining),
              'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            },
          }
        )
      }

      // Validate input
      const validated = createLeadSchema.parse(leadData)

      // Convert arrays to comma-separated strings for database storage
      const processedData = {
        ...validated,
        locality: Array.isArray(validated.locality) ? validated.locality.join(', ') : validated.locality,
        bhkRequirement: Array.isArray(validated.bhkRequirement) ? validated.bhkRequirement.join(', ') : validated.bhkRequirement,
      }

      // Generate reference ID for tracking
      const referenceId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create lead - using a system user ID for public submissions
      const result = await withDbRetry(
        () =>
          getDb()
            .insert(lead)
            .values({
              userId: 'system',
              ...processedData,
              referenceId,
              status: 'new',
            })
            .returning(),
        {
          retries: 2,
          initialDelayMs: 100,
        }
      )

      // Send confirmation email if configured
      if (process.env.RESEND_API_KEY && validated.email) {
        try {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'LumenZenith <noreply@lumenzenith.com>',
            to: validated.email,
            subject: 'Your Request Has Been Submitted - LumenZenith',
            html: `
              <!DOCTYPE html>
              <html>
                <body style="font-family: Arial, Helvetica, sans-serif; color:#333333; line-height:1.6;">

                  <h2 style="color:#1a73e8;">Thank you for your interest!</h2>

                  <p>
                    We have successfully received your enquiry.
                  </p>

                  <p>
                    <strong>Reference ID:</strong> ${referenceId}
                  </p>

                  <p>
                    We will contact you soon regarding properties in
                    <strong>${processedData.locality || 'your preferred locations'}</strong>.
                  </p>

                  <p>
                    Thank you for choosing <strong>LumenZenith</strong>.
                  </p>

                  <br>

                  <hr style="border:none;border-top:1px solid #dcdcdc;">

                  <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#666666;">
                    <tr>
                      <td>
                        <strong style="font-size:15px;color:#222222;">
                          LumenZenith Realty OPC Pvt. Ltd.
                        </strong>

                        <br><br>

                        📱 <a href="tel:+919900891647" style="color:#1a73e8;text-decoration:none;">
                          +91 9900891647
                        </a>

                        <br>

                        🌐 <a href="https://www.lumenzenith.com"
                              style="color:#1a73e8;text-decoration:none;">
                          www.lumenzenith.com
                        </a>

                        <br>

                        📍 Bengaluru, Karnataka, India

                        <br><br>

                        <span style="font-size:12px;color:#888888;">
                          Registered Real Estate Agent under the Karnataka RERA Act
                        </span>

                        <br>

                        <span style="font-size:11px;color:#999999;">
                          This is an automated email. Please do not reply to this message.
                        </span>

                      </td>
                    </tr>
                  </table>

                </body>
              </html>
              `,
          })
        } catch (emailError) {
          console.error('[Email Send Error]', emailError)
          // Don't fail the request if email fails
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: result[0],
          referenceId,
          message: 'Lead created successfully. Check your email for confirmation.',
        },
        { status: 201 }
      )
    } catch (dbError) {
      console.error('[POST /api/leads] Database unavailable :', dbError)
      
      return NextResponse.json(
        {
          error: 'Lead entry is temporarily unavailable. Please try again shortly.',
        },
        {
          status: 503,
        }
      )
    }
  } catch (error) {
    console.error('[POST /api/leads] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
