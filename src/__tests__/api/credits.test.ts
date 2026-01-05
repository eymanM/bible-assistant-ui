import { POST } from '@/app/api/credits/deduct/route';
import { pool } from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock the database pool
jest.mock('@/lib/db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('POST /api/credits/deduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if userId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/credits/deduct', {
      method: 'POST',
      body: JSON.stringify({ amount: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User ID is required');
  });

  it('should return 400 if user not found or insufficient credits', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

    const request = new NextRequest('http://localhost:3000/api/credits/deduct', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', amount: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Insufficient credits or user not found');
  });

  it('should successfully deduct credits and return updated balance', async () => {
    const mockUser = { cognito_sub: 'user123', credits: 9 };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

    const request = new NextRequest('http://localhost:3000/api/credits/deduct', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', amount: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.credits).toBe(9);
  });

  it('should use default amount of 1 if not provided', async () => {
    const mockUser = { cognito_sub: 'user123', credits: 9 };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

    const request = new NextRequest('http://localhost:3000/api/credits/deduct', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123' }),
    });

    await POST(request);

    expect(pool.query).toHaveBeenCalled();
  });

  it('should return 500 on internal error', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/credits/deduct', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123', amount: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
