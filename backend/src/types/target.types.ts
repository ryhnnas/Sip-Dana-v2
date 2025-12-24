export interface TargetInput {
    nama_target: string;
    target_jumlah: number;
    tanggal_target: string; 
}

export interface TargetMenabung extends TargetInput {
    id_target: number;
    id_user: number;
    jumlah_terkumpul: number;
    status: 'aktif' | 'tercapai' | 'batal';
    created_at: Date;
    updated_at: Date;
}