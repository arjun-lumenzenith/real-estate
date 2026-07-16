import { toNextJsHandler } from 'better-auth/next-js'

export const dynamic = 'force-dynamic'

// Lazy-load auth to defer database initialization until runtime
async function getAuthHandler() {
  const { auth } = await import('@/lib/auth')
  return toNextJsHandler(auth.handler)
}

export async function GET(req: any, ctx: any) {
  const { GET } = await getAuthHandler()
  return GET(req, ctx)
}

export async function POST(req: any, ctx: any) {
  const { POST } = await getAuthHandler()
  return POST(req, ctx)
}

export async function PUT(req: any, ctx: any) {
  const { PUT } = await getAuthHandler()
  return PUT?.(req, ctx)
}

export async function DELETE(req: any, ctx: any) {
  const { DELETE } = await getAuthHandler()
  return DELETE?.(req, ctx)
}
