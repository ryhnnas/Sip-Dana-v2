export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface TransactionInput {
    jenis: TransactionType;
    jumlah: number;
    tanggal: string;
    keterangan: string;
    id_kategori: number;
}

export interface Category {
    id_kategori: number;
    nama_kategori: string;
}