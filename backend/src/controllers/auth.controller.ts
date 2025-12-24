import { Request, Response } from 'express';
import pool from '../config/db.config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserInput, UserPayload } from '../types/auth.types';
import { RowDataPacket } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
if (JWT_SECRET === 'fallback_secret') {
    console.warn('⚠️ Peringatan: JWT_SECRET belum diatur di .env!');
}

/**
 * Endpoint Registrasi Pengguna
 */
export const register = async (req: Request<{}, {}, UserInput>, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Semua field (username, email, password) harus diisi.' });
    }

    // Validasi domain email harus @gmail.com
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ 
            message: 'Registrasi gagal. Email harus menggunakan domain @gmail.com.' 
        });
    }

    const hasLength = password.length >= 8;
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLength || !hasCapital || !hasNumber) {
        return res.status(400).json({ 
            message: 'Password tidak memenuhi syarat keamanan.',
            errors: {
                length: !hasLength ? 'Minimal 8 karakter.' : null,
                capital: !hasCapital ? 'Harus mengandung huruf kapital.' : null,
                number: !hasNumber ? 'Harus mengandung angka.' : null
            }
        });
    }

    try {
        const [existingUser] = await pool.query<RowDataPacket[]>(
            'SELECT id_user FROM user WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Email atau Username sudah terdaftar.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.execute(
            'INSERT INTO user (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        return res.status(201).json({
            message: 'Registrasi berhasil. Akun telah dibuat, silakan login untuk melanjutkan.',
        });

    } catch (error) {
        console.error('Error saat registrasi:', error);
        return res.status(500).json({ message: 'Server Error', error });
    }
};

/**
 * Endpoint Login Pengguna
 */
export const login = async (req: Request<{}, {}, Pick<UserInput, 'email' | 'password'>>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password harus diisi.' });
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id_user, username, email, password FROM user WHERE email = ?',
            [email]
        );
        
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Email atau Password salah.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau Password salah.' });
        }
        
        const payload: UserPayload = { id_user: user.id_user, username: user.username, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            message: 'Login berhasil.',
            token,
            user: payload
        });

    } catch (error) {
        console.error('Error saat login:', error);
        return res.status(500).json({ message: 'Server Error', error });
    }
};