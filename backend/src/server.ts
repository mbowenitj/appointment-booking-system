import 'dotenv/config';
import app from './app';
import { initializeDatabase } from './db/database';

const PORT = Number(process.env.PORT ?? 3001);

async function start(): Promise<void> {
  await initializeDatabase();

  const server = app.listen(PORT, () => {
    const env = process.env.NODE_ENV ?? 'development';
    console.log(`\n BookEasy backend [${env}] → http://localhost:${PORT}\n`);
  });

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

