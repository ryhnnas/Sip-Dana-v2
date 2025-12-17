import { Response } from 'express';
import pool from '../config/db.config';
import { AuthRequest } from '../middleware/auth.middleware';
import { RowDataPacket } from 'mysql2';

// Tipe data untuk parameter filter yang fleksibel
interface FilterParams {
    month?: string; 
    year?: string;  
    start_date?: string;
    end_date?: string;   
}

// Helper function untuk membangun klausa WHERE berdasarkan parameter query
const buildTimeFilter = (req: AuthRequest): { clause: string, values: (string | number)[] } => {
    const { month, year, start_date, end_date } = req.query as FilterParams;
    let clause = '';
    let values: (string | number)[] = [];

    // 1. Filter Mingguan/Custom Date Range
    if (start_date && end_date) {
        clause = 'AND DATE(tanggal) BETWEEN ? AND ?'; 
        values.push(start_date as string, end_date as string);
    } 
    // 2. Filter Bulanan
    else if (month) {
        clause = 'AND DATE_FORMAT(tanggal, "%Y-%m") = ?';
        values.push(month as string);
    } 
    // 3. Filter Tahunan
    else if (year) {
        clause = 'AND YEAR(tanggal) = ?';
        values.push(year as string);
    }
    
    return { clause, values };
};


/**
 * [GET] Mengambil Riwayat Transaksi Terbaru (DIFILTER BERDASARKAN WAKTU)
 * Endpoint: GET /api/reports/history
 */
export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id_user;
    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });

    // FIX: Ambil filter dari helper function
    const { clause, values } = buildTimeFilter(req);
    
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT 
                t.id_transaksi, t.jenis, t.jumlah, t.keterangan, t.tanggal, t.created_at, k.nama_kategori
            FROM transaksi t
            JOIN kategori k ON t.id_kategori = k.id_kategori
            WHERE t.id_user = ? ${clause}
            ORDER BY t.created_at DESC
            LIMIT 6
            `,
            [userId, ...values] // FIX: Gabungkan values filter
        ); 

        res.status(200).json({
            message: 'Riwayat transaksi berhasil diambil.',
            data: rows
        });
    } catch (error) {
        console.error('Error saat mengambil riwayat transaksi:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat transaksi.' });
    }
};


/**
 * [GET] Mengambil Ringkasan Laporan Bulanan (Saldo, Pemasukan, Pengeluaran)
 * Endpoint: GET /api/reports/summary?month=YYYY-MM
 */
export const getMonthlySummary = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id_user;
    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });

    // FIX: Ambil filter dari helper function
    const { clause, values } = buildTimeFilter(req);
    
    // 1. Ambil Total Saldo Saat Ini (TIDAK BERUBAH karena saldo adalah nilai kumulatif)
    const [saldoRow] = await pool.query<RowDataPacket[]>(
        'SELECT saldo_sekarang FROM saldo WHERE id_user = ?',
        [userId]
    ); 
    const saldoAkhir = saldoRow.length > 0 ? saldoRow[0].saldo_sekarang : 0; 
    
    // 2. Hitung Pemasukan dan Pengeluaran (DIFILTER BERDASARKAN WAKTU)
    const [summaryRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
            SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE 0 END) AS totalPemasukan,
            SUM(CASE WHEN jenis = 'pengeluaran' THEN jumlah ELSE 0 END) AS totalPengeluaran
        FROM transaksi
        WHERE id_user = ? ${clause}
        `,
        [userId, ...values] // FIX: Gabungkan values filter
    );

    const summary = summaryRows[0];
    const totalPemasukan = summary?.totalPemasukan || 0;
    const totalPengeluaran = summary?.totalPengeluaran || 0;
    const neto = totalPemasukan - totalPengeluaran;

    res.status(200).json({
        message: `Ringkasan berhasil diambil.`,
        data: {
            bulan: (req.query.month as string) || (req.query.year as string), // Untuk tampilan
            totalPemasukan,
            totalPengeluaran,
            neto,
            saldoAkhir // Nilai saldo kumulatif (tidak difilter)
        }
    });
};


