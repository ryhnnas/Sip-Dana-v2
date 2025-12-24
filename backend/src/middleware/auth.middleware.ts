import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserPayload } from '../types/auth.types'; 

export interface AuthRequest<P = {}, ResB = any, ReqB = any> extends Request<P, ResB, ReqB> {
    user?: UserPayload; 
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    // 1. Cek token di header (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifikasi token
            // Di dalam middleware protect / auth
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            req.user = { 
                id_user: decoded.id_user,
                username: decoded.username || '',
                email: decoded.email || '' 
            };

            // Lanjutkan ke controller transaksi
            next();
        } catch (error) {
            console.error('Error saat verifikasi token:', error);
            return res.status(401).json({ message: 'Token tidak valid, otorisasi ditolak.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak.' });
    }
};