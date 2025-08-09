# Wolkenkruemel - Community Dog Training Platform

## Overview
Wolkenkruemel is a full-stack web application designed for dog training activities and community engagement. Its primary purpose is to allow users to create, share, and discover dog training content while fostering a supportive community. The platform aims to be production-ready, featuring a comprehensive email system, HEIC conversion for iPhone users, and a robust architecture to support growing user interaction.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Radix UI primitives, shadcn/ui
- **State Management**: React Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **UI/UX**: Custom SVG logo with cloud and dog motifs, mint background color for light mode, comprehensive permission system for features based on subscription tiers, mobile-responsive design with hamburger menu, integrated image upload previews, and real-time updates.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (via Neon Database)
- **Payment Processing**: Stripe for subscription management (free, premium tiers)
- **Session Management**: PostgreSQL sessions
- **Authentication & Authorization**: Role-based access control (user, admin, moderator), subscription-based feature gating.

### Data Storage
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe operations
- **Schema**: Comprehensive, including Users, Activities, Posts (general, Q&A, success stories), Comments (nested), Likes, Follows, Events, and Notifications.

### Key Features & Design Decisions
- **Content Creation & Interaction**: Zod validation for forms, real-time UI updates via React Query cache invalidation, paginated feeds, optimistic UI updates for interactions.
- **Community Features**: Feed-based content discovery, Q&A forum, success story sharing, user following, trending topics, event management, real-time like counters, comprehensive comment system with editing and nested replies.
- **Subscription Model**: Freemium model with clear distinctions between free and premium features, handled by Stripe.
- **Image Handling**: Multi-image uploads and editing, server-side HEIC conversion to JPEG, optimized image display for various aspect ratios.
- **User Management**: Profile editing, comprehensive password management (change, forgot, admin reset), email verification via custom SMTP.
- **Error Handling**: Comprehensive error handling with detailed logging and JSON responses, Error Boundary system, and optimistic updates for improved user experience.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@stripe/stripe-js**: Payment processing
- **@radix-ui/***: Accessible UI primitives
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **nodemailer**: Email sending via SMTP
- **heic-convert**: Server-side HEIC to JPEG conversion
- **multer**: File handling for uploads

### Development Dependencies
- **tsx**: TypeScript execution
- **vite**: Build tool and dev server
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development tools