import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import branchesRouter from './routes/branches';
import slotsRouter    from './routes/slots';
import bookingsRouter from './routes/bookings';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'test' ? 'silent' : process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '16kb' }));

app.use('/api/branches', branchesRouter);
app.use('/api/slots',    slotsRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use(errorHandler);

export default app;
