
import { pool } from './db';
import { LIMITS } from '../config/limits';
import logger from './logger';

export async function checkRateLimit(userId: string, type: 'media' | 'general'): Promise<boolean> {
  if (!userId) {
    // No rate limiting for unauthenticated users (consider IP-based limiting in future)
    return true; 
  }

  const limit = type === 'media' ? LIMITS.USER_MEDIA_SEARCH_LIMIT : LIMITS.USER_GENERAL_REQUEST_LIMIT;
  const column = type === 'media' ? 'media_search_count' : 'general_count';

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const checkRes = await pool.query(
      `SELECT ${column} FROM bible_assistant.user_daily_usage 
       WHERE user_id = $1 AND day = $2`,
      [userId, today]
    );

    const currentUsage = checkRes.rows[0]?.[column] || 0;
    
    // Check if already at or over limit BEFORE incrementing
    if (currentUsage >= limit) {
        logger.warn({ userId, type, currentUsage, limit }, 'Rate limit exceeded');
        return false;
    }

    await pool.query(
      `INSERT INTO bible_assistant.user_daily_usage (user_id, day, ${column})
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, day)
       DO UPDATE SET ${column} = bible_assistant.user_daily_usage.${column} + 1`,
      [userId, today]
    );

    return true;
  } catch (error) {
    logger.error({ err: error, userId, type }, 'Rate limit check failed');
    // SECURITY: Fail closed - deny access on DB errors
    // This prevents abuse if database is down, but may block legitimate users
    // Consider monitoring and alerting on this error
    return false; 
  }
}
