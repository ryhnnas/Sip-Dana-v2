import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { Calendar, ArrowLeftShort, ArrowRightShort, PlusCircle, FileText } from 'react-bootstrap-icons'; 
import { fetchTransactionHistory, fetchMonthlySummary } from '../services/report.service';
import type { TransactionHistoryItem, MonthlySummary } from '../types/report.types';
import { useTimeFilter } from '../hooks/useTimeFilter'; 

interface TransactionHistoryProps {
    onTransactionAdded: () => void; 
    openTransactionModal: () => void;
    hideAddButton?: boolean; 
}

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

    const [isBalanceVisible, setIsBalanceVisible] = useState(true);

    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const totalPemasukan = summary?.totalPemasukan || 0;
    const totalPengeluaran = summary?.totalPengeluaran || 0;
    const totalNeto = summary?.neto || 0;
    
    const hasNoData = transactions.length === 0 && totalNeto === 0;

    return (
        <div style={{ 
            height: '100vh', 
            position: 'sticky', 
            top: 0, 
            backgroundColor: '#e3f2fd',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '20px' 
        }}>
            
           
        <Card className="mb-4 shadow-sm border-0 mx-1" style={{ borderRadius: '20px', overflow: 'hidden', flexShrink: 0 }}>
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                        <h5 className="mb-0 fw-bold text-primary" style={{ fontSize: '18px' }}>
                            {unit === 'mingguan' ? (
                                period.display 
                            ) : unit === 'bulan' ? (
                                new Date().toLocaleDateString('id-ID', { month: 'long' })
                            ) : (
                                new Date().getFullYear()
                            )}
                        </h5>
                    </div>

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

                {loading ? (
                    <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted" style={{ fontSize: '14px' }}>Pemasukan</span>
                            <span className="fw-bold text-success" style={{ fontSize: '14px' }}>
                                {isBalanceVisible ? formatRupiah(totalPemasukan) : 'Rp •••••••'}
                            </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted" style={{ fontSize: '14px' }}>Pengeluaran</span>
                            <span className="fw-bold text-danger" style={{ fontSize: '14px' }}>
                                {isBalanceVisible ? formatRupiah(totalPengeluaran) : 'Rp •••••••'}
                            </span>
                        </div>
                        <hr className="my-2 opacity-25" />
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>Total Neto</span>
                            <span className="fw-bold" style={{ 
                                color: totalNeto >= 0 ? '#28a745' : '#dc3545',
                                fontSize: '20px' 
                            }}>
                                {isBalanceVisible 
                                    ? `${totalNeto >= 0 ? '+' : ''}${formatRupiah(totalNeto)}` 
                                    : 'Rp ••••••••'}
                            </span>
                        </div>
                    </>
                )}

                <div className="d-flex gap-2 mt-4 bg-light p-1 rounded-pill">
                    {['mingguan', 'bulan', 'tahunan'].map((u) => (
                        <Button 
                            key={u}
                            variant={unit === u ? 'primary' : 'light'} 
                            size="sm" 
                            onClick={() => changeUnit(u as any)}
                            className="rounded-pill border-0 flex-grow-1 fw-bold"
                            style={{ 
                                fontSize: '13px',
                                padding: '8px 0',
                                transition: 'all 0.3s ease',
                                backgroundColor: unit === u ? '#007bff' : 'transparent',
                                color: unit === u ? '#fff' : '#6c757d',
                                boxShadow: unit === u ? '0 4px 10px rgba(0,123,255,0.3)' : 'none'
                            }}
                        >
                            {u === 'mingguan' ? 'Minggu' : u === 'bulan' ? 'Bulan' : 'Tahun'}
                        </Button>
                    ))}
                </div>
            </Card.Body>
        </Card>
        
        <h5 className="mb-3 fw-bold text-center" style={{ flexShrink: 0 }}>Riwayat Transaksi</h5>
                    
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '5px' }} className="px-1">
            {hasNoData ? (
                <div className="text-center p-4 text-muted">
                    <p className="mb-0">Belum ada transaksi.</p>
                </div>
            ) : (
                transactions.slice(0, 10).map((tx) => (
                    <Card key={tx.id_transaksi} className="mb-3 shadow-sm border-0 mx-1" style={{ borderRadius: '15px' }}>
                        <Card.Body className="p-3">
                            <div className="d-flex flex-column">
                                
                                <div className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '15px' }} title={tx.keterangan}>
                                    {tx.keterangan.replace('Kontribusi Target ID:', 'Tabungan Target #')}
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted" style={{ fontSize: '12px' }}>
                                        {new Date(tx.tanggal).toLocaleDateString('id-ID', { 
                                            day: '2-digit', 
                                            month: 'long', 
                                            year: 'numeric' 
                                        })}
                                    </small>

                                    <div 
                                        className="fw-bold" 
                                        style={{ 
                                            color: tx.jenis === 'pemasukan' ? '#4caf50' : '#f44336', 
                                            fontSize: '15px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {tx.jenis === 'pengeluaran' ? '- ' : '+ '}
                                        {formatRupiah(tx.jumlah)}
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                ))
            )}
        </div>
            
            {!hideAddButton && (
                <div className="pt-3 pb-2 bg-transparent" style={{ flexShrink: 0 }}>
                    <Button variant="primary" className="w-100 py-3 fw-bold shadow" style={{ borderRadius: '30px', border: 'none' }} onClick={openTransactionModal}>
                        Tambah Transaksi
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;