# Image Assets Directory

Place static image files here. Files in `public/` are copied to the root of `dist/` during build.

## Usage in Components

Reference images from the public folder using absolute paths:

```tsx
// In LandingPage.tsx or any component
<img src="/images/shrike-larder.png" alt="The Shrike's Larder" />
```

## File Structure

```
public/
  images/
    shrike-larder.png    # Main landing page illustration
    shrike-larder.webp   # Optimized version (optional)
```

## Notes

- Files in `public/` are served from the root URL (`/`)
- No import needed - use absolute paths starting with `/`
- Vite copies these files as-is to `dist/` during build
- For images that need processing/optimization, use `src/assets/` instead
