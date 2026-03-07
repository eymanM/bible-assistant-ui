import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-middleware';
import { getUserByCognitoSub } from '@/lib/users';
import logger from '@/lib/logger';

// Helper function to check if a user is an admin
export async function isAdmin(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req); // This is the cognito_sub
    const user = await getUserByCognitoSub(userId);
    
    if (!user || !user.email) return false;
    
    const adminEmailsRaw = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsRaw.split(',').map(e => e.trim().toLowerCase());
    
    return adminEmails.includes(user.email.toLowerCase());
  } catch (e) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const isUserAdmin = await isAdmin(req);
    
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Total Users
    const usersResult = await pool.query('SELECT COUNT(*) FROM bible_assistant.users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // 2. Total Searches (AI vs Normal)
    const searchesResult = await pool.query(`
       SELECT 
         COUNT(*) as total_searches,
         COUNT(response) as ai_searches
       FROM bible_assistant.searches
    `);
    const totalSearches = parseInt(searchesResult.rows[0].total_searches);
    const aiSearches = parseInt(searchesResult.rows[0].ai_searches);

    // 3. Total Revenue
    const revenueResult = await pool.query(`
       SELECT COALESCE(SUM(amount), 0) as total_revenue
       FROM bible_assistant.transactions
       WHERE status = 'succeeded' AND currency = 'usd'
    `);
    const totalRevenueUSD = parseFloat(revenueResult.rows[0].total_revenue) / 100; // Assuming Stripe cents

    // Rough estimated cost per AI search to display margin
    // Assuming $0.005 per combined prompt + completion using current fast LLMs
    const estimatedCostPerAISearch = 0.005;
    const estimatedTotalCost = aiSearches * estimatedCostPerAISearch;

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        totalSearches,
        aiSearches,
        totalRevenueUSD,
        estimatedTotalCost
      }
    });

  } catch (error: any) {
    logger.error({ err: error }, 'Error fetching admin metrics');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
