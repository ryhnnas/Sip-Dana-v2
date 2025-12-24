import api from './api';
import * as TargetTypes from '../types/target.types'; 

/**
 * [GET] Mengambil semua target menabung aktif.
 */
export const fetchActiveTargets = async (): Promise<TargetTypes.TargetMenabung[]> => {
    const response = await api.get<{ message: string, data: TargetTypes.TargetMenabung[] }>('/targets');
    // Pastikan ini me-return response.data.data
    return response.data.data;
};

/**
 * [POST] Membuat target menabung baru.
 */
export const createNewTarget = async (data: TargetTypes.TargetInput) => {
    const response = await api.post('/targets', data);
    return response.data;
};

export const contributeToTarget = async (data: { id_target: number; jumlah: number }) => {
    const response = await api.post('/targets/contribute', data); 
    return response.data;
};