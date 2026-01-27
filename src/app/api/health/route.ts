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

interface HealthChecks {
  database: 'healthy' | 'unhealthy' | 'unknown';
  backend: string;
  stripe: string;
  cognito: string;
  system: 'healthy' | 'unhealthy' | 'unknown' | 'error';
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical_failure' | 'starting';
  timestamp: string;
  checks: HealthChecks;
  error?: string;
}

export async function GET() {
  const status: HealthStatus = {
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
      
      if (backendRes.ok) {
        status.checks.backend = 'healthy';
      } else {
        status.checks.backend = `unhealthy (status: ${backendRes.status})`;
      }
    } catch (apiError) {
      // In development, backend failures may be expected
      if (process.env.NODE_ENV !== 'development') {
        console.error('Backend health check failed:', apiError);
      }
      status.checks.backend = 'unhealthy';
    }

    // 3. Check Stripe
    if (stripe) {
      try {
        await stripe.balance.retrieve();
        status.checks.stripe = 'healthy';
      } catch (stripeErr) {
        console.error('Stripe health check failed:', stripeErr);
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
      // Lightweight check to ensure process can access system info
      void os.freemem();
      void os.totalmem();
      void os.uptime();
      status.checks.system = 'healthy';
    } catch (systemError) {
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
