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
      // No role-based restrictions - any logged-in user can access any part of the platform
      
      // Admin routes - allow ALL authenticated users
      if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        console.log(`✅ Admin access granted for authenticated user ${userId}`);
        return NextResponse.next();
      }

      // Client portal routes - allow ALL authenticated users
      if (pathname.match(/\/clients\/[^\/]+\/portal/) || pathname.match(/\/api\/clients\/[^\/]+\/portal/)) {
        const clientIdMatch = pathname.match(/\/clients\/([^\/]+)\/portal/) || pathname.match(/\/api\/clients\/([^\/]+)\/portal/);
        const clientId = clientIdMatch?.[1];
        
        if (clientId) {
          console.log(`✅ Client portal access granted for authenticated user ${userId} to client ${clientId}`);
          return NextResponse.next();
        }
      }

      // API routes - allow ALL authenticated users access to ALL endpoints
      if (pathname.startsWith('/api/')) {
        // AI Copilot endpoints - allow all authenticated users
        if (pathname.startsWith('/api/ai-copilot/')) {
          console.log(`✅ AI Copilot access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // Competence files endpoints - allow all authenticated users
        if (pathname.startsWith('/api/competence-files/')) {
          console.log(`✅ Competence files access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // Jobs API - allow all authenticated users
        if (pathname.startsWith('/api/jobs/')) {
          console.log(`✅ Jobs API access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // Candidates API - allow all authenticated users
        if (pathname.startsWith('/api/candidates/')) {
          console.log(`✅ Candidates API access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // Applications API - allow all authenticated users
        if (pathname.startsWith('/api/applications/')) {
          console.log(`✅ Applications API access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // Upload API - allow all authenticated users
        if (pathname.startsWith('/api/upload')) {
          console.log(`✅ Upload API access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // Files API - allow all authenticated users
        if (pathname.startsWith('/api/files/')) {
          console.log(`✅ Files API access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // Admin API endpoints - allow ALL authenticated users (no role restrictions)
        if (pathname.startsWith('/api/admin/')) {
          console.log(`✅ Admin API access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // AI endpoints - allow all authenticated users
        if (pathname.startsWith('/api/ai/')) {
          console.log(`✅ AI API access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
      }

      // Allow ALL other authenticated routes for logged-in users
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