import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que exigem qualquer autenticação
const PROTECTED_ROUTES = [
  '/dashboard',
  '/perfil',
  '/candidaturas',
  '/notificacoes',
  '/vagas',
];

const STORAGE_KEY = 'prove_user_profile';

interface StoredProfile {
  id: string;
  profileType: 'donor' | 'volunteer' | 'institution' | 'fiscal' | 'admin' | 'company';
  role: 'donor' | 'volunteer' | 'institution' | 'fiscal' | 'admin' | 'company';
  name: string;
  email: string;
  approvalStatus?: 'pending_approval' | 'approved' | 'rejected';
}

function getProfileFromCookies(request: NextRequest): StoredProfile | null {
  const authCookie = request.cookies.get(STORAGE_KEY);
  if (!authCookie?.value) return null;
  try {
    return JSON.parse(decodeURIComponent(authCookie.value)) as StoredProfile;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const profile = getProfileFromCookies(request);
  const isAuthenticated = !!profile;

  // Se rota protegida e não autenticado → redireciona para login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && profile) {
    // Regra: Apenas instituições e administradores podem criar campanhas
    if (pathname.startsWith('/campaigns/new')) {
      if (profile.role !== 'institution' && profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Regra: Apenas fiscais e administradores podem ver o painel do fiscal
    if (pathname.startsWith('/fiscal')) {
      if (profile.role !== 'fiscal' && profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Regra: Apenas administradores podem ver o painel do admin
    if (pathname.startsWith('/admin')) {
      if (profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
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
