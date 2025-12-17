import { Response } from 'express';
import pool from '../config/db.config';
import { AuthRequest } from '../middleware/auth.middleware';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * [GET] Mengambil semua target menabung user yang aktif
 */
export const getActiveTargets = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id_user;
    
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id_target, id_user, nama_target, target_jumlah, jumlah_terkumpul, tanggal_target, status FROM targetmenabung WHERE id_user = ? ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json({ data: rows });
    } catch (error: any) {
        console.error('ERROR DATABASE (getActiveTargets):', error.message);
        res.status(500).json({ message: 'Gagal mengambil data target.' });
    }
};

/**
 * [POST] Membuat target menabung baru
 */
export const createTarget = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id_user;
    const { nama_target, target_jumlah, tanggal_target } = req.body;

    try {
        // FIX: Ubah ke targetmenabung agar sinkron
        await pool.execute(
            'INSERT INTO targetmenabung (id_user, nama_target, target_jumlah, tanggal_target, jumlah_terkumpul, status) VALUES (?, ?, ?, ?, 0, "dalam_proses")',
            [userId, nama_target, target_jumlah, tanggal_target]
        );
        res.status(201).json({ message: 'Target berhasil dibuat.' });
    } catch (error: any) {
        console.error('ERROR CREATE TARGET:', error.message);
        res.status(500).json({ message: 'Gagal membuat target.' });
    }
};

/**
 * [POST] Kontribusi Saldo ke Target Menabung
 */
export const contributeToTarget = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id_user;
    const { id_target, jumlah } = req.body;

    if (!id_target || !jumlah || jumlah <= 0) {
        return res.status(400).json({ message: 'Data tidak valid.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Ambil Nama Target dan Cek Eksistensi Target
        const [targetRows] = await connection.query<RowDataPacket[]>(
            'SELECT nama_target FROM targetmenabung WHERE id_target = ? AND id_user = ?',
            [id_target, userId]
        );

        if (targetRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Target tidak ditemukan.' });
        }

        const namaTarget = targetRows[0].nama_target;

        // 2. Cek Saldo Utama
        const [saldoRows] = await connection.query<RowDataPacket[]>(
            'SELECT saldo_sekarang FROM saldo WHERE id_user = ?',
            [userId]
        );
        const saldoSekarang = saldoRows[0]?.saldo_sekarang || 0;

        if (saldoSekarang < jumlah) {
            await connection.rollback();
            return res.status(400).json({ message: 'Saldo utama tidak mencukupi.' });
        }

        // 3. Kurangi Saldo Utama
        await connection.execute(
            'UPDATE saldo SET saldo_sekarang = saldo_sekarang - ? WHERE id_user = ?',
            [jumlah, userId]
        );

        // 4. Tambah jumlah_terkumpul ke Target
        await connection.execute(
            'UPDATE targetmenabung SET jumlah_terkumpul = jumlah_terkumpul + ? WHERE id_target = ? AND id_user = ?',
            [jumlah, id_target, userId]
        );

        // 5. Catat ke riwayat transaksi menggunakan NAMA TARGET
        await connection.execute(
            `INSERT INTO transaksi (id_user, id_kategori, jenis, jumlah, keterangan, tanggal) VALUES 
            (?, (SELECT id_kategori FROM kategori WHERE nama_kategori = 'Tabungan' LIMIT 1), 'pengeluaran', ?, ?, NOW())`,
            [
                userId, 
                jumlah, 
                `Kontribusi Target: ${namaTarget}` // Sekarang dinamis mengikuti nama target
            ]
        );

        // 6. Update Status ke tercapai jika sudah cukup
        await connection.execute(
            'UPDATE targetmenabung SET status = "tercapai" WHERE id_target = ? AND jumlah_terkumpul >= target_jumlah',
            [id_target]
        );

        await connection.commit();
        res.status(200).json({ message: 'Kontribusi berhasil!' });

    } catch (error: any) {
        await connection.rollback();
        console.error('Error kontribusi target:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat memproses kontribusi.' });
    } finally {
        connection.release();
    }
};