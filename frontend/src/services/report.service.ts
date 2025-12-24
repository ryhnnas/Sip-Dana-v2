import api from './api';
import type * as ReportTypes from '../types/report.types';

interface FilterParams {
    month?: string; 
    year?: string;  
    start_date?: string;
    end_date?: string;   
    unit?: string; 
}

const getCurrentMonth = (): string => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

const buildQueryString = (params: FilterParams | string): string => {
    if (typeof params === 'string') {
        return `?month=${params}`;
    }
    
    const queryString = Object.keys(params)
        .filter(key => params[key as keyof FilterParams] !== undefined)
        .map(key => `${key}=${params[key as keyof FilterParams]}`)
        .join('&');
        
    return queryString ? `?${queryString}` : '';
};

/**
 * Mengambil ringkasan laporan keuangan bulanan.
 * SINKRON: Menggunakan /reports sesuai index.ts backend
 */
export const fetchMonthlySummary = async (params: FilterParams | string = getCurrentMonth()): Promise<ReportTypes.MonthlySummary> => {
    const queryString = buildQueryString(params);
    const response = await api.get<{ message: string, data: ReportTypes.MonthlySummary }>(`/reports/summary${queryString}`);
    return response.data.data;
};

/**
 * Mengambil Riwayat Transaksi Terbaru.
 */
export const fetchTransactionHistory = async (params: FilterParams | string = ''): Promise<ReportTypes.TransactionHistoryItem[]> => {
    const queryString = buildQueryString(params);
    const response = await api.get<{ message: string, data: ReportTypes.TransactionHistoryItem[] }>(`/reports/history${queryString}`);
    return response.data.data;
};

/**
 * Mengambil Laporan Analisis Lengkap
 */
export const fetchAnalysisReport = async (params: FilterParams | string = getCurrentMonth()): Promise<ReportTypes.AnalysisReport> => {
    const queryString = buildQueryString(params);
    const response = await api.get<{ message: string, data: ReportTypes.AnalysisReport }>(`/reports/analysis${queryString}`);
    return response.data.data;
};

/**
 * Mengambil Data Historis untuk Grafik.
 */
export const fetchHistoricalData = async (params: FilterParams = { unit: 'bulanan' }): Promise<ReportTypes.AnalysisReport['chartData']> => {
    const queryString = buildQueryString(params);
    const response = await api.get<{ message: string, data: ReportTypes.AnalysisReport['chartData'] }>(`/reports/historical${queryString}`);
    return response.data.data;
};