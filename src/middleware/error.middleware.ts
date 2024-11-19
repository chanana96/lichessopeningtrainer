import type { Request, Response } from 'express';

interface Error {
    message: string;
    status?: number;
}

export const errorMiddleware = (error: Error, req: Request, res: Response, next: () => void) => {
    console.error('Error:', error.message);
    res.status(error.status || 500).json({
        message: error.message || 'Internal server error',
    });
};
