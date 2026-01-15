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
    console.log('🔐 Admin check:', {
        hasSession: !!req.session,
        sessionID: req.sessionID,
        isAdmin: (req.session as any)?.isAdmin,
        cookies: req.headers.cookie
    });

    if (!(req.session as any)?.isAdmin) {
        console.log('❌ Admin check failed - not admin');
        res.status(403).json({ error: 'Admin access required' });
        return;
    }

    console.log('✅ Admin check passed');
    next();
};
