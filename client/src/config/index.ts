/**
 * Configuration file for API and Socket URLs
 * This file handles different URLs for development and production environments
 */

/**
 * Gets the appropriate IP address or domain based on environment
 * @returns {string} IP address for development or domain for production
 */
const getLocalIP = () => {
  if (__DEV__) {
    return  "" // Update this to your actual IP for local development
  }
  return 'your-production-domain.com'; // Production domain
};

// Construct the full development API URL using local IP and port 5000
const DEV_API_URL = `http://${getLocalIP()}:5000`;

// Production API URL - replace with actual production URL
const PROD_API_URL = 'https://your-production-url.com';

// Export the appropriate API URL based on environment
export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Socket URL mirrors the API URL for both environments
export const SOCKET_URL = API_URL; 