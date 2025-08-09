import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
// Increase payload limits for image uploads (Base64 encoding increases size by ~33%)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('❌ Express Error Handler:', message);
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Stack:', err.stack);

    // Immer JSON-Response, nie HTML-Fehlerseite
    res.status(status).json({ 
      error: message,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });

  // VERCEL FIX: Use static files in production, setupVite in development
  console.log('🔧 Environment check - app.get("env"):', app.get("env"));
  console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
    console.log('✅ Using serveStatic for production (Vercel)');
  } else {
    await setupVite(app, server);
    console.log('✅ Using setupVite for development');
  }

  // VERCEL: Use dynamic port for Vercel, fallback to 5000 for local
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
