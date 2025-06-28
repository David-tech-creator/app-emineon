import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/health',
    '/api/daily-quote',
    '/api/public/(.*)',
    '/api/competence-files/test-generate',
    '/api/outlook-addin/(.*)',
    '/outlook-addin/(.*)',
    '/api/projects/parse-email',
    '/api/ai/candidate-matching', // For demo purposes
  ],

  // Routes that are ignored by Clerk (no auth check at all)
  ignoredRoutes: [],

  // Custom logic after authentication
  afterAuth: (auth, req) => {
    const { userId, sessionClaims } = auth;
    const { pathname } = req.nextUrl;

    console.log(`🔍 Middleware processing: ${pathname}`);

    // Bypass authentication for Outlook add-in files
    if (pathname.startsWith('/api/outlook-addin/') || pathname.startsWith('/outlook-addin/')) {
      console.log(`✅ Bypassing authentication for: ${pathname}`);
      return NextResponse.next();
    }

    // If user is not authenticated and trying to access protected route
    if (!userId && !auth.isPublicRoute) {
      console.log(`❌ Authentication required for: ${pathname}`);
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // If user is authenticated - GRANT ACCESS TO EVERYTHING
    if (userId) {
      console.log(`✅ User authenticated: ${userId} - FULL PLATFORM ACCESS GRANTED`);

      // ALL AUTHENTICATED USERS HAVE ACCESS TO EVERYTHING
      // Simplified: any authenticated user can access any route
      
      // For ALL API routes - grant access to authenticated users
      if (pathname.startsWith('/api/')) {
        console.log(`✅ API access granted for authenticated user ${userId} to ${pathname}`);
        return NextResponse.next();
      }

      // For ALL page routes - grant access to authenticated users
      console.log(`✅ Full platform access granted for authenticated user ${userId}`);
      return NextResponse.next();
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 