# Emineon ATS Frontend

A modern, full-featured frontend application for the Emineon ATS (AI-First Recruitment Platform) built with Next.js, TypeScript, TailwindCSS, and Clerk authentication.

## 🚀 Features

- **Modern Stack**: Next.js 15 with App Router, TypeScript, TailwindCSS
- **Authentication**: Clerk.dev integration with sign-in/sign-up/user management
- **API Integration**: SWR for data fetching from external backend API
- **Form Validation**: Zod schemas with React Hook Form
- **UI Components**: Custom component library with Emineon design system
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Professional UX**: Clean, modern design matching https://emineon.com/product

## 📱 Pages

- **Dashboard** (`/`) - Welcome screen with stats and recent activity
- **Candidates** (`/candidates`) - List and manage candidates
- **Add Candidate** (`/candidates/new`) - Form to add new candidates
- **Clients** (`/clients`) - Client management with dummy data
- **Jobs** (`/jobs`) - Job listings with dummy data
- **User Profile** (`/user`) - Clerk user profile management
- **Authentication** (`/sign-in`, `/sign-up`) - Clerk auth pages

## 🎨 Design System

### Colors
- **Primary**: Deep Navy (#0A2F5A) - Emineon brand color
- **Secondary**: Light grays and whites
- **Accent**: Blue tones for highlights
- **Success**: Green for positive actions
- **Warning**: Amber for cautions
- **Error**: Red for errors

### Components
- `Card` - Flexible card component with variants
- `Sidebar` - Navigation with active states
- `TopBar` - Header with user info
- `Layout` - Main application layout

## 🛠 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env.local

# Update .env.local with your credentials:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY  
# - NEXT_PUBLIC_API_BASE
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` |
| `NEXT_PUBLIC_API_BASE` | Backend API URL | `https://api.example.com/api` |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── candidates/        # Candidate pages
│   ├── clients/           # Client pages
│   ├── jobs/              # Job pages
│   ├── user/              # User profile
│   ├── sign-in/           # Authentication
│   └── sign-up/           
├── components/            # React components
│   ├── layout/            # Layout components
│   │   ├── Layout.tsx     # Main layout
│   │   ├── Sidebar.tsx    # Navigation
│   │   └── TopBar.tsx     # Header
│   └── ui/                # UI components
│       └── Card.tsx       # Card component
├── hooks/                 # Custom hooks
│   └── useCandidates.ts   # SWR hooks
├── lib/                   # Utility functions
│   ├── api.ts             # API client
│   ├── utils.ts           # Utility functions
│   └── validation.ts      # Zod schemas
└── middleware.ts          # Clerk middleware
```

## 🔌 API Integration

The frontend connects to the backend API at:
- **Production**: `https://expressjs-prisma-production-307d.up.railway.app/api`
- **Local**: `http://localhost:3001/api`

### API Endpoints Used:
- `GET /health` - Health check
- `GET /candidates` - List candidates
- `POST /candidates` - Create candidate
- `GET /candidates/:id` - Get candidate
- `DELETE /candidates/:id` - Delete candidate

## 🛡 Authentication

Authentication is handled by Clerk with the following features:
- User sign-up and sign-in
- Organization support
- User profile management
- Protected routes
- JWT token handling for API requests

## 🎯 Key Features

### Dashboard
- Welcome message with user name
- Organization information
- Statistics cards with hover effects
- Recent activity feed
- Quick action buttons

### Candidates Management
- Responsive card layout
- Search and filtering (ready for implementation)
- Add new candidates with form validation
- Skills display with truncation
- Experience and contact information

### Form Validation
- Zod schemas for type-safe validation
- React Hook Form integration
- Real-time validation feedback
- Error handling and display

### UI/UX
- Consistent design language
- Hover effects and transitions
- Loading states and error handling
- Responsive design for all screen sizes
- Accessibility considerations

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables for Production
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_BASE=https://your-backend-api.com/api
```

## 📊 Performance

- **Next.js 15** with App Router for optimal performance
- **SWR** for efficient data fetching with caching
- **TailwindCSS** for optimized CSS bundle
- **TypeScript** for type safety and better DX
- **Responsive images** and optimized assets

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- TypeScript strict mode enabled
- ESLint configuration with Next.js rules
- Consistent component structure
- Custom hooks for data fetching
- Utility-first CSS with Tailwind

## 🤝 Contributing

1. Follow the established component patterns
2. Use TypeScript for all new files
3. Implement proper error handling
4. Add proper loading states
5. Follow the design system guidelines
6. Test on multiple screen sizes

## 📝 Notes

- The current implementation includes dummy data for Clients and Jobs pages
- Backend integration is fully configured for Candidates
- Design system matches Emineon branding
- Ready for production deployment
- All major features are implemented and functional

## 🔗 Related

- **Backend API**: Located in `../app-emineon/` directory
- **Design Reference**: https://emineon.com/product
- **Authentication**: Clerk.dev documentation
- **UI Framework**: TailwindCSS documentation 