// Sesuai dengan TransactionInput di backend
export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface TransactionInput {
    jenis: TransactionType;
    jumlah: number;
    tanggal: string; // YYYY-MM-DD
    keterangan: string;
    id_kategori: number;
    // id_user akan diambil dari token di backend
}

// Interface untuk data kategori yang akan kita ambil dari backend
export interface Category {
    id_kategori: number;
    nama_kategori: string;
}