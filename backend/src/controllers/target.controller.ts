import { Response } from 'express';
import pool from '../config/db.config';
import { AuthRequest } from '../middleware/auth.middleware';
import { TargetInput, TargetMenabung } from '../types/target.types';
import { OkPacket, RowDataPacket } from 'mysql2';

// Tipe data untuk parameter route, yang berisi id_target
interface TargetParams {
    id_target: string;
}

/**
 * [POST] Membuat Target Menabung Baru
 * Endpoint: POST /api/targets
 */
export const createTarget = async (req: AuthRequest<{}, {}, TargetInput>, res: Response) => {
    const userId = req.user?.id_user;
    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });

    const { nama_target, target_jumlah, tanggal_target } = req.body;

    if (!nama_target || !target_jumlah || !tanggal_target) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    try {
        const query = `
            INSERT INTO targetmenabung 
            (id_user, nama_target, target_jumlah, tanggal_target) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.query<OkPacket>(query, [
            userId, nama_target, target_jumlah, tanggal_target
        ]);

        res.status(201).json({ 
            message: 'Target menabung berhasil dibuat.', 
            id_target: result.insertId 
        });

    } catch (error) {
        console.error('Error saat membuat target:', error);
        res.status(500).json({ message: 'Gagal membuat target menabung.' });
    }
};

/**
 * [GET] Mengambil Semua Target Menabung Aktif
 * Endpoint: GET /api/targets
 */
export const getActiveTargets = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id_user;
    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });

    try {
        const [rows] = await pool.query<TargetMenabung & RowDataPacket[]>(
            `
            SELECT * FROM targetmenabung 
            WHERE id_user = ? AND status = 'aktif'
            ORDER BY tanggal_target ASC
            `,
            [userId]
        );

        res.status(200).json({
            message: 'Daftar target aktif berhasil diambil.',
            data: rows
        });
    } catch (error) {
        console.error('Error saat mengambil target:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar target menabung.' });
    }
};

/**
 * [PUT] Menambahkan dana ke target (Kontribusi)
 * Endpoint: PUT /api/targets/contribute/:id_target
 */
export const contributeToTarget = async (req: AuthRequest<TargetParams, {}, { amount: number }>, res: Response) => {
    const userId = req.user?.id_user;
    
    // FIX: Destructure dengan tipe yang sudah didefinisikan
    const { id_target } = req.params; 
    const { amount } = req.body;

    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });
    
    // Konversi id_target dari string (params) ke integer
    const targetId = parseInt(id_target);
    if (isNaN(targetId) || !amount || amount <= 0) {
        return res.status(400).json({ message: 'ID target tidak valid atau jumlah kontribusi harus positif.' });
    }


    try {
        await pool.query('START TRANSACTION');

        const [result] = await pool.query<OkPacket>(
            `
            UPDATE targetmenabung 
            SET jumlah_terkumpul = jumlah_terkumpul + ?,
                status = CASE WHEN (jumlah_terkumpul + ?) >= target_jumlah THEN 'tercapai' ELSE 'aktif' END
            WHERE id_target = ? AND id_user = ?
            `,
            [amount, amount, targetId, userId] // Gunakan targetId yang sudah di-parse
        );

        if (result.affectedRows === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Target tidak ditemukan atau bukan milik Anda.' });
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Dana berhasil ditambahkan ke target.' });
        
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error saat kontribusi dana:', error);
        res.status(500).json({ message: 'Gagal menambahkan dana ke target.' });
    }
};