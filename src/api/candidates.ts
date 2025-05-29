import { Router, Request, Response } from 'express';
import { prisma } from '../utils/database';
import { createCandidateSchema } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth, withUser } from '../middleware/clerkMiddleware';
import { ApiResponse } from '../types';

const router = Router();

// POST /candidates - Create a new candidate (requires authentication)
router.post(
  '/',
  requireAuth,
  withUser,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    // Validate request body
    const validatedData = createCandidateSchema.parse(req.body);

    // Create candidate in database
    const candidate = await prisma.candidate.create({
      data: validatedData
    });

    res.status(201).json({
      success: true,
      data: candidate,
      message: 'Candidate created successfully',
      createdBy: req.auth?.userId
    });
  })
);

// GET /candidates - List all candidates (optional authentication)
router.get(
  '/',
  withUser,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const candidates = await prisma.candidate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: candidates,
      authenticated: !!req.auth?.userId,
      user: req.user ? {
        id: req.user.id,
        email: req.user.emailAddresses?.[0]?.emailAddress
      } : null
    });
  })
);

// GET /candidates/:id - Get a specific candidate (optional authentication)
router.get(
  '/:id',
  withUser,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const candidate = await prisma.candidate.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!candidate) {
      res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
      return;
    }

    res.json({
      success: true,
      data: candidate,
      authenticated: !!req.auth?.userId
    });
  })
);

// DELETE /candidates/:id - Delete a candidate (requires authentication)
router.delete(
  '/:id',
  requireAuth,
  withUser,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const candidate = await prisma.candidate.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!candidate) {
      res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
      return;
    }

    await prisma.candidate.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({
      success: true,
      message: 'Candidate deleted successfully',
      deletedBy: req.auth?.userId
    });
  })
);

export { router as candidatesRouter }; 