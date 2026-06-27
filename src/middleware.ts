import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que exigem autenticação
const PROTECTED_ROUTES = [
  '/dashboard',
  '/perfil',
  '/candidaturas',
  '/notificacoes',
  '/campaigns/new',
];

const STORAGE_KEY = 'mutirao_user_profile';

function getProfileFromCookies(request: NextRequest): boolean {
  // O perfil é armazenado no localStorage (client-side only).
  // No middleware (edge), verificamos via cookie que setamos no login.
  const authCookie = request.cookies.get(STORAGE_KEY);
  return !!authCookie?.value;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthenticated = getProfileFromCookies(request);

  // Se rota protegida e não autenticado → redireciona para login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Headers de segurança para todas as respostas
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|api/).*)',
  ],
};
