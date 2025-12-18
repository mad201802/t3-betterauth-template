# Contributing to T3 BetterAuth Template

Thanks for your interest in contributing! Here are some guidelines.

## Code Style

- Use **TypeScript** for all code
- Use **named exports** (not default exports)
- Add **JSDoc comments** to exported functions and types
- Keep components **focused and small**

## File Naming

- Use **kebab-case** for files: `my-component.tsx`
- Use **PascalCase** for components: `export function MyComponent()`
- Prefix client components with `"use client"`

## Adding Routes

1. Create folder in `src/app/` following Next.js App Router conventions
2. Add route to `APP_CONFIG.routes` in `src/config.ts`
3. Update navigation in `src/constants/navigation.ts` if needed

## Adding Components

1. For UI primitives: Use `bunx shadcn-ui@latest add <component>`
2. For app components: Create in `src/components/` with appropriate subfolder
3. Export shared types to `src/types/index.ts`

## Adding tRPC Procedures

1. Create router in `src/server/api/routers/`
2. Register in `src/server/api/root.ts`
3. Use `protectedProcedure` for authenticated routes, `publicProcedure` for public

## Commits

- Use descriptive commit messages
- Reference issues when applicable

## Questions?

Open an issue for discussion.
