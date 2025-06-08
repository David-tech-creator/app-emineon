import { authMiddleware } from '@clerk/nextjs'

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
    '/api/ai/(.*)',
    '/api/files/(.*)',
    '/api/competence-files/(.*)',
    '/uploads/(.*)'
  ],
  ignoredRoutes: [
    '/((?!api|trpc))(_next.*|.+\\.[\\w]+$)',
    '/api/public/(.*)',
    '/api/apply',
    '/api/health',
    '/api/candidates/parse-cv',
    '/api/candidates/parse-linkedin',
    '/api/ai/(.*)',
    '/api/files/(.*)',
    '/api/competence-files/(.*)',
    '/uploads/(.*)'
  ],
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
} 