# Deployment Guide - Week 1 Resolution Tracker

## Cloudflare Pages Setup

This project is deployed to `ai-resolution.benjaminconnelly.com/week-01/`

### Prerequisites

1. Cloudflare account with `benjaminconnelly.com` domain configured
2. GitHub repository connected to Cloudflare Pages

### Deployment Steps

#### Option 1: Cloudflare Pages Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Create a new project (or use existing)
3. Connect to GitHub repository: `Benjamin-Connelly/ai-daily-brief-10-week-resolution`
4. Configure build settings:
   - **Framework preset**: Vite (or None)
   - **Build command**: `cd week-01-resolution-tracker && npm install && npm run build`
   - **Build output directory**: `week-01-resolution-tracker/dist`
   - **Root directory**: `/` (monorepo root)
   - **Note**: The build script automatically copies `functions/` to `dist/` (see package.json)
6. Add custom domain:
   - Domain: `ai-resolution.benjaminconnelly.com`
7. Deploy!

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

# Copy functions to dist
cp -r ../functions dist/

# Deploy
wrangler pages deploy dist --project-name=week-01-resolution-tracker
```

### Build Configuration

- **Base path**: `/` (configured in `vite.config.ts`)
- **Output**: `dist/` directory
- **SPA routing**: Handled by `_redirects` file
- **Path routing**: Handled by Cloudflare Pages Functions in `functions/week-01/[[path]].js`

### How It Works

1. User visits `ai-resolution.benjaminconnelly.com/week-01/`
2. Cloudflare Pages Function (`functions/week-01/[[path]].js`) intercepts the request
3. Function rewrites `/week-01/*` to `/*` to serve files from root
4. React app loads with base path `/` (assets load correctly)
5. SPA routing handled by `_redirects` file

### URL Structure

- **Production**: `https://ai-resolution.benjaminconnelly.com/week-01/`
- **Demo mode**: `https://ai-resolution.benjaminconnelly.com/week-01/?demo=true`

### Testing Locally

```bash
cd week-01-resolution-tracker
npm run build
npm run preview
```

Visit: `http://localhost:4173/` (Functions don't work locally, test routing separately)

### Demo Mode

Share the demo URL with peers:
```
https://ai-resolution.benjaminconnelly.com/week-01/?demo=true
```

This shows realistic sample data without affecting localStorage.

### Troubleshooting

**Issue**: Routes return 404
- **Solution**: Ensure `_redirects` file is in the build output (`dist/`)
- **Solution**: Ensure `functions/` folder is copied to `dist/functions/`

**Issue**: Assets not loading
- **Solution**: Base path is `/`, so assets should load from root
- **Solution**: Check browser console for 404 errors on asset paths

**Issue**: `/week-01/` shows blank page
- **Solution**: Verify Functions folder is in build output
- **Solution**: Check Cloudflare Pages Functions logs in dashboard
