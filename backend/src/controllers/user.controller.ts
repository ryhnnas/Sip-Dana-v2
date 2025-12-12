import { Response } from 'express';
import pool from '../config/db.config';
import { AuthRequest } from '../middleware/auth.middleware';
import { RowDataPacket, OkPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

// Tipe data input untuk update profil
interface ProfileUpdateInput {
    username?: string;
    email?: string;
}

// Tipe data input untuk update password
interface PasswordUpdateInput {
    currentPassword: string;
    newPassword: string;
}

/**
 * [UPDATE] Memperbarui Nama dan Email Pengguna
 * Endpoint: PUT /api/users/profile
 */
export const updateProfile = async (req: AuthRequest<{}, {}, ProfileUpdateInput>, res: Response) => {
    const userId = req.user?.id_user;
    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });

    const { username, email } = req.body;

    if (!username && !email) {
        return res.status(400).json({ message: 'Minimal satu field (username atau email) harus diisi.' });
    }
    
    // Construct query dynamically
    let updates = [];
    let values = [];

    if (username) {
        // Cek duplikasi username (kecuali milik sendiri)
        const [existingUser] = await pool.query<RowDataPacket[]>(
            'SELECT id_user FROM user WHERE username = ? AND id_user != ?',
            [username, userId]
        );
        if (existingUser.length > 0) return res.status(409).json({ message: 'Username sudah digunakan.' });
        
        updates.push('username = ?');
        values.push(username);
    }
    
    if (email) {
        // Cek duplikasi email (kecuali milik sendiri)
        const [existingEmail] = await pool.query<RowDataPacket[]>(
            'SELECT id_user FROM user WHERE email = ? AND id_user != ?',
            [email, userId]
        );
        if (existingEmail.length > 0) return res.status(409).json({ message: 'Email sudah digunakan.' });
        
        updates.push('email = ?');
        values.push(email);
    }
    
    const query = `UPDATE user SET ${updates.join(', ')} WHERE id_user = ?`;
    values.push(userId);

    try {
        await pool.query(query, values);
        res.status(200).json({ message: 'Profil berhasil diperbarui.' });
    } catch (error) {
        console.error('Error saat update profil:', error);
        res.status(500).json({ message: 'Gagal memperbarui profil.', error });
    }
};

/**
 * [UPDATE] Mengubah Password Pengguna
 * Endpoint: PUT /api/users/password
 */
export const updatePassword = async (req: AuthRequest<{}, {}, PasswordUpdateInput>, res: Response) => {
    const userId = req.user?.id_user;
    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Semua field password harus diisi.' });
    }
    
    try {
        // 1. Ambil hash password lama
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT password FROM user WHERE id_user = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        const hashedPassword = rows[0].password;

        // 2. Bandingkan password lama
        const isMatch = await bcrypt.compare(currentPassword, hashedPassword);

        if (!isMatch) {
            return res.status(401).json({ message: 'Password lama salah.' });
        }
        
        // 3. Hash password baru
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update database
        await pool.query(
            'UPDATE user SET password = ? WHERE id_user = ?',
            [hashedNewPassword, userId]
        );

        res.status(200).json({ message: 'Password berhasil diperbarui.' });

    } catch (error) {
        console.error('Error saat update password:', error);
        res.status(500).json({ message: 'Gagal memperbarui password.', error });
    }
};