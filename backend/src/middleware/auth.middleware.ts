import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserPayload } from '../types/auth.types'; 

// Perluas tipe Request dari Express untuk menyimpan data pengguna yang terautentikasi
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
            const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

            // 3. Simpan data pengguna ke objek request
            // Data pengguna yang disimpan adalah payload JWT (id_user, username, email)
            req.user = decoded; 

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