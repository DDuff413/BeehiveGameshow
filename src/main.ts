import "./app.css";

import App from "./App.svelte";
import { mount } from "svelte";

// Validate required environment variables
function validateEnvironment() {
  const requiredEnvVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `
      Missing required environment variables: ${missing.join(", ")}
      
      Please create a .env file with:
      VITE_SUPABASE_URL=your_supabase_url
      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    `;

    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #fee;
        padding: 20px;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 8px;
          border: 2px solid #c33;
          max-width: 600px;
        ">
          <h1 style="color: #c33; margin: 0 0 20px 0;">⚠️ Configuration Error</h1>
          <pre style="
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 14px;
          ">${errorMessage}</pre>
        </div>
      </div>
    `;

    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

// Validate environment before mounting app
validateEnvironment();

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
