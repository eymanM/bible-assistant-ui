import { NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import { API_DOMAIN } from '../../../config/apiConfig';
import Stripe from 'stripe';
import os from 'os';

// Initialize Stripe if key is present
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' as any }) // using any to bypass strict type checking if version mismatch
  : null;

export const dynamic = 'force-dynamic'; // Ensure this route is not statically cached

export async function GET() {
  const status: any = {
    status: 'starting',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      backend: 'unknown',
      stripe: 'unknown',
      cognito: 'unknown',
      system: 'unknown',
    }
  };

  try {
    // 1. Check database connection
    try {
      await pool.query('SELECT 1');
      status.checks.database = 'healthy';
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      status.checks.database = 'unhealthy';
    }

    // 2. Check Backend API connection
    try {
      const backendRes = await fetch(`${API_DOMAIN}/`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      
      if (backendRes.ok || backendRes.status === 404) {
        status.checks.backend = 'healthy';
      } else {
        status.checks.backend = `unhealthy (status: ${backendRes.status})`;
      }
    } catch (apiError) {
      // console.error('Backend health check failed:', apiError); 
      // Keep silent logs for expected failures in dev if backend is down
      status.checks.backend = 'unhealthy';
    }

    // 3. Check Stripe
    if (stripe) {
      try {
        if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
           status.checks.stripe = 'healthy (configured)';
        } else {
           status.checks.stripe = 'unhealthy (invalid key format)';
        }
      } catch (stripeErr) {
        status.checks.stripe = 'unhealthy';
      }
    } else {
      status.checks.stripe = 'disabled';
    }

    // 4. Check AWS Cognito
    const userPoolId = process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID;
    const region = process.env.NEXT_PUBLIC_AWS_REGION;
    if (userPoolId && region) {
      try {
        const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
        const cognitoRes = await fetch(jwksUrl, { signal: AbortSignal.timeout(3000) });
        if (cognitoRes.ok) {
          status.checks.cognito = 'healthy';
        } else {
          status.checks.cognito = `unhealthy (status: ${cognitoRes.status})`;
        }
      } catch (cognitoErr) {
        status.checks.cognito = 'unhealthy';
      }
    } else {
      status.checks.cognito = 'disabled';
    }

    // 5. System Resources
    try {
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      const memUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
      
      status.checks.system = {
        memoryUsage: `${memUsage}%`,
        freeMemory: `${Math.round(freeMem / 1024 / 1024)}MB`,
        uptime: `${Math.round(os.uptime())}s`
      };
    } catch (sysErr) {
      status.checks.system = 'error';
    }

    // Determine overall status
    // We only fail 503 if DATABASE is down. Others might be partial failures.
    const isCriticalHealthy = status.checks.database === 'healthy';
    status.status = isCriticalHealthy ? 'healthy' : 'degraded';

    return new NextResponse(JSON.stringify(status, null, 2), {
      status: isCriticalHealthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store', 
      },
    });

  } catch (error) {
    console.error('Health check critical error:', error);
    return new NextResponse(JSON.stringify({ ...status, status: 'critical_failure', error: String(error) }), {
      status: 503,
      headers: {
         'Content-Type': 'application/json',
         'Cache-Control': 'no-store',
      }
    });
  }
}
