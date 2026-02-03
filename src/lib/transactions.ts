
import { pool } from './db';

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  credits: number;
  stripe_session_id?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  created_at: Date;
}

export async function createTransaction(
  userId: number,
  amount: number,
  currency: string,
  credits: number,
  stripeSessionId?: string,
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' = 'succeeded'
): Promise<Transaction> {
  const res = await pool.query(
    `INSERT INTO bible_assistant.transactions (user_id, amount, currency, credits, stripe_session_id, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (stripe_session_id) 
     DO UPDATE SET 
       status = EXCLUDED.status,
       amount = EXCLUDED.amount,
       credits = EXCLUDED.credits
     RETURNING *`,
    [userId, amount, currency, credits, stripeSessionId, status]
  );
  return res.rows[0];
}

export async function updateTransactionStatus(
  stripeSessionId: string, 
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
): Promise<Transaction | null> {
  const res = await pool.query(
     `UPDATE bible_assistant.transactions
      SET status = $2
      WHERE stripe_session_id = $1
      RETURNING *`,
      [stripeSessionId, status]
  );
  return res.rows[0] || null;
}

export async function getUserTransactions(userId: number): Promise<Transaction[]> {
  const res = await pool.query(
    `SELECT * FROM bible_assistant.transactions 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
  return res.rows;
}
