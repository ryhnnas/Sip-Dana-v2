import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { Calendar, ArrowLeftShort, ArrowRightShort, PlusCircle, FileText } from 'react-bootstrap-icons'; 
import { fetchTransactionHistory, fetchMonthlySummary } from '../services/report.service';
import type { TransactionHistoryItem, MonthlySummary } from '../types/report.types';
import { useTimeFilter } from '../hooks/useTimeFilter'; 

interface TransactionHistoryProps {
    onTransactionAdded: () => void; 
    openTransactionModal: () => void;
    hideAddButton?: boolean; // Tambah prop optional untuk hide button
}

// Fungsi format Rupiah bersih (tanpa ,00)
const formatRupiah = (amount: number) => {
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0
    }).format(amount);
    return formatted.replace('Rp', 'Rp. ');
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onTransactionAdded, openTransactionModal, hideAddButton = false }) => {
    // 1. Ambil fungsi navigate dari hook
    const { unit, period, navigate, changeUnit } = useTimeFilter('bulan'); 
    
    // 2. State untuk sembunyi/tampilkan saldo
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);

    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Callback untuk memuat data (dipanggil dari Dashboard dan saat mount)
    const loadHistoryData = useCallback(async () => {
        setLoading(true);
        try {
            const history = await fetchTransactionHistory(period.apiParam); 
            const monthlySummary = await fetchMonthlySummary(period.apiParam); 
            
            setTransactions(history); 
            setSummary(monthlySummary);
            setError(null);
        } catch (err: any) {
            console.error("Gagal memuat riwayat:", err);
            setError("Gagal memuat riwayat transaksi.");
        } finally {
            setLoading(false);
        }
    }, [period.apiParam]);

    useEffect(() => {
        loadHistoryData();
    }, [loadHistoryData, onTransactionAdded]); 

    // Data Summary
    const totalPemasukan = summary?.totalPemasukan || 0;
    const totalPengeluaran = summary?.totalPengeluaran || 0;
    const totalNeto = summary?.neto || 0;
    
    const hasNoData = transactions.length === 0 && totalNeto === 0;

    return (
        <div style={{ backgroundColor: '#e3f2fd', minHeight: '100vh', padding: '20px' }}>
            
            {/* Box Ringkasan */}
            <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <Card.Body className="p-4">
                    {/* Header dengan Navigasi Geser & Icon Mata */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-2">
                            {/* Tombol Geser Kiri */}
                            <Button variant="light" size="sm" onClick={() => navigate('prev')} className="rounded-circle shadow-sm p-1">
                                <ArrowLeftShort size={24} />
                            </Button>
                            
                            <h5 className="mb-0 fw-bold mx-1" style={{ fontSize: '16px' }}>{period.display}</h5>
                            
                            {/* Tombol Geser Kanan */}
                            <Button variant="light" size="sm" onClick={() => navigate('next')} className="rounded-circle shadow-sm p-1">
                                <ArrowRightShort size={24} />
                            </Button>
                        </div>

                        {/* Tombol Icon Mata */}
                        <Button 
                            variant="link" 
                            className="p-0 text-secondary shadow-none" 
                            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                        >
                            {isBalanceVisible ? (
                                <i className="bi bi-eye-fill" style={{ fontSize: '20px' }}></i>
                            ) : (
                                <i className="bi bi-eye-slash-fill" style={{ fontSize: '20px' }}></i>
                            )}
                        </Button>
                    </div>
                    
                    {/* Ringkasan Angka */}
                    {loading ? (
                        <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between mb-2">
                                <span style={{ fontSize: '14px' }}>Pemasukan</span>
                                <span className="fw-bold" style={{ color: '#4caf50', fontSize: '14px' }}>
                                    {formatRupiah(totalPemasukan)}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span style={{ fontSize: '14px' }}>Pengeluaran</span>
                                <span className="fw-bold" style={{ color: '#f44336', fontSize: '14px' }}>
                                    {formatRupiah(totalPengeluaran)}
                                </span>
                            </div>
                            
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold" style={{ fontSize: '14px' }}>Total</span>
                                <span className="fw-bold" style={{ 
                                    color: totalNeto >= 0 ? '#4caf50' : '#f44336',
                                    fontSize: '18px' 
                                }}>
                                    {isBalanceVisible 
                                        ? `${totalNeto >= 0 ? '+' : ''}${formatRupiah(totalNeto)}` 
                                        : 'Rp ••••••••'}
                                </span>
                            </div>
                        </>
                    )}

                    {/* Filter Unit */}
                    <div className="d-flex gap-2 mt-4 bg-light p-1 rounded-pill">
                        {['mingguan', 'bulan', 'tahunan'].map((u) => {
                            let displayLabel = "";
                            if (u === 'mingguan') displayLabel = "Minggu";
                            else if (u === 'bulan') displayLabel = "Bulan";
                            else if (u === 'tahunan') displayLabel = "Tahun";

                            return (
                                <Button 
                                    key={u}
                                    variant={unit === u ? 'primary' : 'light'} 
                                    size="sm" 
                                    onClick={() => changeUnit(u as any)}
                                    className="rounded-pill border-0 flex-grow-1 fw-bold"
                                    style={{ 
                                        fontSize: '12px',
                                        transition: '0.3s',
                                        backgroundColor: unit === u ? '#007bff' : 'transparent',
                                        color: unit === u ? '#fff' : '#6c757d'
                                    }}
                                >
                                    {displayLabel}
                                </Button>
                            );
                        })}
                    </div>
                </Card.Body>
            </Card>

            {/* Header Riwayat Transaksi */}
            <h5 className="mb-3 fw-bold text-center">Riwayat Transaksi</h5>
            
            {/* List Transaksi */}
            {hasNoData ? (
                <div className="text-center p-4 text-muted">
                    <p className="mb-0">Belum ada transaksi tercatat pada periode ini.</p>
                </div>
            ) : (
                <div className="mb-5">
                    {transactions.map((tx) => {
                        // LOGIKA MEMBERSIHKAN TEKS (CARA 2)
                        // Mengubah "Kontribusi Target ID: 1" menjadi "Tabungan Target #1"
                        const displayKeterangan = tx.keterangan.replace('Kontribusi Target ID:', 'Tabungan Target #');

                        return (
                            <Card 
                                key={tx.id_transaksi} 
                                className="mb-3 shadow-sm border-0"
                                style={{ borderRadius: '15px' }}
                            >
                                <Card.Body className="p-3">
                                    <div className="d-flex align-items-center">
                                        {/* Keterangan dan Tanggal */}
                                        <div className="flex-grow-1">
                                            <div className="fw-bold" style={{ fontSize: '15px' }}>
                                                {displayKeterangan}
                                            </div>
                                            <small className="text-muted" style={{ fontSize: '12px' }}>
                                                {new Date(tx.tanggal).toLocaleDateString('id-ID', { 
                                                    day: '2-digit', 
                                                    month: 'long', 
                                                    year: 'numeric',
                                                })}
                                            </small>
                                        </div>
                                        
                                        {/* Jumlah */}
                                        <div 
                                            className="fw-bold" 
                                            style={{ 
                                                color: tx.jenis === 'pemasukan' ? '#4caf50' : '#f44336',
                                                fontSize: '15px'
                                            }}
                                        >
                                            {formatRupiah(tx.jumlah)}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            )}
            
            {/* Tombol Tambah Transaksi - Setelah list */}
            {!hideAddButton && (
                <div className="mt-4 pb-4">
                    <Button 
                        variant="primary" 
                        className="w-100 py-3 fw-bold shadow-lg"
                        style={{ 
                            borderRadius: '30px',
                            backgroundColor: '#2196f3',
                            border: 'none',
                            fontSize: '16px'
                        }}
                        onClick={openTransactionModal}
                    >
                        <PlusCircle size={20} className="me-2" />
                        Tambah Transaksi
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;