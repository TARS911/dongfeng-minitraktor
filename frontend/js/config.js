// API Configuration
// For Vercel deployment: API hosted on Render
// For local development: API on localhost

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://dongfeng-minitraktor.onrender.com';

// Export for use in other scripts
window.API_URL = API_URL;
