# Deployment Configuration Guide

## Overview
This document outlines the production deployment configuration for the CollaborativeWhiteBoard monorepo across Vercel (web app) and Railway (WebSocket server).

## Files Created

### 1. Vercel Configuration
**File**: `apps/web/vercel.json`
- Configures Next.js build command using Turbo to build only the web app
- Maps environment variables using Vercel's `@` syntax for secure secret management
- Output directory configured for `.next`
- Includes all required OAuth and database credentials

**Environment Variables to set in Vercel**:
- `NEXTAUTH_URL` — Your production domain (e.g., `https://whiteboard.example.com`)
- `NEXTAUTH_SECRET` — Min 32 characters, secure random string
- `MONGODB_URI` — MongoDB Atlas connection string
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` — GitHub OAuth credentials
- `NEXT_PUBLIC_WS_SERVER_URL` — Railway WebSocket server URL

### 2. WebSocket Server Dockerfile
**File**: `apps/ws-server/Dockerfile`
- Multi-stage build (builder + runner) to minimize final image size
- Installs dependencies for both ws-server and shared packages
- Builds TypeScript into `/dist` directory
- Runs on Node.js 20 Alpine (lightweight production image)
- Exposes port 3001 (configurable via PORT env var)

**Build Command**: `docker build -f apps/ws-server/Dockerfile -t whiteboard-ws:latest .`
**Run Command**: `docker run -p 3001:3001 -e CORS_ORIGIN=... -e PORT=3001 whiteboard-ws:latest`

### 3. Railway Configuration
**File**: `apps/ws-server/railway.toml`
- Specifies Dockerfile path for Railway deployment
- Configures health check endpoint at `/health` (already implemented in server.ts)
- Restart policy: `on_failure` with max 3 retries
- Service name: `ws-server`

**Environment Variables to set in Railway**:
- `CORS_ORIGIN` — Allowed origins (e.g., `https://whiteboard.example.com`)
- `PORT` — Defaults to 4000 in code, can override (Railway typically uses 3001)
- `MONGODB_URI` — Same as Vercel
- `JWT_SECRET` — Must match Vercel's `NEXTAUTH_SECRET`

### 4. Environment Variables Documentation
**File**: `.env.example`
- Complete list of all required environment variables
- Local development defaults (localhost)
- Production placeholders for OAuth and database credentials
- Includes descriptions for each variable

**Key Variables**:
- `NEXTAUTH_URL` — Frontend URL for callback redirects
- `NEXTAUTH_SECRET` — Shared JWT secret between Next.js and ws-server
- `JWT_SECRET` — Must equal `NEXTAUTH_SECRET` for ws-server token validation
- `CORS_ORIGIN` — Controls WebSocket CORS policy on ws-server
- `NEXT_PUBLIC_WS_SERVER_URL` — Exposed to browser for WebSocket connections

### 5. GitHub Actions CI Pipeline
**File**: `.github/workflows/ci.yml`
- Runs on push/PR to `main` or `master` branches
- Node.js 20 on Ubuntu latest
- Uses npm workspace caching for fast builds
- Executes type checking, linting, and full build pipeline via Turbo
- Catches issues before deployment

**Pipeline Steps**:
1. Checkout code
2. Setup Node.js 20 with npm cache
3. Install dependencies
4. Run type checking
5. Run ESLint
6. Build all packages

## Deployment Workflow

### Development
```bash
npm install
npm run dev          # Runs both apps on localhost:3000 (web) and localhost:4000 (ws)
```

### Build Locally
```bash
npm run build        # Builds all packages using Turbo
npm run lint         # Lints all packages
npm run typecheck    # Type checks all packages
```

### Deploy to Vercel

1. Connect GitHub repository to Vercel
2. Set production environment variables in Vercel dashboard
3. Vercel automatically deploys on push to `main`

**Important**: The `vercel.json` uses `cd ../.. && npx turbo build --filter=web` to build from monorepo root.

### Deploy to Railway

1. Create Railway project
2. Connect GitHub repository
3. Select the root directory (not `apps/ws-server`)
4. Set `railway.toml` as build configuration file
5. Add environment variables in Railway dashboard
6. Railway automatically builds and deploys on push

## Health Checks

The ws-server includes a health check endpoint:

```
GET /health
Response: { "status": "ok", "timestamp": "2026-03-22T12:00:00Z" }
```

This is used by:
- Railway health checks (configured in `railway.toml`)
- Production monitoring and load balancers
- Zero-downtime deployment validation

## Security Checklist

- [ ] Set `NEXTAUTH_SECRET` to unique random 32+ char string
- [ ] Set `MONGODB_URI` with strong password, IP whitelist in Atlas
- [ ] Configure Google & GitHub OAuth with production callback URLs
- [ ] Set `NEXT_PUBLIC_WS_SERVER_URL` to Railway domain (HTTPS)
- [ ] Set `CORS_ORIGIN` to exact production domain
- [ ] Enable HTTPS on Vercel (automatic) and Railway
- [ ] Restrict MongoDB Atlas network access to Railway server IPs
- [ ] Rotate OAuth secrets quarterly
- [ ] Never commit `.env` files (`.gitignore` prevents this)

## Monitoring

Add monitoring to:
- Vercel deployment logs and performance dashboard
- Railway logs and metrics
- MongoDB Atlas alerts for connection issues
- Custom application metrics (could add APM)

## Rollback Procedures

**Vercel**: Automatic previous deployment rollback in UI
**Railway**: Git-based rollback or manual Docker image selection

## CI/CD Pipeline Status

The GitHub Actions workflow validates:
- TypeScript compilation errors
- ESLint warnings and errors
- Build success for both apps
- Dependency resolution

All checks must pass before merging to `main`.

## Next Steps

1. Create OAuth applications on Google Cloud and GitHub
2. Set up MongoDB Atlas project with appropriate tiers
3. Configure Vercel project with environment variables
4. Configure Railway project with environment variables
5. Test deployment with GitHub Actions
6. Monitor first production deployment
7. Set up alerts and dashboards
