import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Check if it's app subdomain
  if (hostname.startsWith('app.')) {
    // app.zkrune.com traffic
    const url = request.nextUrl.clone();
    
    // Redirect root to templates
    if (url.pathname === '/') {
      url.pathname = '/templates';
      return NextResponse.redirect(url);
    }
    
    // Allow app routes: /templates, /dashboard, /verify-proof
    if (url.pathname.startsWith('/templates') || 
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/verify-proof') ||
        url.pathname.startsWith('/api')) {
      return NextResponse.next();
    }
    
    // Redirect other paths to main domain
    url.host = hostname.replace('app.', '');
    return NextResponse.redirect(url);
  }
  
  // Main domain (zkrune.com)
  // Block app routes on main domain (optional)
  // Or allow everything (current behavior)
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

