import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "680b77d804a08e74a67d137e", 
  requiresAuth: true // Ensure authentication is required for all operations
});
