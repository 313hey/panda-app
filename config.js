// ========== Panda App Config (client-side) ==========
// IMPORTANT: GitHub Pages is a static site. Any "password" stored here can be discovered by someone who inspects the code.
// If you need real access control, use a backend (e.g., Firebase/Supabase) or put the admin behind Cloudflare Access/Netlify auth.

// Change these BEFORE you upload, if you want:
window.PANDA_APP_CONFIG = {
  APP_NAME: "Panda Mission | 熊猫任务",
  // Admin login (basic protection; not truly secure on a static site)
  ADMIN_USERNAME: "admin",
  // SHA-256 hash of the admin password (default password: ChangeMe-2025!)
  // You can compute SHA-256 in the browser console by running:
  //   await window.PandaApp.sha256("your-new-password")
  ADMIN_PASSWORD_SHA256: "d2ab478576c4b1e31406ae721828f77b5226923f85da1daae1e81da3363c18ad",
};