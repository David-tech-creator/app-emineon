import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating a project
const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  clientName: z.string().min(1).optional(),
  clientContact: z.string().optional(),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  totalPositions: z.number().min(1).optional(),
  filledPositions: z.number().min(0).optional(),
  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'PLANNING']).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  budgetEndDate: z.string().transform(str => new Date(str)).optional(),
  budgetRange: z.string().optional(),
  hourlyRateMin: z.number().optional(),
  hourlyRateMax: z.number().optional(),
  currency: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().optional(),
  isHybrid: z.boolean().optional(),
  skillsRequired: z.array(z.string()).optional(),
  experienceRequired: z.array(z.string()).optional(),
  industryBackground: z.string().optional(),
  languageRequirements: z.array(z.string()).optional(),
  assignedRecruiter: z.string().optional(),
  lastClientUpdate: z.string().transform(str => new Date(str)).optional(),
  nextFollowUp: z.string().transform(str => new Date(str)).optional(),
  clientFeedback: z.string().optional(),
  internalNotes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/projects/[id] - Get project details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        jobs: {
          include: {
            applications: {
              select: {
                id: true,
                status: true,
                candidate: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    currentTitle: true,
                  }
                }
              }
            },
            _count: {
              select: {
                applications: true,
              }
            }
          }
        },
        candidates: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                currentTitle: true,
                currentLocation: true,
                technicalSkills: true,
                experienceYears: true,
                expectedSalary: true,
                status: true,
                linkedinUrl: true,
                portfolioUrl: true,
                createdAt: true,
                lastUpdated: true,
              }
            }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            jobs: true,
            candidates: true,
            activities: true,
            documents: true,
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Track what fields are being updated for activity log
    const updatedFields = Object.keys(validatedData).filter(
      key => validatedData[key as keyof typeof validatedData] !== undefined
    );

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        activities: {
          create: {
            type: 'STATUS_UPDATED',
            title: 'Project Updated',
            description: `Project updated. Modified fields: ${updatedFields.join(', ')}`,
            metadata: {
              updatedFields,
              previousStatus: existingProject.status,
              newStatus: validatedData.status || existingProject.status,
            }
          }
        }
      },
      include: {
        jobs: true,
        candidates: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                currentTitle: true,
              }
            }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            jobs: true,
            candidates: true,
            activities: true,
            documents: true,
          }
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        jobs: true,
        candidates: true,
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project has active jobs or candidates
    if (existingProject.jobs.length > 0 || existingProject.candidates.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete project with active jobs or candidates',
          details: {
            jobsCount: existingProject.jobs.length,
            candidatesCount: existingProject.candidates.length
          }
        },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 