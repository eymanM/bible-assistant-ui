import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Get authenticated headers with JWT token for API requests
 * @returns Headers object with Authorization bearer token
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw new Error('Authentication required');
  }
}

/**
 * Get authenticated headers, returns empty object if not authenticated
 * Use for optional authentication endpoints
 */
export async function getOptionalAuthHeaders(): Promise<HeadersInit> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Content-Type': 'application/json'
    };
  } catch (error) {
    // Silent fail for optional auth
    return {
      'Content-Type': 'application/json'
    };
  }
}
