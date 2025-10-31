// API Configuration
// Auto-detect deployment platform

function getApiUrl() {
  const hostname = window.location.hostname;

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  // Vercel deployment
  if (hostname.includes("vercel.app")) {
    return window.location.origin; // Same domain as frontend
  }

  // Railway deployment
  if (hostname.includes("railway.app")) {
    return "https://dongfeng-minitraktor-production.up.railway.app";
  }

  // Custom domain or other - use same origin
  return window.location.origin;
}

const API_URL = getApiUrl();

// Export for use in other scripts
window.API_URL = API_URL;

console.log("🌐 API URL:", API_URL);
