# LoveSync - Couple's Connection App

## Overview

LoveSync is a real-time multiplayer couple's game application designed to help partners connect through fun interactive activities. The app features multiple game phases including quizzes, "this or that" choices, "who's more likely" questions, and dares. Built as a full-stack TypeScript application with a React frontend and Express backend, it uses PostgreSQL for data persistence and follows a room-based multiplayer model where couples join via shareable codes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack Query for server state, localStorage for session persistence
- **Styling**: Tailwind CSS with custom playful theme (pink/teal/purple palette)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for micro-interactions and transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: REST endpoints defined in shared route contracts with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions

### Data Storage
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - contains tables for rooms, players, questions, and responses
- **Migrations**: Drizzle Kit with `drizzle-kit push` command for schema synchronization

### Game Flow Architecture
- **Room-based Model**: Players create/join rooms via 4-character codes
- **Phase System**: Games progress through phases (dashboard → quiz → this_that → likely → dare → summary)
- **Question Seeding**: Initial questions are auto-seeded on server startup if database is empty
- **Real-time Polling**: Client polls room status endpoint for game state updates

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/  # UI components (shadcn + custom)
│       ├── pages/       # Route pages and game phases
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
├── shared/           # Shared code between client/server
│   ├── schema.ts     # Drizzle schema definitions
│   └── routes.ts     # API contract definitions
└── migrations/       # Drizzle migration files
```

### Build System
- **Development**: `npm run dev` runs tsx for hot-reloading TypeScript
- **Production Build**: Custom esbuild script bundles server with select dependencies, Vite builds client
- **Type Checking**: `npm run check` runs TypeScript compiler

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **Framer Motion**: Animation library for transitions and gestures
- **canvas-confetti**: Celebration effects for matching answers

### Development Tools
- **Vite**: Frontend build tool with HMR
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner for Replit environment
- **esbuild**: Server bundling for production

### Fonts
- **Google Fonts**: Architects Daughter (display), DM Sans (body text)