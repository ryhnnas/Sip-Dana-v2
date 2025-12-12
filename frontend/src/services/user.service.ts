import api from './api';
import type { ProfileUpdateInput, PasswordUpdateInput } from '../types/auth.types';

export const updateProfileService = async (data: ProfileUpdateInput): Promise<{ message: string }> => {
    const response = await api.put('/users/profile', data);
    return response.data;
};

export const updatePasswordService = async (data: PasswordUpdateInput): Promise<{ message: string }> => {
    const response = await api.put('/users/password', data);
    return response.data;
};