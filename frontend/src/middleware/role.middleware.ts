import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './auth.middleware';

type Role = 'admin' | 'user' | 'owner';

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as JwtPayload | undefined;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}
