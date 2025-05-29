import { Request, Response, NextFunction } from 'express';
import { verifyToken, clerkClient } from '@clerk/clerk-sdk-node';

// Extend Express Request interface to include auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId?: string;
        sessionId?: string;
        actor?: any;
        sessionClaims?: any;
      };
      user?: any;
    }
  }
}

// Clerk authentication middleware
export const clerkMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without auth
      req.auth = {};
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token using your Clerk instance
    const payload = await verifyToken(token, {
      issuer: 'https://next-bunny-32.clerk.accounts.dev',
    });

    // Attach auth info to request
    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid,
      sessionClaims: payload,
    };

    next();
  } catch (error) {
    console.error('Clerk middleware error:', error);
    // Continue without auth on error
    req.auth = {};
    next();
  }
};

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth?.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  next();
};

// Middleware to fetch and attach user data
export const withUser = async (req: Request, res: Response, next: NextFunction) => {
  if (req.auth?.userId) {
    try {
      const user = await clerkClient.users.getUser(req.auth.userId);
      req.user = user;
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }
  next();
}; 