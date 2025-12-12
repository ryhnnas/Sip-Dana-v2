import { RowDataPacket } from 'mysql2';

export type TransactionType = 'pemasukan' | 'pengeluaran';

// Interface untuk data transaksi yang diterima dari request body
export interface TransactionInput {
    id_kategori: number;
    tanggal: string; // Akan diproses sebagai DATE MySQL
    jumlah: number;
    jenis: TransactionType;
    keterangan?: string;
}

// Interface untuk data transaksi lengkap (termasuk dari DB)
export interface Transaction extends RowDataPacket {
    id_transaksi: number;
    id_user: number;
    id_kategori: number;
    tanggal: Date;
    jumlah: number;
    jenis: TransactionType;
    saldo: number | null;
    keterangan: string | null;
    created_at: Date;
}

