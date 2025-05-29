# 🏢 Emineon ATS - Applicant Tracking System

A modern, AI-powered Applicant Tracking System built with Next.js, featuring enhanced candidate management, CV parsing, and intelligent job matching.

## ✨ Features

### 🎯 **Enhanced Candidate Management**
- **40+ Comprehensive Fields**: Complete candidate profiles with personal info, contact details, education, experience, skills, and more
- **CV Upload & Parsing**: Drag & drop CV upload with AI-powered data extraction
- **LinkedIn Integration**: Parse LinkedIn profiles automatically
- **Skills Assessment**: Track technical and soft skills with proficiency levels
- **Document Management**: Upload and manage resumes, cover letters, portfolios

### 🤖 **AI-Powered Features**
- **CV Parsing**: Extract candidate information from uploaded CVs
- **Job Description Generation**: AI-generated job descriptions
- **Candidate Matching**: Intelligent candidate-job matching algorithms
- **Email Templates**: AI-assisted recruitment email generation

### 🔐 **Authentication & Security**
- **Clerk Integration**: Secure authentication with multi-provider support
- **Protected Routes**: API and page-level authentication
- **User Management**: Role-based access control

### 📊 **Database & Performance**
- **Railway PostgreSQL**: Cloud-hosted database
- **Prisma ORM**: Type-safe database operations
- **Prisma Accelerate**: Connection pooling and query optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Railway account (for database)
- Clerk account (for authentication)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app-emineon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   # Database - Railway PostgreSQL with Prisma Accelerate
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_PRISMA_ACCELERATE_KEY"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   CLERK_JWT_KEY="-----BEGIN PUBLIC KEY-----..."
   
   # OpenAI API
   OPENAI_API_KEY="sk-..."
   ```

4. **Database Setup**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Railway) + Prisma
- **Authentication**: Clerk
- **AI**: OpenAI GPT
- **UI Components**: Radix UI, Lucide Icons
- **Form Management**: React Hook Form + Zod

### Project Structure
```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   ├── candidates/        # Candidate management
│   │   ├── jobs/             # Job management
│   │   └── ...               # Other pages
│   ├── components/           # Reusable UI components
│   ├── lib/                 # Utilities and configurations
│   └── types/               # TypeScript type definitions
├── prisma/                   # Database schema and migrations
└── public/                   # Static assets
```

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables for Vercel**
   ```
   DATABASE_URL
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY
   CLERK_JWT_KEY
   OPENAI_API_KEY
   ```

### Manual Deployment

1. **Build Production**
   ```bash
   npm run build
   npm start
   ```

2. **Docker Deployment** (Optional)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

## 📝 API Endpoints

### Candidates
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/[id]` - Get candidate details
- `PUT /api/candidates/[id]` - Update candidate
- `DELETE /api/candidates/[id]` - Delete candidate
- `POST /api/candidates/parse-cv` - Parse CV file
- `POST /api/candidates/parse-linkedin` - Parse LinkedIn profile

### AI Features
- `POST /api/ai/job-description` - Generate job description
- `POST /api/ai/candidate-matching` - Match candidates to jobs
- `POST /api/ai/email-template` - Generate email templates

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `GET /api/public/jobs.json` - Public job listings

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Database operations
npx prisma studio
npx prisma db push
npx prisma generate
```

## 🔧 Configuration

### Database Schema
The application uses a comprehensive candidate schema with 40+ fields organized into:
- Personal Information
- Contact Details
- Professional Experience
- Education & Certifications
- Skills & Competencies
- Preferences & Availability
- Documents & References

### Authentication Flow
1. Users land on protected routes
2. Clerk middleware redirects to sign-in
3. After authentication, users access the dashboard
4. API routes are protected with Clerk authentication

## 🚨 Troubleshooting

### Common Issues

1. **Clerk Authentication Error**
   ```
   Missing publishableKey
   ```
   **Solution**: Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env`

2. **Database Connection Error**
   ```
   Can't reach database server
   ```
   **Solution**: Verify `DATABASE_URL` and Railway database status

3. **Build Warnings**
   ```
   Node.js API is used which is not supported in Edge Runtime
   ```
   **Solution**: These are warnings from dependencies and don't affect functionality

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the repository or contact the development team.

---

**Built with ❤️ by the Emineon Team** 