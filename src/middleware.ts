import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in', 
    '/sign-up',
    '/apply/(.*)',
    '/jobs/embed',
    '/api/public/(.*)',
    '/api/apply',
    '/api/health',
    '/api/candidates/parse-cv',
    '/api/candidates/parse-linkedin',
    '/api/ai/job-description/(.*)',
    '/api/files/(.*)',
    '/api/daily-quote',
    '/uploads/(.*)',
    '/api/test-bypass',
    // Make ALL competence-files endpoints public
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
  ],
  ignoredRoutes: [
    '/((?!api|trpc))(_next.*|.+\\.[\\w]+$)',
    '/api/health',
    '/api/public/(.*)',
    '/api/daily-quote',
    '/uploads/(.*)',
    '/api/test-bypass',
    // Ignore ALL competence-files endpoints
    '/api/competence-files/test-generate',
    '/api/competence-files/test-linkedin',
    '/api/competence-files/test-logo-upload',
    '/api/competence-files/simple-logo-test',
    '/api/competence-files/parse-linkedin',
    '/api/competence-files/parse-resume',
    '/api/competence-files/download',
    '/api/competence-files/upload-logo',
    '/api/competence-files/generate',
    '/api/competence-files/enhanced-generate',
    // Static assets and build files
    '/_next/(.*)',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ],
  
  afterAuth(auth, req) {
    const { pathname } = req.nextUrl;
    
    // ALWAYS allow test-bypass endpoint
    if (pathname === '/api/test-bypass') {
      return NextResponse.next();
    }
    
    // ALWAYS allow competence-files endpoints regardless of auth status
    if (pathname.startsWith('/api/competence-files/')) {
      return NextResponse.next();
    }
    
    // Always allow health check and daily quote
    if (pathname === '/api/health' || pathname === '/api/daily-quote') {
      return NextResponse.next();
    }
    
    // For API routes, return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      if (!auth.userId && !auth.isPublicRoute) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    // For regular pages, redirect to sign-in if not authenticated
    if (!auth.userId && !auth.isPublicRoute && !pathname.startsWith('/api/')) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
    
    // If signed in and on a public auth route, redirect to dashboard
    if (auth.userId && (pathname === '/sign-in' || pathname === '/sign-up')) {
      return Response.redirect(new URL('/', req.url));
    }
    
    // Allow the request to continue
    return NextResponse.next();
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
} 