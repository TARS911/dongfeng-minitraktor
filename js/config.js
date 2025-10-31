// API Configuration
// Architecture: Vercel Full-Stack (Frontend + Backend Serverless + Supabase)

function getApiUrl() {
  const hostname = window.location.hostname;

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  // Production - Vercel serverless (same domain)
  return window.location.origin;
}

const API_URL = getApiUrl();

// Export for use in other scripts
window.API_URL = API_URL;

console.log("🚀 Vercel Full-Stack");
console.log("🌐 API URL:", API_URL);
console.log("📍 Platform:", window.location.hostname);
