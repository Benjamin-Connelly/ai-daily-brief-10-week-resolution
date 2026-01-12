# Multi-Week Deployment Strategy

## URL Structure

Each week deploys to its own path on `ai-resolution.benjaminconnelly.com`:

- Week 1: `ai-resolution.benjaminconnelly.com/week-01/`
- Week 2: `ai-resolution.benjaminconnelly.com/week-02/`
- Week 3: `ai-resolution.benjaminconnelly.com/week-03/`
- ... and so on

## Deployment Options

### Option A: Separate Cloudflare Pages Projects (Recommended)

**Pros:**
- Each week is independent
- Can deploy weeks separately
- Easy to manage
- No build script complexity

**Setup:**
1. Create a separate Cloudflare Pages project for each week
2. Each project:
   - Build command: `cd week-NN-* && npm install && npm run build`
   - Build output: `week-NN-*/dist`
   - Custom domain: `ai-resolution.benjaminconnelly.com` with path prefix `/week-NN`

**Example for Week 2:**
- Project name: `week-02-model-topography`
- Build command: `cd week-02-model-topography && npm install && npm run build`
- Build output: `week-02-model-topography/dist`
- Custom domain path: `/week-02`

### Option B: Single Cloudflare Pages Project with Unified Build

**Pros:**
- Single project to manage
- Unified deployment pipeline

**Cons:**
- Requires custom build script
- All weeks deploy together
- More complex setup

**Setup:**
1. Create root-level build script that builds each week with correct base path
2. Output structure:
   ```
   dist/
   ├── week-01/
   │   └── [build output]
   ├── week-02/
   │   └── [build output]
   └── ...
   ```
3. Configure Cloudflare Pages:
   - Build command: `npm run build:all`
   - Build output: `dist`
   - Custom domain: `ai-resolution.benjaminconnelly.com`

## Recommended: Option A (Separate Projects)

For your use case, separate Cloudflare Pages projects work best because:
- Each week is a separate codebase
- You can deploy weeks independently
- Simpler configuration
- Easier to debug issues

## Configuration Per Week

Each week's project needs:

1. **Vite config** with base path:
   ```typescript
   base: '/week-NN/'
   ```

2. **_redirects file** in `public/`:
   ```
   /week-NN/*  /week-NN/index.html  200
   ```

3. **Cloudflare Pages settings**:
   - Build command: `cd week-NN-* && npm install && npm run build`
   - Build output: `week-NN-*/dist`
   - Custom domain path: `/week-NN`

## Week 1 Configuration (Current)

- Base path: `/week-01/`
- Cloudflare Pages project: `ai-daily-brief-10-week-resolution` (or rename to `week-01-resolution-tracker`)
- Custom domain: `ai-resolution.benjaminconnelly.com/week-01`

## Future Weeks

When creating Week 2, Week 3, etc.:

1. Create new Cloudflare Pages project
2. Configure build settings for that week's folder
3. Add custom domain with appropriate path prefix
4. Each week is completely independent
