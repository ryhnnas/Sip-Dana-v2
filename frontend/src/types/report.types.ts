export interface MonthlySummary { 
    bulan: string; // YYYY-MM
    totalPemasukan: number;
    totalPengeluaran: number;
    neto: number; // Pemasukan - Pengeluaran
    saldoAkhir: number;
}

export interface TransactionHistoryItem { // <-- TIPE DATA BARU
    id_transaksi: number;
    jenis: 'pemasukan' | 'pengeluaran';
    jumlah: number;
    keterangan: string;
    tanggal: string; // YYYY-MM-DD
    created_at: string; // Timestamp
    nama_kategori: string;
}

export interface ReportCategory {
    namaKategori: string;
    persentase: number;
    jumlah: number;
}

export interface AnalysisReport {
    summary: MonthlySummary;
    topPemasukan: ReportCategory | null;
    topPengeluaran: ReportCategory | null;
    chartData: { month: string; pemasukan: number; pengeluaran: number }[];
}