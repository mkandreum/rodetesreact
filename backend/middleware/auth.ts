import { Request, Response, NextFunction } from 'express';

// Extend Session data interface module augmentation
declare module 'express-session' {
    interface SessionData {
        isLoggedIn: boolean;
        isAdmin: boolean;
        username: string;
    }
}

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.isLoggedIn) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    next();
};

// Admin check
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.isLoggedIn || !req.session.isAdmin) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
};