/**
 * [GET] Mengambil Data Historis (6 Bulan Terakhir) untuk Grafik
 * Endpoint: GET /api/reports/historical
 */
export const getHistoricalData = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id_user;
    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                DATE_FORMAT(tanggal, '%Y-%m') AS monthYear,
                DATE_FORMAT(tanggal, '%b') AS monthName,
                SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE 0 END) AS pemasukan,
                SUM(CASE WHEN jenis = 'pengeluaran' THEN jumlah ELSE 0 END) AS pengeluaran
            FROM transaksi
            WHERE id_user = ?
            GROUP BY monthYear, monthName
            ORDER BY monthYear DESC
            LIMIT 6
            `,
            [userId]
        );
        
        const chartData = rows.reverse().map(row => ({
            month: row.monthName,
            pemasukan: row.pemasukan,
            pengeluaran: row.pengeluaran
        }));

        res.status(200).json({
            message: 'Data historis berhasil diambil.',
            data: chartData
        });
    } catch (error) {
        console.error('Error saat mengambil data historis:', error);
        res.status(500).json({ message: 'Gagal mengambil data historis.' });
    }
};


/**
 * [GET] Mengambil Laporan Analisis Lengkap (Summary, Top Kategori, Rekomendasi)
 * Endpoint: GET /api/reports/analysis?month=YYYY-MM
 */
export const getAnalysisReport = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id_user;
    if (!userId) return res.status(401).json({ message: 'User ID tidak ditemukan.' });

    const { clause, values } = buildTimeFilter(req);

    try {
        // --- 1. Ambil Summary (Menggunakan Filter Waktu) ---
        const [summaryQuery] = await pool.query<RowDataPacket[]>(
            `
            SELECT 
                SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE 0 END) AS totalPemasukan,
                SUM(CASE WHEN jenis = 'pengeluaran' THEN jumlah ELSE 0 END) AS totalPengeluaran
            FROM transaksi
            WHERE id_user = ? ${clause}
            `,
            [userId, ...values]
        );
        const totalPemasukan = summaryQuery[0]?.totalPemasukan || 0;
        const totalPengeluaran = summaryQuery[0]?.totalPengeluaran || 0;
        const neto = totalPemasukan - totalPengeluaran;

        // --- 2. Ambil Top Pengeluaran (Menggunakan Filter Waktu) ---
        const [topOut] = await pool.query<RowDataPacket[]>(
            `
            SELECT 
                k.nama_kategori, 
                SUM(t.jumlah) AS jumlah,
                (SUM(t.jumlah) / ?) * 100 AS persentase
            FROM transaksi t
            JOIN kategori k ON t.id_kategori = k.id_kategori
            WHERE t.id_user = ? AND t.jenis = 'pengeluaran' ${clause}
            GROUP BY k.nama_kategori
            ORDER BY jumlah DESC
            LIMIT 1
            `,
            [totalPengeluaran || 1, userId, ...values] // totalPengeluaran || 1 untuk mencegah division by zero
        );
        
        // --- 3. Ambil Rekomendasi Metode (Sederhana: Pay Yourself First jika surplus) ---
        let recommendation = null;
        if (neto > 0) {
            const [metode] = await pool.query<RowDataPacket[]>(
                'SELECT namaMetode, deskripsiMetode FROM metodemengelola WHERE namaMetode = "Pay Yourself First"'
            );
            recommendation = metode[0] || null;
        }

        res.status(200).json({
            message: 'Laporan analisis berhasil diambil.',
            data: {
                summary: { totalPemasukan, totalPengeluaran, neto, saldoAkhir: 0 }, 
                topPengeluaran: topOut[0] || null,
                recommendation: recommendation,
            }
        });
    } catch (error) {
        console.error('Error saat mengambil analisis laporan:', error);
        res.status(500).json({ message: 'Gagal mengambil data analisis.' });
    }
};