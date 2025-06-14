import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

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
    '/api/competence-files/(.*)',
    '/api/daily-quote',
    '/uploads/(.*)'
  ],
  ignoredRoutes: [
    '/((?!api|trpc))(_next.*|.+\\.[\\w]+$)',
    '/api/health',
    '/api/public/(.*)',
    '/api/daily-quote',
    '/api/competence-files/(.*)',
    '/uploads/(.*)',
    // Static assets and build files
    '/_next/(.*)',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ],
  
  afterAuth(auth, req) {
    const { pathname } = req.nextUrl;
    
    // Always allow health check, daily quote, and ALL competence-files endpoints
    if (pathname === '/api/health' || 
        pathname === '/api/daily-quote' ||
        pathname.startsWith('/api/competence-files/')) {
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