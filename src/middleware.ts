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

      // Get user role for role-based access control
      const userRole = (sessionClaims?.metadata as any)?.role || (sessionClaims?.publicMetadata as any)?.role;
      
      // Super sensitive admin routes - only for admin/super_admin
      if (pathname.startsWith('/api/admin/users') || 
          pathname.startsWith('/api/admin/system') ||
          pathname.startsWith('/admin/system')) {
        if (userRole !== 'admin' && userRole !== 'super_admin') {
          console.log(`❌ Super admin access denied for user ${userId} with role: ${userRole}`);
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
        
        console.log(`✅ Super admin access granted for user ${userId}`);
        return NextResponse.next();
      }

      // Admin portal manager - allow all authenticated users to view
      if (pathname === '/admin/portal-manager') {
        console.log(`✅ Portal manager access granted for authenticated user ${userId}`);
        return NextResponse.next();
      }

      // Other admin routes - allow all authenticated users
      if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        console.log(`✅ Admin area access granted for authenticated user ${userId}`);
        return NextResponse.next();
      }

      // Client portal routes - allow all authenticated users
      if (pathname.match(/\/clients\/[^\/]+\/portal/) || pathname.match(/\/api\/clients\/[^\/]+\/portal/)) {
        const clientIdMatch = pathname.match(/\/clients\/([^\/]+)\/portal/) || pathname.match(/\/api\/clients\/([^\/]+)\/portal/);
        const clientId = clientIdMatch?.[1];
        
        if (clientId) {
          const clientAccess = (sessionClaims?.metadata as any)?.clientAccess || (sessionClaims?.publicMetadata as any)?.clientAccess;
          
          // Admin users have access to all client portals
          if (userRole === 'admin' || userRole === 'super_admin') {
            console.log(`✅ Admin client portal access granted for user ${userId}`);
            return NextResponse.next();
          }
          
          // All authenticated users can access client portals (for demo/development)
          // In production, you might want to restrict this based on clientAccess
          console.log(`✅ Client portal access granted for authenticated user ${userId} to client ${clientId}`);
          return NextResponse.next();
          
          // Uncomment below for production client access control:
          /*
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
          */
        }
      }

      // For API routes, allow all authenticated users access to most endpoints
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
        
        // Super sensitive admin API endpoints - only for admin/super_admin
        if (pathname.startsWith('/api/admin/users') || 
            pathname.startsWith('/api/admin/system')) {
          if (userRole !== 'admin' && userRole !== 'super_admin') {
            console.log(`❌ Super admin API access denied for user ${userId}`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
          }
          
          console.log(`✅ Super admin API access granted for user ${userId}`);
          return NextResponse.next();
        }
        
        // Other admin API endpoints - allow all authenticated users
        if (pathname.startsWith('/api/admin/')) {
          console.log(`✅ Admin API access granted for authenticated user ${userId}`);
          return NextResponse.next();
        }
      }

      // Allow all other authenticated routes for logged-in users
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