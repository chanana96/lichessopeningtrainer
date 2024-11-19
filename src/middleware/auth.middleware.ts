import type { Request, Response } from 'express';

export const authMiddleware = (req: Request, res: Response, next: () => void) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
