# App Branching Structure Analysis

## Git Branching Structure

### Current Branches
- **`main`** - Primary production branch (currently at commit `5f37878`)
- **`develop`** - Development branch (at commit `366e2cb`)
- **`cursor/review-app-branching-structure-08a7`** - Current feature branch (HEAD)

### Branch Relationships
```
main (origin/main, origin/HEAD)
├── develop (origin/develop)
└── cursor/review-app-branching-structure-08a7 (current HEAD)
```

## Application Architecture & Structure

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Frontend**: React, TailwindCSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Railway) with Prisma ORM
- **Authentication**: Clerk
- **AI Integration**: OpenAI GPT
- **Deployment**: Vercel

### Application Modules/Branches

The app is organized into distinct functional modules within the `src/app/` directory:

#### Core Modules
- **`candidates/`** - Candidate management system with 40+ fields, CV parsing
- **`jobs/`** - Job posting and management
- **`ai-tools/`** - AI-powered features (matching, email generation, job descriptions)
- **`analytics/`** - Data analytics and reporting
- **`reports/`** - Report generation functionality

#### Workflow Modules
- **`workflows/`** - Automated workflow management
- **`assessments/`** - Candidate assessment tools
- **`assignments/`** - Task and assignment management
- **`video-interviews/`** - Video interview functionality
- **`outreach/`** - Recruitment outreach tools

#### Administrative Modules
- **`(dashboard)/`** - Main dashboard interface
- **`clients/`** - Client management
- **`user/`** - User profile management
- **`sign-in/`** & **`sign-up/`** - Authentication pages

#### Integration Modules
- **`api/`** - RESTful API endpoints
- **`apply/`** - Public job application interface
- **`job-distribution/`** - Job posting distribution
- **`notes/`** - Note-taking functionality

### Recent Development Activity

Based on commit history, recent focus areas include:

1. **Enhanced Candidate Management** (Latest commits)
   - Integrated candidates page with improved layout
   - Enhanced styling and drawer functionality
   - LinkedIn Chrome extension integration

2. **AI Feature Implementation**
   - Smart outreach capabilities
   - Interview intelligence
   - AI report generator
   - Enhanced AI tools integration

3. **Production Optimizations**
   - Fixed build issues and route conflicts
   - Resolved prerender errors
   - Zero build warnings achievement
   - Optimized Prisma client

### Chrome Extension Integration
- **`chrome-extension/`** directory contains LinkedIn integration
- Enables candidate sourcing directly from LinkedIn profiles
- Includes profile data extraction and popup interface

### Development Status Files
- `FRONTEND_FEATURES_STATUS.md` - Frontend development progress
- `IMPLEMENTATION_STATUS.md` - Overall implementation tracking
- `DEPLOYMENT_STATUS.md` - Deployment and production status
- `AI_COPILOT_FEATURES.md` - AI feature documentation
- `FINAL_STATUS.md` - Project completion status

## Key Architectural Decisions

1. **Modular Design**: Each business function has its own route/module
2. **API-First Approach**: Comprehensive API layer in `/api` directory
3. **AI Integration**: Dedicated AI tools module for intelligent features
4. **Authentication-First**: Clerk integration with protected routes
5. **Type Safety**: TypeScript with Prisma for database operations

## Deployment Strategy

- **Primary**: Vercel deployment with GitHub integration
- **Database**: Railway PostgreSQL with Prisma Accelerate
- **Environment**: Production-optimized with comprehensive testing

This ATS (Applicant Tracking System) follows a modern, feature-rich architecture with clear separation of concerns and modular organization suitable for enterprise-level recruitment management.