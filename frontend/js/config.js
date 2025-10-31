// API Configuration
// Architecture: Netlify (Frontend) + Railway (Backend) + Supabase (Database)

function getApiUrl() {
  const hostname = window.location.hostname;

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  // Production - Railway backend
  return "https://dongfeng-minitraktor-production.up.railway.app";
}

const API_URL = getApiUrl();

// Export for use in other scripts
window.API_URL = API_URL;

console.log("🚀 Netlify + Railway");
console.log("🌐 API URL:", API_URL);
console.log("📍 Platform:", window.location.hostname);
