
import { pool } from './db';
import { LIMITS } from '../config/limits';

export async function checkRateLimit(userId: string, type: 'media' | 'general'): Promise<boolean> {
  if (!userId) {
    // If no user ID, decide policy. For now allowing, or maybe we should block?
    // User requested "limitter dla użytkownika", implying per-user.
    // If unauthenticated, maybe a stricter global limit based on IP?
    // But for now, let's assume valid userId for tracking.
    // If we want to support unauth, we'd need another mechanism.
    return true; 
  }

  const limit = type === 'media' ? LIMITS.USER_MEDIA_SEARCH_LIMIT : LIMITS.USER_GENERAL_REQUEST_LIMIT;
  const column = type === 'media' ? 'media_search_count' : 'general_count';

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Upsert and increment
    const res = await pool.query(
      `INSERT INTO user_daily_usage (user_id, day, ${column})
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, day)
       DO UPDATE SET ${column} = user_daily_usage.${column} + 1, updated_at = NOW()
       RETURNING ${column}`,
      [userId, today]
    );

    const currentUsage = res.rows[0][column];
    
    if (currentUsage > limit) {
        console.warn(`Rate limit exceeded for user ${userId} on ${type}. Usage: ${currentUsage}, Limit: ${limit}`);
        return false;
    }

    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open or closed? detailed error logging is crucial.
    // Let's fail open to avoid blocking users on DB errors, but log heavily.
    return true; 
  }
}
