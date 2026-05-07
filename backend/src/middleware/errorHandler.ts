import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  console.error('Unhandled error:', err.stack ?? err.message);
  res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
}
