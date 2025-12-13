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
    const { unit, period, navigate, changeUnit } = useTimeFilter('bulan'); 
    
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
            
            {/* Box Ringkasan dengan desain baru */}
            <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <Card.Body className="p-4">
                    {/* Header dengan icon mata */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 fw-bold">{period.display}</h5>
                        <Button variant="link" className="p-0 text-secondary">
                            <i className="bi bi-eye" style={{ fontSize: '20px' }}></i>
                        </Button>
                    </div>
                    
                    {/* Ringkasan Angka */}
                    {loading ? (
                        <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                    ) : error ? (
                        <Alert variant="warning" className="small">{error}</Alert>
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
                            <div className="d-flex justify-content-between">
                                <span className="fw-bold" style={{ fontSize: '14px' }}>Total</span>
                                <span className="fw-bold" style={{ 
                                    color: totalNeto >= 0 ? '#4caf50' : '#f44336',
                                    fontSize: '16px' 
                                }}>
                                    {totalNeto >= 0 ? '+' : ''}{formatRupiah(totalNeto)}
                                </span>
                            </div>
                        </>
                    )}

                    {/* Filter Unit dengan design pill */}
                    <div className="d-flex gap-2 mt-3">
                        <Button 
                            variant={unit === 'mingguan' ? 'primary' : 'light'} 
                            size="sm" 
                            onClick={() => changeUnit('mingguan')}
                            style={{ 
                                borderRadius: '20px', 
                                flex: 1,
                                backgroundColor: unit === 'mingguan' ? '#2196f3' : '#fff',
                                color: unit === 'mingguan' ? '#fff' : '#666',
                                border: 'none',
                                fontWeight: 500
                            }}
                        >
                            Minggu
                        </Button>
                        <Button 
                            variant={unit === 'bulan' ? 'primary' : 'light'} 
                            size="sm" 
                            onClick={() => changeUnit('bulan')}
                            style={{ 
                                borderRadius: '20px', 
                                flex: 1,
                                backgroundColor: unit === 'bulan' ? '#2196f3' : '#fff',
                                color: unit === 'bulan' ? '#fff' : '#666',
                                border: 'none',
                                fontWeight: 500
                            }}
                        >
                            Bulan
                        </Button>
                        <Button 
                            variant={unit === 'tahunan' ? 'primary' : 'light'} 
                            size="sm" 
                            onClick={() => changeUnit('tahunan')}
                            style={{ 
                                borderRadius: '20px', 
                                flex: 1,
                                backgroundColor: unit === 'tahunan' ? '#2196f3' : '#fff',
                                color: unit === 'tahunan' ? '#fff' : '#666',
                                border: 'none',
                                fontWeight: 500
                            }}
                        >
                            Tahun
                        </Button>
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
                    {transactions.map((tx) => (
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
                                            {tx.keterangan}
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
                    ))}
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