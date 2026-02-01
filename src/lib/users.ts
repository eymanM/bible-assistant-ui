import { pool } from './db';

export interface User {
  id: number;
  cognito_sub: string;
  email: string | null;
  credits: number;
  created_at: Date;
  settings: any;
}

export async function getUserByCognitoSub(cognitoSub: string): Promise<User | null> {
  const res = await pool.query(
    'SELECT * FROM bible_assistant.users WHERE cognito_sub = $1',
    [cognitoSub]
  );
  return res.rows[0] || null;
}

export async function createUser(cognitoSub: string, email: string): Promise<User> {
  const res = await pool.query(
    `INSERT INTO bible_assistant.users (cognito_sub, email, credits)
     VALUES ($1, $2, 5)
     RETURNING *`,
    [cognitoSub, email]
  );
  return res.rows[0];
}

export async function addCredits(cognitoSub: string, amount: number): Promise<User> {
  const res = await pool.query(
    `UPDATE bible_assistant.users
     SET credits = credits + $2, updated_at = CURRENT_TIMESTAMP
     WHERE cognito_sub = $1
     RETURNING *`,
    [cognitoSub, amount]
  );
  return res.rows[0];
}

export async function deductCredits(cognitoSub: string, amount: number): Promise<User | null> {
  const res = await pool.query(
    `UPDATE bible_assistant.users
     SET credits = credits - $2, updated_at = CURRENT_TIMESTAMP
     WHERE cognito_sub = $1 AND credits >= $2
     RETURNING *`,
    [cognitoSub, amount]
  );
  return res.rows[0] || null;
}

export async function updateUserSettings(cognitoSub: string, settings: any): Promise<User> {
  const res = await pool.query(
    `UPDATE bible_assistant.users
     SET settings = $2, updated_at = CURRENT_TIMESTAMP
     WHERE cognito_sub = $1
     RETURNING *`,
    [cognitoSub, settings]
  );
  return res.rows[0];
}

export async function getOrCreateUser(cognitoSub: string, email: string): Promise<User> {
  let user = await getUserByCognitoSub(cognitoSub);
  if (!user) {
    user = await createUser(cognitoSub, email);
  }
  return user;
}
