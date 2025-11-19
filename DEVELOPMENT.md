# Development Guide

This guide provides information for developers working on the TaskZen project.

## Setup for New Developers

### 1. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd Task-Code-main

# Install dependencies
npm install --legacy-peer-deps

# Create local environment file
cp .env.example .env.local
```

### 2. Start Development

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

## Code Standards

### TypeScript
- Always use TypeScript for type safety
- Define interfaces in `lib/types.ts` for shared types
- Avoid using `any` type
- Use proper typing for function parameters and return types

### Component Structure

```typescript
// Good component structure
import { FC } from 'react'
import { SomeType } from '@/lib/types'

interface MyComponentProps {
  title: string
  onSubmit: (data: SomeType) => void
}

export const MyComponent: FC<MyComponentProps> = ({ title, onSubmit }) => {
  return <div>{title}</div>
}
```

### File Naming
- Components: PascalCase (e.g., `TaskCard.tsx`)
- Utilities: camelCase (e.g., `taskUtils.ts`)
- Types: camelCase or PascalCase (e.g., `types.ts`)
- Folders: kebab-case (e.g., `task-list`)

### Styling
- Use Tailwind CSS utility classes
- Follow the Tailwind CSS best practices
- Use custom CSS only when necessary (in component's CSS files)
- Avoid inline styles

### Component Organization

```
components/
├── feature-name/
│   ├── component-name.tsx
│   ├── component-name.module.css (if needed)
│   └── index.ts
└── index.ts
```

## Context Usage

### Project Context

```typescript
import { useProject } from '@/lib/project-context'

const Component = () => {
  const { projects, addProject } = useProject()
  // Use context
}
```

### Task Context

```typescript
import { useTask } from '@/lib/task-context'

const Component = () => {
  const { tasks, addTask } = useTask()
  // Use context
}
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Testing (when implemented)
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Git Workflow

### Branch Naming
- Feature: `feature/feature-name`
- Bugfix: `bugfix/bug-name`
- Hotfix: `hotfix/critical-fix`

### Commit Messages
```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation changes
- `style` - Code style changes (no logic changes)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build, CI, dependency updates

Example:
```
feat: add task filtering by priority

Allow users to filter tasks by priority level in the task list view.
Also add sorting options.

Fixes #123
```

### Pull Request Process
1. Create feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Create a pull request
5. Wait for code review
6. Address review comments
7. Merge when approved

## Debugging

### Browser DevTools
- Use Chrome/Firefox DevTools for debugging
- Use React DevTools for component inspection
- Use Redux DevTools if state management is added

### Console Logging
```typescript
console.log('Debug message:', data)
console.warn('Warning:', issue)
console.error('Error:', error)
```

### VS Code Debugging
Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Environment Variables

### Development
```
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Production
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.example.com
```

See `.env.example` for all available variables.

## Performance Tips

1. **Code Splitting** - Next.js automatically code-splits by page
2. **Image Optimization** - Use Next.js `Image` component
3. **Dynamic Imports** - Use `dynamic()` for heavy components
4. **Memoization** - Use `React.memo()` for expensive components
5. **useMemo/useCallback** - Use appropriately, don't overuse

## Testing

When tests are added, follow these practices:

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    render(<Component />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('result')).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Module Not Found
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Dependency Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

## Getting Help

- Check existing issues and PRs
- Ask in team Slack/chat
- Create an issue with detailed information
- Tag relevant team members for review

---

**Last Updated:** November 19, 2025
