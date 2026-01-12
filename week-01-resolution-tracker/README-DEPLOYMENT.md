# Deployment Guide - Week 1 Resolution Tracker

## Cloudflare Pages Setup

This project is configured to deploy to `benjaminconnelly.com/10-week-ai-resolution/week-01/`

### Prerequisites

1. Cloudflare account with `benjaminconnelly.com` domain configured
2. GitHub repository connected to Cloudflare Pages

### Deployment Steps

#### Option 1: Cloudflare Pages Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Create a new project
3. Connect to GitHub repository: `Benjamin-Connelly/ai-daily-brief-10-week-resolution`
4. Configure build settings:
   - **Framework preset**: Vite (or None)
   - **Build command**: `cd week-01-resolution-tracker && npm install && npm run build`
   - **Build output directory**: `week-01-resolution-tracker/dist`
   - **Root directory**: `/` (monorepo root)
   - **Deploy command**: `npx wrangler pages deploy week-01-resolution-tracker/dist --project-name=week-01-resolution-tracker`
   - **Non-production branch deploy command**: `npx wrangler pages deploy week-01-resolution-tracker/dist --project-name=week-01-resolution-tracker`
5. Add custom domain:
   - Domain: `benjaminconnelly.com`
   - Path prefix: `/10-week-ai-resolution/week-01`
6. Deploy!

#### Option 2: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to project
cd week-01-resolution-tracker

# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=week-01-resolution-tracker
```

### Build Configuration

- **Base path**: `/10-week-ai-resolution/week-01/` (configured in `vite.config.ts`)
- **Output**: `dist/` directory
- **SPA routing**: Handled by `_redirects` file

### URL Structure

- **Production**: `https://benjaminconnelly.com/10-week-ai-resolution/week-01/`
- **Demo mode**: `https://benjaminconnelly.com/10-week-ai-resolution/week-01/?demo=true`

### Testing Locally

```bash
cd week-01-resolution-tracker
npm run build
npm run preview
```

Visit: `http://localhost:4173/10-week-ai-resolution/week-01/`

### Demo Mode

Share the demo URL with peers:
```
https://benjaminconnelly.com/10-week-ai-resolution/week-01/?demo=true
```

This shows realistic sample data without affecting localStorage.

### Troubleshooting

**Issue**: Routes return 404
- **Solution**: Ensure `_redirects` file is in the build output

**Issue**: Assets not loading
- **Solution**: Verify `base` path in `vite.config.ts` matches deployment path

**Issue**: React Router not working
- **Solution**: Check that `_redirects` file includes SPA fallback rule
