
import { pool } from './db';

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  credits: number;
  stripe_session_id?: string;
  created_at: Date;
}

export async function createTransaction(
  userId: number,
  amount: number,
  currency: string,
  credits: number,
  stripeSessionId?: string
): Promise<Transaction> {
  const res = await pool.query(
    `INSERT INTO bible_assistant.transactions (user_id, amount, currency, credits, stripe_session_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, amount, currency, credits, stripeSessionId]
  );
  return res.rows[0];
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
