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
  // Job positions within the project
  jobPositions: z.array(z.object({
    title: z.string().min(1, 'Job title is required'),
    seniorityLevel: z.string(),
    count: z.number().min(1),
    specificSkills: z.array(z.string()).optional(),
    description: z.string().optional()
  })).min(1, 'At least one job position is required')
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

    // Extract job positions from the validated data
    const { jobPositions, ...projectData } = validatedData;

    // Create project and associated jobs in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the project first
      const project = await tx.project.create({
        data: {
          ...projectData,
          activities: {
            create: {
              type: 'PROJECT_CREATED',
              title: 'Project Created',
              description: `Project "${projectData.name}" was created for ${projectData.clientName}`,
              metadata: {
                totalPositions: projectData.totalPositions,
                urgencyLevel: projectData.urgencyLevel,
                priority: projectData.priority,
              }
            }
          }
        }
      });

      // Create individual job records for each position
      const jobsToCreate = [];
      for (const position of jobPositions) {
        // Create multiple jobs if count > 1
        for (let i = 0; i < position.count; i++) {
          const jobTitle = position.count > 1 
            ? `${position.title} #${i + 1}` 
            : position.title;

                     // Combine project-level skills with position-specific skills
           const allSkills = [
             ...(projectData.skillsRequired || []),
             ...(position.specificSkills || [])
           ];
           const uniqueSkills = Array.from(new Set(allSkills));

          jobsToCreate.push({
            title: jobTitle,
            description: position.description || `${position.title} position for ${projectData.clientName}`,
            department: projectData.industryBackground || 'General',
            location: projectData.location || 'Remote',
            status: 'DRAFT' as const,
            isRemote: projectData.isRemote || false,
            requirements: uniqueSkills,
            responsibilities: [
              `Work as ${position.seniorityLevel} ${position.title}`,
              `Collaborate with the team at ${projectData.clientName}`,
              ...(position.description ? [position.description] : [])
            ],
            experienceLevel: position.seniorityLevel,
            salaryMin: projectData.hourlyRateMin ? projectData.hourlyRateMin * 1600 : undefined, // Rough monthly estimate
            salaryMax: projectData.hourlyRateMax ? projectData.hourlyRateMax * 1600 : undefined,
            salaryCurrency: projectData.currency || 'EUR',
            projectId: project.id,
            employmentType: ['CONTRACT'],
            benefits: [],
          });
        }
      }

      // Create all jobs
      if (jobsToCreate.length > 0) {
        await tx.job.createMany({
          data: jobsToCreate
        });
      }

             // Log job creation activity
       await tx.projectActivity.create({
         data: {
           projectId: project.id,
           type: 'JOB_CREATED',
           title: 'Job Positions Created',
           description: `Created ${jobsToCreate.length} job position(s) for this project`,
           metadata: {
             jobsCreated: jobsToCreate.length,
             positions: jobPositions.map(p => ({ title: p.title, count: p.count }))
           }
         }
       });

      // Return the project with all related data
      return await tx.project.findUnique({
        where: { id: project.id },
        include: {
          jobs: {
            select: {
              id: true,
              title: true,
              status: true,
              department: true,
              location: true,
              requirements: true,
              experienceLevel: true,
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
              description: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc'
            },
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
    });

    return NextResponse.json(result, { status: 201 });
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