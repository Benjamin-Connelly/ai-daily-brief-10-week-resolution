# Shared Assets Directory

This directory contains assets shared across all weeks of the AI Resolution Project, accessible at `ai-resolution.benjaminconnelly.com/assets/`.

## Structure

```
assets/
  images/
    shrike-larder.png    # Main landing page illustration (generated from Gemini 3 Pro)
    [other shared images]
```

## Usage

Assets in this directory are:
- Served from the root of the domain: `/assets/images/shrike-larder.png`
- Accessible to all week projects
- Copied to the build output during deployment

## Adding Assets

1. Place new shared assets in the appropriate subdirectory (`images/`, `fonts/`, etc.)
2. Reference them in code using absolute paths: `/assets/images/filename.png`
3. The build process will automatically copy them to `dist/assets/`

## Week-Specific Assets

Week-specific assets should remain in their respective project directories:
- `week-01-resolution-tracker/public/images/` for Week 1 assets
- `week-02-resolution-tracker/public/images/` for Week 2 assets
- etc.
