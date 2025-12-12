import api from './api';
import type * as ReportTypes from '../types/report.types';

// Interface untuk parameter query yang fleksibel
interface FilterParams {
    month?: string; // YYYY-MM
    year?: string;  // YYYY
    start_date?: string; // YYYY-MM-DD
    end_date?: string;   // YYYY-MM-DD
}

const getCurrentMonth = (): string => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

// Fungsi helper untuk mengubah objek {month: '...', year: '...'} menjadi query string
const buildQueryString = (params: FilterParams | string): string => {
    if (typeof params === 'string') {
        // Jika params adalah string, kita asumsikan itu adalah bulan (untuk kompatibilitas lama)
        return `?month=${params}`;
    }
    
    // Konversi objek menjadi query string (?key1=value1&key2=value2)
    const queryString = Object.keys(params)
        .filter(key => params[key as keyof FilterParams] !== undefined)
        .map(key => `${key}=${params[key as keyof FilterParams]}`)
        .join('&');
        
    return queryString ? `?${queryString}` : '';
};


/**
 * Mengambil ringkasan laporan keuangan bulanan.
 * FIX: Menerima objek FilterParams
 */
export const fetchMonthlySummary = async (params: FilterParams | string = getCurrentMonth()): Promise<ReportTypes.MonthlySummary> => {
    const queryString = buildQueryString(params);
    // FIX: Menggunakan queryString yang sudah diformat
    const response = await api.get<{ message: string, data: ReportTypes.MonthlySummary }>(`/reports/summary${queryString}`);
    return response.data.data;
};

/**
 * Mengambil Riwayat Transaksi Terbaru.
 * FIX: Menerima objek FilterParams
 */
export const fetchTransactionHistory = async (params: FilterParams | string = ''): Promise<ReportTypes.TransactionHistoryItem[]> => {
    const queryString = buildQueryString(params);
    // FIX: Menggunakan queryString yang sudah diformat
    const response = await api.get<{ message: string, data: ReportTypes.TransactionHistoryItem[] }>(`/reports/history${queryString}`);
    return response.data.data;
};

/**
 * Mengambil Laporan Analisis Lengkap (Top Kategori, Rekomendasi).
 * FIX: Menerima objek FilterParams
 */
export const fetchAnalysisReport = async (params: FilterParams | string = getCurrentMonth()): Promise<ReportTypes.AnalysisReport> => {
    const queryString = buildQueryString(params);
    // FIX: Menggunakan queryString yang sudah diformat
    const response = await api.get<{ message: string, data: ReportTypes.AnalysisReport }>(`/reports/analysis${queryString}`);
    return response.data.data;
};

// fetchHistoricalData tetap sama
export const fetchHistoricalData = async (): Promise<ReportTypes.AnalysisReport['chartData']> => {
    const response = await api.get<{ message: string, data: ReportTypes.AnalysisReport['chartData'] }>('/reports/historical');
    return response.data.data;
};