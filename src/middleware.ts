import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Force deployment refresh - Updated: 2025-06-14 23:20
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔍 Middleware processing: ${pathname}`);
  
  // Bypass authentication entirely for these endpoints
  const bypassPaths = [
    '/api/health',
    '/api/daily-quote',
    '/api/test-bypass',
    '/api/ai-copilot/chat',
    '/api/ai-copilot/stream',
    '/api/competence-files/test-generate',
    '/api/competence-files/test-linkedin',
    '/api/competence-files/test-logo-upload',
    '/api/competence-files/simple-logo-test',
    '/api/competence-files/parse-linkedin',
    '/api/competence-files/parse-resume',
    '/api/competence-files/download',
    '/api/competence-files/upload-logo',
    '/api/competence-files/generate',
    '/api/competence-files/enhanced-generate'
  ];
  
  // If the path matches any bypass path, allow it through without authentication
  if (bypassPaths.includes(pathname) || pathname.startsWith('/api/competence-files/') || pathname.startsWith('/api/ai-copilot/')) {
    console.log(`✅ Bypassing authentication for: ${pathname}`);
    return NextResponse.next();
  }
  
  console.log(`⚠️ No bypass for: ${pathname}`);
  // For all other routes, we would normally use Clerk middleware
  // But for now, let's allow everything to test
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
} 