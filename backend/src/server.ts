import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import branchesRouter from './routes/branches';
import slotsRouter    from './routes/slots';
import bookingsRouter from './routes/bookings';
import { errorHandler } from './middleware/errorHandler';
import { initializeDatabase } from './db/database';

const app = express();

// ── Security headers
app.use(helmet());

// ── HTTP request logging 
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── CORS 
const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));

// ── Body parsing (16 kb limit to restrict oversized payloads)
app.use(express.json({ limit: '16kb' }));

// ── Routes
app.use('/api/branches', branchesRouter);
app.use('/api/slots',    slotsRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 fallback for unmatched /api/* routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// ── Global error handler
app.use(errorHandler);

// ── Start server (only after DB schema + seed are ready)
const PORT = Number(process.env.PORT ?? 3001);

async function start(): Promise<void> {
  await initializeDatabase();

  const server = app.listen(PORT, () => {
    const env = process.env.NODE_ENV ?? 'development';
    console.log(`\n Bookpulse backend [${env}] → http://localhost:${PORT}\n`);
  });

  // ── Graceful shutdown
  function shutdown(signal: string): void {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

