import { User } from './users';

/**
 * Remove sensitive fields from user object before sending to client
 */
export function sanitizeUser(user: User): Omit<User, 'cognito_sub'> {
  const { cognito_sub, ...sanitized } = user;
  return sanitized;
}
