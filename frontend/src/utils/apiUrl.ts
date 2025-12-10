/**
 * Utility to get the API URL dynamically based on the current host
 * This allows the app to work from both localhost and production
 */

/**
 * Gets the API base URL dynamically.
 * - In production: uses relative URL /api/v1 (goes through Nginx proxy)
 * - In development (localhost): uses localhost:8000
 */
export function getApiBaseUrl(): string {
  // Check if we have an explicit environment variable
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Get current hostname from browser
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  // In production (not localhost), use relative URL through Nginx proxy
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return '/api/v1';
  }
  
  // In development, use localhost:8000
  return 'http://localhost:8000/api/v1';
}

/**
 * Gets the API root URL (without /api/v1) for file URLs
 */
export function getApiRootUrl(): string {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  // In production, use relative URL (empty string, files served from same origin)
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return '';
  }
  
  return 'http://localhost:8000';
}

// Export singleton instance for convenience
export const API_BASE_URL = getApiBaseUrl();
export const API_ROOT_URL = getApiRootUrl();
