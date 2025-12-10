/**
 * Utility to get the API URL dynamically based on the current host
 * This allows the app to work from both localhost and network IP
 */

/**
 * Gets the API base URL dynamically.
 * - If accessed from localhost, uses localhost:8000
 * - If accessed from a network IP, uses that same IP:8000
 * - Falls back to environment variable if set
 */
export function getApiBaseUrl(): string {
  // Check if we have an explicit environment variable that's not localhost
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Get current hostname from browser
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  // If accessing from localhost, use localhost
  // If accessing from an IP or other host, use that same host for API
  const apiHost = currentHost === 'localhost' || currentHost === '127.0.0.1' 
    ? 'localhost' 
    : currentHost;
  
  // Build the API URL using the detected host
  const apiUrl = `http://${apiHost}:8000/api/v1`;
  
  return apiUrl;
}

/**
 * Gets the API root URL (without /api/v1) for file URLs
 */
export function getApiRootUrl(): string {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const apiHost = currentHost === 'localhost' || currentHost === '127.0.0.1' 
    ? 'localhost' 
    : currentHost;
  
  return `http://${apiHost}:8000`;
}

// Export singleton instance for convenience
export const API_BASE_URL = getApiBaseUrl();
export const API_ROOT_URL = getApiRootUrl();
