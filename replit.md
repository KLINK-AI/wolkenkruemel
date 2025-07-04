# Wolkenkruemel - Community Dog Training Platform

## Overview

Wolkenkruemel is a full-stack web application for dog training activities and community engagement. The platform allows users to create, share, and discover training activities while building a supportive community around dog training experiences.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Payment Processing**: Stripe integration for subscription management
- **Session Management**: PostgreSQL sessions with connect-pg-simple

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Location**: `shared/schema.ts` for shared database schema
- **Migrations**: Drizzle Kit for database migrations in `./migrations` directory

## Key Components

### Database Schema
The application uses a comprehensive schema with the following main entities:
- **Users**: User profiles with subscription tiers and activity tracking
- **Activities**: Training activities with difficulty levels and content
- **Posts**: Community posts with types (post, question, success_story)
- **Comments**: Nested comments on posts
- **Likes**: User interactions on posts and comments
- **Follows**: User following relationships
- **Events**: Community events and meetups
- **Notifications**: User notification system

### Authentication & Authorization
- Role-based access control (user, admin, moderator)
- Subscription-based feature gating (free, premium, professional)
- Stripe integration for subscription management

### Community Features
- Feed-based content discovery
- Q&A forum functionality
- Success story sharing
- User following and networking
- Trending topics and tags
- Event management

## Data Flow

### Content Creation Flow
1. User creates activity/post through form validation
2. Data validated with Zod schemas
3. Stored in PostgreSQL via Drizzle ORM
4. Real-time updates via React Query cache invalidation

### Community Interaction Flow
1. Users browse content via paginated feeds
2. Interactions (likes, comments, follows) update database
3. UI updates optimistically with React Query
4. Notifications triggered for relevant users

### Subscription Flow
1. Users select subscription tier
2. Stripe handles payment processing
3. Subscription status stored in user profile
4. Feature access controlled by subscription tier

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@stripe/stripe-js**: Payment processing
- **@radix-ui/***: Accessible UI primitives
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **react-hook-form**: Form handling
- **zod**: Schema validation

### Development Dependencies
- **tsx**: TypeScript execution
- **vite**: Build tool and dev server
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Build Process
1. **Development**: `npm run dev` - Uses tsx for server and Vite for client
2. **Build**: `npm run build` - Vite builds client, esbuild bundles server
3. **Production**: `npm run start` - Runs bundled server with static assets

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **STRIPE_SECRET_KEY**: Stripe API key (required)
- **VITE_STRIPE_PUBLIC_KEY**: Stripe public key for client
- **NODE_ENV**: Environment mode (development/production)

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript definitions
├── migrations/      # Database migrations
└── dist/           # Build output
```

## Changelog

Changelog:
- July 04, 2025. Initial setup
- July 04, 2025. Replaced all placeholder logos with authentic Wolkenkrümel SVG design featuring clouds and dogs
- July 04, 2025. Updated homepage content: changed title to "Warum die Wolkenkrümel Platform?" and removed "Bewährte Methoden" section per user request

## User Preferences

Preferred communication style: Simple, everyday language.