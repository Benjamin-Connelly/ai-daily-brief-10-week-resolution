// Cloudflare Pages Function to serve Week 1 app at /week-01/*
// This rewrites /week-01/* requests to serve from the root dist folder

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Rewrite /week-01/* to /* for file serving
  const newPath = url.pathname.replace('/week-01', '') || '/';
  const newUrl = new URL(newPath + url.search, url.origin);
  const newRequest = new Request(newUrl, request);
  
  return next(newRequest);
}
