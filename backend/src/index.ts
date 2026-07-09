import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import importRouter from './routes/import';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Handle Private Network Access (PNA) for modern browsers like Chrome
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GrowEasy CSV Importer API',
  });
});

// Routes
app.use('/api/import', importRouter);

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.',
    });
  }
);

// Start server only if not running in a serverless environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════╗
    ║   GrowEasy CSV Importer API                  ║
    ║   Running on http://localhost:${PORT}           ║
    ║   Health: http://localhost:${PORT}/api/health   ║
    ╚══════════════════════════════════════════════╝
    `);

    // Check for API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('⚠️  WARNING: GEMINI_API_KEY is not configured.');
      console.warn('   Set it in backend/.env to enable AI extraction.');
      console.warn('   Get a free key at: https://aistudio.google.com/apikey');
    }
  });
}

export default app;
