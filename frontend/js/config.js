// API Configuration
// Architecture: Vercel (Frontend) + Railway (Backend)

function getApiUrl() {
  const hostname = window.location.hostname;

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  // Vercel deployment - используем Railway backend
  if (hostname.includes("vercel.app")) {
    return "https://dongfeng-minitraktor-production.up.railway.app";
  }

  // Railway deployment (full-stack)
  if (hostname.includes("railway.app")) {
    return "https://dongfeng-minitraktor-production.up.railway.app";
  }

  // Custom domain - используем Railway backend
  return "https://dongfeng-minitraktor-production.up.railway.app";
}

const API_URL = getApiUrl();

// Export for use in other scripts
window.API_URL = API_URL;

console.log("🌐 API URL:", API_URL);
console.log("📍 Platform:", window.location.hostname);
