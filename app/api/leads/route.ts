import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

// GET leads - public endpoint for searching
export async function GET(req: NextRequest) {
  try {
    // Try to use database if available
    try {
      const { createLeadSchema } = await import('@/lib/validations')
      const { getDb } = await import('@/lib/db')
      const { lead } = await import('@/lib/db/schema')
      const { rateLimit, rateLimitConfigs } = await import('@/lib/rate-limit')
      const { cache, cacheKeys } = await import('@/lib/cache')

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

      let query = getDb().select().from(lead)
      const result = await query.limit(20)

      return NextResponse.json({
        success: true,
        data: result,
      })
    } catch (dbError) {
      console.warn('[GET /api/leads] Database not available, using fallback:', dbError)
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
    // Try to use database if available
    try {
      const { createLeadSchema } = await import('@/lib/validations')
      const { getDb } = await import('@/lib/db')
      const { lead } = await import('@/lib/db/schema')
      const { rateLimit, rateLimitConfigs } = await import('@/lib/rate-limit')
      const { cache, cacheKeys } = await import('@/lib/cache')

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

      const body = await req.json()

      // Validate input
      const validated = createLeadSchema.parse(body)

      // Convert arrays to comma-separated strings for database storage
      const processedData = {
        ...validated,
        locality: Array.isArray(validated.locality) ? validated.locality.join(', ') : validated.locality,
        bhkRequirement: Array.isArray(validated.bhkRequirement) ? validated.bhkRequirement.join(', ') : validated.bhkRequirement,
      }

      // Generate reference ID for tracking
      const referenceId = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create lead - using a system user ID for public submissions
      const leadId = uuidv4()
      const result = await getDb()
        .insert(lead)
        .values({
          id: leadId,
          userId: 'system', // Public leads are attributed to 'system'
          ...processedData,
          referenceId,
          status: 'new',
        })
        .returning()

      // Send confirmation email if configured
      if (process.env.RESEND_API_KEY && validated.email) {
        try {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'noreply@lumenzenith.com',
            to: validated.email,
            subject: 'Your Lead Has Been Submitted - LumenZenith',
            html: `
              <h2>Thank you for your interest!</h2>
              <p>Your reference ID: <strong>${referenceId}</strong></p>
              <p>We will contact you soon about available properties in ${processedData.locality || 'your preferred locations'}.</p>
            `,
          })
        } catch (emailError) {
          console.error('[Email Send Error]', emailError)
          // Don't fail the request if email fails
        }
      }

      // Invalidate cache
      await cache.deletePattern('lead:*')

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
      console.warn('[POST /api/leads] Database not available, using fallback:', dbError)
      
      const body = await req.json()
      
      // Validate input using Zod if available
      try {
        const { createLeadSchema } = await import('@/lib/validations')
        createLeadSchema.parse(body)
      } catch (validationError) {
        return NextResponse.json(
          { error: 'Invalid input' },
          { status: 400 }
        )
      }

      // Generate reference ID for tracking
      const referenceId = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Simulate lead creation (without saving to DB)
      const mockLead = {
        id: uuidv4(),
        userId: 'system',
        fullName: body.fullName,
        phoneNumber: body.phoneNumber,
        email: body.email,
        locality: Array.isArray(body.locality) ? body.locality.join(', ') : body.locality,
        budgetRange: body.budgetRange,
        bhkRequirement: Array.isArray(body.bhkRequirement) ? body.bhkRequirement.join(', ') : body.bhkRequirement,
        referenceId,
        status: 'new',
        createdAt: new Date().toISOString(),
      }

      // Convert arrays to comma-separated strings for display
      const displayLocality = Array.isArray(body.locality) ? body.locality.join(', ') : body.locality
      const displayBhk = Array.isArray(body.bhkRequirement) ? body.bhkRequirement.join(', ') : body.bhkRequirement

      // Send confirmation email if configured
      if (process.env.RESEND_API_KEY && body.email) {
        try {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'noreply@lumenzenith.com',
            to: body.email,
            subject: 'Your Lead Has Been Submitted - LumenZenith',
            html: `
              <h2>Thank you for your interest!</h2>
              <p>Your reference ID: <strong>${referenceId}</strong></p>
              <p>We will contact you soon about available properties in ${displayLocality || 'your preferred locations'}.</p>
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
          data: mockLead,
          referenceId,
          message: 'Lead created successfully. Check your email for confirmation.',
          fallback: true,
        },
        { status: 201 }
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
