import type { Request, Response } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: () => void) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};
