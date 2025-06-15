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
  ],

  // Routes that are ignored by Clerk (no auth check at all)
  ignoredRoutes: [],

  // Custom logic after authentication
  afterAuth: (auth, req) => {
    const { userId, sessionClaims } = auth;
    const { pathname } = req.nextUrl;

    console.log(`🔍 Clerk middleware processing: ${pathname}`);

    // If user is not authenticated and trying to access protected route
    if (!userId && !auth.isPublicRoute) {
      console.log(`❌ Authentication required for: ${pathname}`);
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // If user is authenticated
    if (userId) {
      console.log(`✅ User authenticated: ${userId}`);

      // Check admin routes
      if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        const userRole = (sessionClaims?.metadata as any)?.role || (sessionClaims?.publicMetadata as any)?.role;
        
        if (userRole !== 'admin' && userRole !== 'super_admin') {
          console.log(`❌ Admin access denied for user ${userId} with role: ${userRole}`);
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
        
        console.log(`✅ Admin access granted for user ${userId}`);
        return NextResponse.next();
      }

      // Check client portal routes
      if (pathname.match(/\/clients\/[^\/]+\/portal/) || pathname.match(/\/api\/clients\/[^\/]+\/portal/)) {
        const clientIdMatch = pathname.match(/\/clients\/([^\/]+)\/portal/) || pathname.match(/\/api\/clients\/([^\/]+)\/portal/);
        const clientId = clientIdMatch?.[1];
        
        if (clientId) {
          const userRole = (sessionClaims?.metadata as any)?.role || (sessionClaims?.publicMetadata as any)?.role;
          const clientAccess = (sessionClaims?.metadata as any)?.clientAccess || (sessionClaims?.publicMetadata as any)?.clientAccess;
          
          // Admin users have access to all client portals
          if (userRole === 'admin' || userRole === 'super_admin') {
            console.log(`✅ Admin client portal access granted for user ${userId}`);
            return NextResponse.next();
          }
          
          // Check if user has specific client access
          if (clientAccess && Array.isArray(clientAccess) && clientAccess.includes(clientId)) {
            console.log(`✅ Client portal access granted for user ${userId} to client ${clientId}`);
            return NextResponse.next();
          }
          
          console.log(`❌ Client portal access denied for user ${userId} to client ${clientId}`);
          
          // For API routes, return JSON error
          if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
          }
          
          // For page routes, redirect to unauthorized
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // For API routes, check specific permissions
      if (pathname.startsWith('/api/')) {
        // AI Copilot endpoints - require authentication but allow all authenticated users
        if (pathname.startsWith('/api/ai-copilot/')) {
          console.log(`✅ AI Copilot access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // Competence files endpoints - require authentication
        if (pathname.startsWith('/api/competence-files/')) {
          console.log(`✅ Competence files access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
        
        // Admin API endpoints
        if (pathname.startsWith('/api/admin/')) {
          const userRole = (sessionClaims?.metadata as any)?.role || (sessionClaims?.publicMetadata as any)?.role;
          
          if (userRole !== 'admin' && userRole !== 'super_admin') {
            console.log(`❌ Admin API access denied for user ${userId}`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
          }
          
          console.log(`✅ Admin API access granted for user ${userId}`);
          return NextResponse.next();
        }
      }

      // Allow all other authenticated routes
      console.log(`✅ General access granted for authenticated user ${userId}`);
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