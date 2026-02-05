# K-Flow Agent Guidelines

This document provides guidelines for agentic coding agents working on the K-Flow Korean learning platform.

## Project Overview

K-Flow is a Next.js-based Korean learning application that analyzes YouTube content (K-dramas, K-pop, etc.) to provide comprehensive language learning experiences. The app uses AI to generate detailed analyses including expressions, grammar, vocabulary, and practice exercises.

## Development Commands

### Core Commands
```bash
# Development server (run from frontend/ directory)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Testing
Currently no test framework is configured. When adding tests, check for existing test setup first.

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode enabled** - All TypeScript strict rules are enforced
- **Target**: ES2017
- **Module resolution**: Bundler
- **JSX**: React-JSX
- **Path aliases**: `@/*` maps to `./` (use for internal imports)

### Import Organization
```typescript
// 1. React/Next.js imports
import React, { useState } from "react";
import Link from "next/link";

// 2. Third-party libraries
import { Montserrat } from "next/font/google";

// 3. Internal imports (use @ alias)
import type { AnalysisResult } from "@/app/types/analysis";
import { AudioButton } from "./components/AudioButton";
```

### Component Structure
```typescript
// 1. "use client" directive for client components
"use client";

// 2. Imports (organized as above)

// 3. Type definitions (if component-specific)
interface ComponentProps {
  // props here
}

// 4. Component definition
export default function Component({ prop }: ComponentProps) {
  // Component logic
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `AudioButton`, `ResultResponse`)
- **Files**: PascalCase for components (e.g., `Button.tsx`), camelCase for utilities
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase with descriptive names

### Styling Guidelines

#### Tailwind CSS Usage
- **Primary colors**: Use CSS custom properties defined in `globals.css`:
  - `--background`: #427EA9 (main blue)
  - `--lemon`: #EFF889 (yellow accent)
  - `--font`: #F9F8EE (text color)
  - `--lightbeige`: #AA927B
  - `--lightblue`: #6399B2
  - `--brown`: #4D2A1A

- **Color application**:
```typescript
className="bg-[var(--lemon)] text-black"
className="bg-[var(--background)] text-[var(--font)]"
```

#### Component Styling Patterns
```typescript
// Buttons
className="w-24 h-12 flex items-center justify-center bg-[var(--lemon)] rounded-full shrink-0 hover:bg-[var(--lightbeige)] text-black"

// Cards
className="rounded-lg p-6 bg-white shadow hover:shadow-lg transition"

// Text hierarchy
className="text-2xl font-bold mb-4"
className="text-sm text-gray-600"
```

### State Management
- Use React hooks (`useState`, `useEffect`, `useCallback`) for local state
- Custom hooks for complex logic (e.g., `useAudioPlayer`)
- Type all state properly with TypeScript

### Error Handling
```typescript
// Async operations
try {
  await operation();
} catch (error) {
  console.error('Operation failed:', error);
  // User-friendly error handling
}

// Component error boundaries (when needed)
```

### File Organization
```
frontend/
├── app/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API/external service integrations
│   ├── types/         # TypeScript type definitions
│   └── [pages]/       # Next.js pages/routes
```

## Development Patterns

### Component Props
- Always define interfaces for component props
- Use optional properties (`?`) when appropriate
- Provide default values for common props

### Data Fetching
- Use Next.js App Router patterns for data fetching
- Implement proper loading states
- Handle errors gracefully

### Audio/Video Features
- Use the `useAudioPlayer` hook for audio functionality
- Support both TTS and audio file playback
- Implement YouTube segment playback when needed

### Internationalization
- Korean text should be preserved in original form
- Provide romanization and English translations
- Use proper Unicode handling for Korean characters

## Code Quality

### Linting
- ESLint is configured with Next.js recommended rules
- Run `npm run lint` before committing
- Fix all linting errors

### Type Safety
- Maintain strict TypeScript compliance
- Avoid `any` types - use proper interfaces
- Use type guards for runtime type checking

### Performance
- Use React.memo for expensive components
- Implement proper dependency arrays in hooks
- Optimize re-renders with useCallback/useMemo

## Best Practices

### Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation support

### Responsive Design
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`)
- Test on different screen sizes
- Implement mobile-first approach

### Security
- Never expose API keys or secrets
- Validate user inputs
- Use proper CORS policies

## Testing Guidelines

When adding tests:
1. Check for existing test framework setup
2. Write unit tests for utility functions
3. Test component rendering and interactions
4. Mock external dependencies (APIs, etc.)

## Deployment Considerations

- Ensure `npm run build` completes without errors
- Test production build locally
- Verify environment variables are properly configured
- Check that all assets are properly optimized