# TaskZen - Project Management Application

A modern task management and project tracking application built with Next.js, React, and TypeScript.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Building](#building)
- [File Structure Guide](#file-structure-guide)
- [Contributing](#contributing)

## 🎯 Project Overview

TaskZen is a collaborative task management tool designed to help teams organize, track, and manage projects efficiently. Features include:

- Dashboard with KPI cards and activity tracking
- Task management with multiple views (list, kanban, calendar)
- Project management
- Team activity monitoring
- Task prioritization and status tracking

## 📁 Project Structure

```
Task-Code-main/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Dashboard home page
│   ├── globals.css              # Global styles
│   └── projects/
│       └── [id]/
│           └── page.tsx         # Project detail page
├── components/                   # React components
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── kpi-cards.tsx       # KPI metrics display
│   │   ├── task-chart.tsx      # Chart visualization
│   │   └── team-activity.tsx   # Team activity feed
│   ├── layout/                 # Layout components
│   │   ├── header.tsx          # Header/top navigation
│   │   ├── main-layout.tsx     # Main layout wrapper
│   │   └── sidebar.tsx         # Sidebar navigation
│   ├── modals/                 # Modal dialogs
│   │   ├── quick-add-task-modal.tsx
│   │   └── quick-add-project-modal.tsx
│   ├── tasks/                  # Task view components
│   │   ├── calendar-view.tsx   # Calendar task view
│   │   ├── kanban-view.tsx     # Kanban board view
│   │   ├── task-list.tsx       # List view
│   │   └── task-modal.tsx      # Task detail modal
│   ├── ui/                     # Reusable UI components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── theme-provider.tsx      # Theme provider wrapper
├── lib/                         # Utility functions and contexts
│   ├── project-context.tsx     # Project state management
│   ├── task-context.tsx        # Task state management
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions
├── public/                      # Static assets
│   ├── icons/
│   ├── images/
│   └── ...
├── styles/                      # Additional stylesheets
│   └── globals.css
├── .env.local                   # Local environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── .editorconfig                # Editor configuration
├── .npmrc                        # NPM configuration
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── next.config.mjs              # Next.js configuration
├── postcss.config.mjs           # PostCSS configuration
└── components.json              # UI components configuration

```

## 🛠 Tech Stack

### Frontend
- **Next.js** 15.0.0 - React framework with built-in optimizations
- **React** 19.2.0 - UI library
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI component library
- **Recharts** - Chart library for data visualization
- **Lucide React** - Icon library

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS transformation
- **Autoprefixer** - CSS vendor prefixes
- **Next Themes** - Theme provider

### State Management
- React Context API (custom hooks)

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Task-Code-main
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Environment Variables

See `.env.local` for local development variables and `.env.example` for the template.

Key variables:
- `NODE_ENV` - Environment mode (development/production)
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_API_URL` - API endpoint URL
- `NEXT_PUBLIC_ANALYTICS_ID` - Analytics ID

## 💻 Development

### Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Test locally using `npm run dev`
4. Commit changes with clear messages
5. Push to repository and create a pull request

## 🏗️ Building

```bash
npm run build
npm start
```

The application will be optimized and ready for production deployment.

## 📖 File Structure Guide

### Components Organization

- **dashboard/** - Dashboard page components
- **layout/** - Layout and navigation components
- **modals/** - Modal dialogs
- **tasks/** - Task management views
- **ui/** - Reusable UI components from Radix UI

### Context Providers

Located in `lib/`:
- `project-context.tsx` - Project state and operations
- `task-context.tsx` - Task state and operations

### Type Definitions

- `lib/types.ts` - All TypeScript interfaces and types

### Utilities

- `lib/utils.ts` - Helper functions and utilities

## 📝 Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Create descriptive commit messages
4. Test changes thoroughly before submitting PRs
5. Update documentation as needed

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, please contact the development team.

---

**Last Updated:** November 19, 2025
**Version:** 0.1.0
