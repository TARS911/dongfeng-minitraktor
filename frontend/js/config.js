// API Configuration
// For Railway deployment
// For local development: API on localhost

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://dongfeng-minitraktor-production.up.railway.app";

// Export for use in other scripts
window.API_URL = API_URL;
