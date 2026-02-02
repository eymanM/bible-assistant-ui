import { NextRequest } from 'next/server';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import logger from './logger';

/**
 * Cognito JWT Verifier instance
 * Caches public keys for performance
 */
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID || '',
  tokenUse: 'id',
  clientId: process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID || '',
});

export interface DecodedToken {
  sub: string; // User ID (Cognito sub)
  email?: string;
  email_verified?: boolean;
  'cognito:username'?: string;
  exp: number;
  iat: number;
}

/**
 * Verify a Cognito JWT token
 * @param token - JWT token string
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<DecodedToken> {
  try {
    const payload = await verifier.verify(token);
    return payload as DecodedToken;
  } catch (error) {
    logger.warn({ err: error }, 'Token verification failed');
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract and verify JWT token from request Authorization header
 * @param req - Next.js request object
 * @returns Decoded token payload
 * @throws Error if token is missing or invalid
 */
export async function getVerifiedToken(req: NextRequest): Promise<DecodedToken> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.replace(/^Bearer\s+/i, '');
  
  if (!token) {
    throw new Error('Invalid authorization header format');
  }

  return verifyToken(token);
}

/**
 * Get verified user ID from request
 * This should be used instead of accepting userId from query params or body
 * 
 * @param req - Next.js request object
 * @returns User ID (Cognito sub) from verified JWT token
 * @throws Error if token is invalid or missing
 */
export async function getUserIdFromRequest(req: NextRequest): Promise<string> {
  // First check if middleware already verified and attached userId
  const verifiedUserId = req.headers.get('x-user-id');
  
  if (verifiedUserId) {
    return verifiedUserId;
  }

  // Fallback: verify token directly
  const token = await getVerifiedToken(req);
  return token.sub;
}

/**
 * Optional: Get user ID if authenticated, return null if not
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
export async function getOptionalUserId(req: NextRequest): Promise<string | null> {
  try {
    return await getUserIdFromRequest(req);
  } catch {
    return null;
  }
}
