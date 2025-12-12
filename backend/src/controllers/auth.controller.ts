import { Request, Response } from 'express';
import pool from '../config/db.config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserInput, UserPayload } from '../types/auth.types';
import { RowDataPacket } from 'mysql2';

// Pastikan secret key ada
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
if (JWT_SECRET === 'fallback_secret') {
    console.warn('⚠️ Peringatan: JWT_SECRET belum diatur di .env!');
}

/**
 * Endpoint Registrasi Pengguna
 */
export const register = async (req: Request<{}, {}, UserInput>, res: Response) => {
    const { username, email, password } = req.body;

    // Validasi input sederhana
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Semua field (username, email, password) harus diisi.' });
    }

    try {
        // 1. Cek apakah email atau username sudah terdaftar
        const [existingUser] = await pool.query<RowDataPacket[]>(
            'SELECT id_user FROM user WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Email atau Username sudah terdaftar.' });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Simpan pengguna baru
        const [result] = await pool.execute(
            'INSERT INTO user (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        // Asumsi tipe hasil dari execute adalah OkPacket
        const insertId = (result as any).insertId; 
        
        // 4. Buat Payload dan Token JWT
        const payload: UserPayload = { id_user: insertId, username, email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        return res.status(201).json({
            message: 'Registrasi berhasil. Akun dibuat.',
            token,
            user: payload
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
        // 1. Cari pengguna berdasarkan email
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id_user, username, email, password FROM user WHERE email = ?',
            [email]
        );
        
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Email atau Password salah.' });
        }

        // 2. Bandingkan Password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau Password salah.' });
        }
        
        // 3. Buat Payload dan Token JWT
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