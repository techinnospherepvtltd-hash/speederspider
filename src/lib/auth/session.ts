import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types';

export interface AdminSession {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  iat: number; // Issued at (seconds)
  exp: number; // Total expiration (seconds, default 24h)
  idleExp: number; // Sliding idle expiration (seconds, default 4h)
}

export const ADMIN_SESSION_COOKIE = 'speederspider_admin_session';
export const SESSION_MAX_AGE_SECONDS = 86400; // 24 hours
export const SESSION_IDLE_TIMEOUT_SECONDS = 14400; // 4 hours

/**
 * Returns secret key bytes for HMAC-SHA256 signing
 */
function getSecretKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_SESSION_SECRET ||
    'speederspider-dubai-atelier-secure-admin-key-2026'
  );
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

/**
 * Convert string to Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Compute HMAC-SHA256 signature using Web Crypto API (Edge + Node compatible)
 */
async function computeSignature(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashStr = String.fromCharCode(...hashArray);
  return base64UrlEncode(hashStr);
}

/**
 * Timing-safe string comparison
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Create a cryptographically signed session token
 */
export async function createSessionToken(
  user: {
    userId: string;
    email: string;
    role: UserRole;
    fullName?: string;
  },
  options?: {
    maxAgeSeconds?: number;
    idleTimeoutSeconds?: number;
  }
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = options?.maxAgeSeconds ?? SESSION_MAX_AGE_SECONDS;
  const idleTimeout = options?.idleTimeoutSeconds ?? SESSION_IDLE_TIMEOUT_SECONDS;

  const payload: AdminSession = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    fullName: user.fullName || user.email.split('@')[0],
    iat: now,
    exp: now + maxAge,
    idleExp: now + idleTimeout,
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);
  const signature = await computeSignature(encodedPayload, getSecretKey());

  return `${encodedPayload}.${signature}`;
}

/**
 * Verify session token and check expiration / idle timeout
 */
export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return null;

  try {
    const expectedSignature = await computeSignature(encodedPayload, getSecretKey());
    if (!safeEqual(signature, expectedSignature)) {
      return null;
    }

    const payloadStr = base64UrlDecode(encodedPayload);
    const session: AdminSession = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);

    // Total expiration check
    if (session.exp && now > session.exp) {
      return null;
    }

    // Idle timeout check
    if (session.idleExp && now > session.idleExp) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Slide the idle timeout forward (keep session alive during user activity)
 */
export async function refreshSessionToken(session: AdminSession): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const updatedPayload: AdminSession = {
    ...session,
    idleExp: Math.min(now + SESSION_IDLE_TIMEOUT_SECONDS, session.exp),
  };

  const payloadStr = JSON.stringify(updatedPayload);
  const encodedPayload = base64UrlEncode(payloadStr);
  const signature = await computeSignature(encodedPayload, getSecretKey());

  return `${encodedPayload}.${signature}`;
}

/**
 * Extract session from NextRequest cookies or Authorization header
 */
export async function getAdminSessionFromRequest(req: NextRequest): Promise<AdminSession | null> {
  // 1. Try HTTP-only session cookie
  const cookieToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (cookieToken) {
    const session = await verifySessionToken(cookieToken);
    if (session) return session;
  }

  // 2. Try Bearer token in Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    const session = await verifySessionToken(bearerToken);
    if (session) return session;
  }

  return null;
}

/**
 * Attach session cookie to NextResponse
 */
export function setAdminSessionCookie(
  response: NextResponse,
  token: string,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS
): void {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });

  // Client-readable cookie for display purposes
  response.cookies.set({
    name: 'speederspider_auth_active',
    value: 'true',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

/**
 * Clear admin session cookie on logout
 */
export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: 'speederspider_auth_active',
    value: '',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: 'admin_role',
    value: '',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Verify admin session for Route Handlers (API protection)
 */
export async function verifyAdminRouteAccess(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<
  | { authorized: true; session: AdminSession }
  | { authorized: false; response: NextResponse }
> {
  const session = await getAdminSessionFromRequest(req);

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Valid admin session is required to access this resource.',
        },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Forbidden: This operation requires one of the following roles: [${allowedRoles.join(', ')}].`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, session };
}
