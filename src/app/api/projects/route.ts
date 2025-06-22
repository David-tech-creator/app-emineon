import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating a new project
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  clientName: z.string().min(1, 'Client name is required'),
  clientContact: z.string().optional(),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  totalPositions: z.number().min(1, 'At least one position is required'),
  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  budgetEndDate: z.string().transform(str => new Date(str)).optional(),
  budgetRange: z.string().optional(),
  hourlyRateMin: z.number().optional(),
  hourlyRateMax: z.number().optional(),
  currency: z.string().default('EUR'),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  isHybrid: z.boolean().default(false),
  skillsRequired: z.array(z.string()).default([]),
  experienceRequired: z.array(z.string()).default([]),
  industryBackground: z.string().optional(),
  languageRequirements: z.array(z.string()).default([]),
  sourceEmail: z.string().optional(),
  sourceEmailSubject: z.string().optional(),
  sourceEmailDate: z.string().transform(str => new Date(str)).optional(),
  parsedFromEmail: z.boolean().default(false),
  assignedRecruiter: z.string().optional(),
  internalNotes: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

// GET /api/projects - List all projects with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const assignedRecruiter = searchParams.get('assignedRecruiter');
    const clientName = searchParams.get('clientName');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    
    if (status) where.status = status;
    if (urgency) where.urgencyLevel = urgency;
    if (assignedRecruiter) where.assignedRecruiter = assignedRecruiter;
    if (clientName) {
      where.clientName = {
        contains: clientName,
        mode: 'insensitive'
      };
    }

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          jobs: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            }
          },
          candidates: {
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
          activities: {
            select: {
              id: true,
              type: true,
              title: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          },
          _count: {
            select: {
              jobs: true,
              candidates: true,
              activities: true,
              documents: true,
            }
          }
        },
        orderBy: [
          { urgencyLevel: 'desc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset,
      }),
      prisma.project.count({ where })
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        activities: {
          create: {
            type: 'PROJECT_CREATED',
            title: 'Project Created',
            description: `Project "${validatedData.name}" was created for ${validatedData.clientName}`,
            metadata: {
              totalPositions: validatedData.totalPositions,
              urgencyLevel: validatedData.urgencyLevel,
              priority: validatedData.priority,
            }
          }
        }
      },
      include: {
        jobs: true,
        candidates: true,
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

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 