import { Response } from 'express';
import pool from '../config/db.config';
import { RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * [READ] Ambil semua daftar Kategori
 * Endpoint: GET /api/utilities/categories
 */
export const getCategories = async (req: AuthRequest, res: Response) => {
    try {
        const [categories] = await pool.query<RowDataPacket[]>(
            'SELECT id_kategori, nama_kategori FROM kategori ORDER BY nama_kategori ASC'
        );

        res.status(200).json({
            message: 'Daftar kategori berhasil diambil.',
            data: categories
        });
    } catch (error) {
        console.error('Error saat mengambil kategori:', error);
        res.status(500).json({ message: 'Gagal mengambil data kategori.', error });
    }
};

/**
 * [READ] Ambil semua daftar Metode Pengelolaan
 * Endpoint: GET /api/utilities/methods
 */
export const getMethods = async (req: AuthRequest, res: Response) => {
    try {
        const [methods] = await pool.query<RowDataPacket[]>(
            'SELECT id_metode, namaMetode, deskripsiMetode FROM metodemengelola ORDER BY id_metode ASC'
        );

        res.status(200).json({
            message: 'Daftar metode pengelolaan berhasil diambil.',
            data: methods
        });
    } catch (error) {
        console.error('Error saat mengambil metode pengelolaan:', error);
        res.status(500).json({ message: 'Gagal mengambil data metode pengelolaan.', error });
    }
};