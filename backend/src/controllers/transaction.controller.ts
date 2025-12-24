import { Response } from 'express';
import pool from '../config/db.config';
import { AuthRequest } from '../middleware/auth.middleware';
import { TransactionInput } from '../types/transaction.types';
import { OkPacket } from 'mysql2';

/**
 * [POST] Mencatat Transaksi Baru (Pemasukan/Pengeluaran)
 * Endpoint: POST /api/transactions
 */
export const createTransaction = async (req: AuthRequest<{}, {}, TransactionInput>, res: Response) => {
    const userId = req.user?.id_user;
    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });

    const { jenis, jumlah, tanggal, keterangan, id_kategori } = req.body;

    if (!jenis || !jumlah || !tanggal || !keterangan || !id_kategori) {
        return res.status(400).json({ message: 'Semua field transaksi wajib diisi.' });
    }
    
    if (jumlah <= 0) {
        return res.status(400).json({ message: 'Jumlah transaksi harus positif.' });
    }

    try {
        await pool.query('START TRANSACTION');

        const transactionQuery = `
            INSERT INTO transaksi 
            (id_user, jenis, jumlah, tanggal, keterangan, id_kategori) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query<OkPacket>(transactionQuery, [
            userId, jenis, jumlah, tanggal, keterangan, id_kategori
        ]);
        const transactionId = result.insertId;

        const amount = jenis === 'pemasukan' ? jumlah : -jumlah;
         
        const [saldoRows] = await pool.query<OkPacket[]>(
            'SELECT id_saldo FROM saldo WHERE id_user = ?',
            [userId]
        );
        
        if (saldoRows.length > 0) {
            await pool.query(
                'UPDATE saldo SET saldo_sekarang = saldo_sekarang + ? WHERE id_user = ?', 
                [amount, userId]
            );
        } else {
            await pool.query(
                'INSERT INTO saldo (id_user, saldo_sekarang) VALUES (?, ?)', 
                [userId, amount]
            );
        }

        await pool.query('COMMIT');

        res.status(201).json({ 
            message: 'Transaksi berhasil dicatat dan saldo diperbarui.', 
            transactionId 
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error saat membuat transaksi:', error);
        res.status(500).json({ message: 'Gagal mencatat transaksi dan memperbarui saldo.' });
    }
};