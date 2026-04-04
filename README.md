# T3 BetterAuth Template

A production-ready T3 Stack template with BetterAuth authentication, designed as a starting point for building modern SaaS applications.

## ✨ Features

- 🔐 **Email/Password & OAuth** - GitHub, Google authentication
- 🛡️ **Two-Factor Authentication** - TOTP-based 2FA with QR codes
- 🔑 **Passkeys** - WebAuthn support for passwordless login
- ✉️ **Email verification & password recovery** - Transactional emails via Resend
- 🎨 **Modern UI** - shadcn/ui components with dark mode
- 📱 **Responsive dashboard** - Collapsible sidebar, mobile-friendly
- 🔒 **Security** - Rate limiting, secure sessions

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Auth | [BetterAuth](https://www.better-auth.com/) |
| Database | [Prisma](https://www.prisma.io/) + SQLite (easily swappable) |
| API | [tRPC](https://trpc.io/) |
| UI | [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| Validation | [Zod](https://zod.dev/) |
| Email | [Resend](https://resend.com/) |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (sign-in, sign-up, etc.)
│   ├── dashboard/         # Protected dashboard pages
│   └── api/               # API routes
├── components/
│   ├── sidebar/           # Dashboard sidebar components
│   ├── theme/             # Theme provider and toggle
│   └── ui/                # shadcn/ui components
├── constants/             # App constants (navigation, etc.)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── utils.ts           # General utilities (cn, etc.)
│   ├── email-templates.ts # Transactional email templates
│   └── validation-schemas.ts # Zod schemas
├── server/
│   ├── api/               # tRPC routers
│   ├── better-auth/       # BetterAuth configuration
│   └── db.ts              # Prisma client
├── trpc/                  # tRPC client setup
├── types/                 # Shared TypeScript types
├── config.ts              # App configuration
└── env.js                 # Environment variables schema
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- A database (SQLite included, or use PostgreSQL/MySQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/t3-betterauth-template.git
   cd t3-betterauth-template
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or: npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your values:
   - `BETTER_AUTH_SECRET` - Generate with `openssl rand -base64 32`
   - OAuth credentials for GitHub/Google (optional for development)

4. **Set up the database**
   ```bash
   bun run db:push
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### App Configuration

All app settings are centralized in `src/config.ts`:

```typescript
import { APP_CONFIG } from "@/config";

// Access app name
APP_CONFIG.naming.applicationName

// Access routes
APP_CONFIG.routes.auth

// Access auth settings
APP_CONFIG.auth.emailMinLength
```

### Environment Variables

See `.env.example` for all available variables:

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Secret for signing auth tokens |
| `DATABASE_URL` | Database connection string |
| `BETTER_AUTH_GITHUB_CLIENT_ID/SECRET` | GitHub OAuth credentials |
| `BETTER_AUTH_GOOGLE_CLIENT_ID/SECRET` | Google OAuth credentials |
| `RESEND_API_KEY` | Resend API key for emails |

### OAuth Setup

#### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL to `http://localhost:3000/api/auth/callback/github`

#### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Set callback URL to `http://localhost:3000/api/auth/callback/google`

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run check` | Run lint + typecheck |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript compiler |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Prisma migration |
| `bun run db:studio` | Open Prisma Studio |

## 🎨 Customization

### Branding

Update `src/config.ts`:
```typescript
export const APP_CONFIG = {
  naming: {
    applicationName: "Your App Name",
    applicationShortName: "YourApp",
  },
  // ...
}
```

### Navigation

Edit `src/constants/navigation.ts` to customize sidebar links.

### Email Templates

Modify `src/lib/email-templates.ts` to customize transactional emails.

### UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). Add components with:
```bash
bunx shadcn-ui@latest add <component>
```

## 🗄️ Database

### Switching Databases

1. Update `DATABASE_URL` in `.env`
2. Update the provider in `src/server/better-auth/config.ts`:
   ```typescript
   database: prismaAdapter(db, {
     provider: "postgresql", // or "mysql"
   }),
   ```
3. Update `prisma/schema.prisma` datasource
4. Run `bun run db:push`

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [BetterAuth Documentation](https://www.better-auth.com/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [T3 Stack](https://create.t3.gg/)

## 📄 License

MIT License - feel free to use this template for your projects!