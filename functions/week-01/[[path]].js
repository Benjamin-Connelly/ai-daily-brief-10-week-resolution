// Cloudflare Pages Function to handle /week-01/* routing
// Rewrites asset requests but passes through route requests to React Router

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // If path starts with /week-01/assets/ or /week-01/static/, rewrite to /assets/ or /static/
  // (These are Vite build outputs that need to be served from root)
  if (url.pathname.startsWith('/week-01/assets/') || url.pathname.startsWith('/week-01/static/')) {
    const newPath = url.pathname.replace('/week-01', '');
    const newUrl = new URL(newPath + url.search, url.origin);
    const newRequest = new Request(newUrl, request);
    return next(newRequest);
  }
  
  // For all other /week-01/* requests, pass through to React Router
  // React Router will handle the routing
  return next();
}
