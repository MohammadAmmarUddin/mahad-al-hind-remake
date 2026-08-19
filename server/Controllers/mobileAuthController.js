const mobileSignInPage = (req, res) => {
  const redirectScheme = req.query.scheme || "mahadalhind";

  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sign in with Google</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 40px 20px;
      max-width: 400px;
      width: 100%;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
    }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 8px; }
    p { font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 32px; }
    .loading { text-align: center; }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-msg { color: #ff6b6b; font-size: 14px; display: none; margin-top: 16px; }
    .btn-retry {
      margin-top: 16px; padding: 12px 32px;
      background: #4285f4; color: #fff; border: none;
      border-radius: 8px; font-size: 16px; cursor: pointer;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">&#128218;</div>
    <h1>Ma'hadul Qiraat Al Hind</h1>
    <p>Sign in to continue to the app</p>
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p id="status-text">Redirecting to Google...</p>
    </div>
    <div class="error-msg" id="error-msg"></div>
    <button class="btn-retry" id="btn-retry" onclick="startGoogleSignIn()">Try Again</button>
  </div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import {
      getAuth,
      signInWithRedirect,
      getRedirectResult,
      GoogleAuthProvider
    } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

    const SCHEME = "${redirectScheme}";

    const firebaseConfig = {
      apiKey: "AIzaSyCmJrwXFhwncpRSrHwYxxZv_Vy3TYwGCw4",
      authDomain: "context-auth-e9060.firebaseapp.com",
      projectId: "context-auth-e9060",
      storageBucket: "context-auth-e9060.firebasestorage.app",
      messagingSenderId: "860734875001",
      appId: "1:860734875001:web:ec5391a74f5dd0c9d27ba8"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    function showLoading(text) {
      document.getElementById("loading").style.display = "block";
      document.getElementById("status-text").textContent = text || "Redirecting to Google...";
      document.getElementById("error-msg").style.display = "none";
      document.getElementById("btn-retry").style.display = "none";
    }

    function showError(msg) {
      document.getElementById("loading").style.display = "none";
      document.getElementById("error-msg").textContent = msg;
      document.getElementById("error-msg").style.display = "block";
      document.getElementById("btn-retry").style.display = "inline-block";
    }

    async function exchangeToken(firebaseUser) {
      showLoading("Signing you in...");
      const idToken = await firebaseUser.getIdToken();

      const res = await fetch("/api/user/googleLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: idToken, provider: "firebase" })
      });

      const data = await res.json();

      if (data.error) {
        showError(data.error);
        return;
      }

      const token = data.token;
      const userId = data.user._id;

      showLoading("Redirecting to app...");

      window.location.href = SCHEME + "://google-auth?token=" + encodeURIComponent(token) + "&userId=" + encodeURIComponent(userId);
    }

    async function handleRedirect() {
      try {
        const result = await getRedirectResult(auth);

        if (result && result.user) {
          await exchangeToken(result.user);
          return;
        }

        startGoogleSignIn();
      } catch (err) {
        console.error("Redirect result error:", err);

        if (err.code === "auth/popup-blocked" ||
            err.code === "auth/cancelled-popup-request" ||
            err.code === "auth/operation-not-allowed") {
          startGoogleSignIn();
        } else if (err.code === "auth/network-request-failed") {
          showError("Network error. Please check your connection and try again.");
        } else {
          showError("Sign-in failed. Please try again. (" + (err.code || err.message) + ")");
        }
      }
    }

    window.startGoogleSignIn = function() {
      showLoading("Redirecting to Google...");
      signInWithRedirect(auth, provider);
    };

    handleRedirect();
  </script>
</body>
</html>`);
};

module.exports = { mobileSignInPage };
