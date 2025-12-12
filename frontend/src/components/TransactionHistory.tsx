import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { Calendar, ArrowLeftShort, ArrowRightShort, PlusCircle } from 'react-bootstrap-icons'; 
import { fetchTransactionHistory, fetchMonthlySummary } from '../services/report.service';
import type { TransactionHistoryItem, MonthlySummary } from '../types/report.types';
import { useTimeFilter } from '../hooks/useTimeFilter'; 

interface TransactionHistoryProps {
    onTransactionAdded: () => void; 
    openTransactionModal: () => void;
}

// Fungsi format Rupiah bersih (tanpa ,00)
const formatRupiah = (amount: number) => {
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0
    }).format(Math.floor(amount));
    return formatted.replace('Rp', 'Rp ');
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onTransactionAdded, openTransactionModal }) => {
    const { unit, period, navigate, changeUnit } = useTimeFilter('bulan'); 
    
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Callback untuk memuat data (dipanggil dari Dashboard dan saat mount)
    const loadHistoryData = useCallback(async () => {
        setLoading(true);
        try {
            // ASUMSI FIX: Mengirim seluruh objek period.apiParam untuk memfilter data
            // Anda harus memastikan fetchTransactionHistory dan fetchMonthlySummary 
            // di report.service.ts dapat menerima {month}, {year}, atau {start_date, end_date}
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
    }, [period.apiParam]); // <-- Dependency ini yang memastikan data refresh saat tanggal/unit berubah

    useEffect(() => {
        loadHistoryData();
    }, [loadHistoryData, onTransactionAdded]); 

    // Data Summary
    const totalPemasukan = summary?.totalPemasukan || 0;
    const totalPengeluaran = summary?.totalPengeluaran || 0;
    const totalNeto = summary?.neto || 0;
    
    const hasNoData = transactions.length === 0 && totalNeto === 0;

    return (
        <div style={{ backgroundColor: '#eef7ff', minHeight: '100vh', padding: '20px' }}>
            
            {/* Box Ringkasan Bulan */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    {/* Header Navigasi Bulan */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Button variant="outline-primary" size="sm" onClick={() => navigate('prev')} disabled={loading}>
                            <ArrowLeftShort size={18} />
                        </Button>
                        <h6 className="mb-0 text-primary d-flex align-items-center fw-bold">
                            <Calendar size={18} className="me-2" />
                            {period.display}
                        </h6>
                        <Button variant="outline-primary" size="sm" onClick={() => navigate('next')} disabled={loading}>
                            <ArrowRightShort size={18} />
                        </Button>
                    </div>
                    
                    {/* Ringkasan Angka */}
                    {loading ? (
                        <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                    ) : error ? (
                        <Alert variant="warning" className="small">{error}</Alert>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between mb-2 small">
                                <small className="text-muted">Pemasukan</small>
                                <Badge bg="success">{formatRupiah(totalPemasukan)}</Badge>
                            </div>
                            <div className="d-flex justify-content-between mb-2 small">
                                <small className="text-muted">Pengeluaran</small>
                                <Badge bg="danger">{formatRupiah(totalPengeluaran)}</Badge>
                            </div>
                            
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between fw-bold small">
                                <small>Total Neto</small>
                                <small style={{ color: totalNeto >= 0 ? 'green' : 'red' }}>{formatRupiah(totalNeto)}</small>
                            </div>
                        </>
                    )}

                    {/* Filter Unit */}
                    <div className="d-flex justify-content-around mt-3">
                        <Button variant={unit === 'mingguan' ? 'primary' : 'outline-secondary'} size="sm" onClick={() => changeUnit('mingguan')}>Minggu</Button>
                        <Button variant={unit === 'bulan' ? 'primary' : 'outline-secondary'} size="sm" onClick={() => changeUnit('bulan')}>Bulan</Button>
                        <Button variant={unit === 'tahunan' ? 'primary' : 'outline-secondary'} size="sm" onClick={() => changeUnit('tahunan')}>Tahun</Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Riwayat Transaksi */}
            <h6 className="mb-3 fw-bold">Riwayat Transaksi (Terbaru)</h6>
            
            {hasNoData ? (
                <div className="text-center p-4 text-muted small">
                    <p className="mb-0">Belum ada transaksi tercatat pada periode ini.</p>
                </div>
            ) : (
                <ListGroup variant="flush">
                    {transactions.map((tx) => (
                        <ListGroup.Item 
                            key={tx.id_transaksi} 
                            className="d-flex justify-content-between align-items-center border-0 p-3 mb-2 rounded shadow-sm"
                            style={{ backgroundColor: 'white' }}
                        >
                            <div>
                                <div className="fw-bold small">{tx.keterangan}</div>
                                <small className="text-muted">{new Date(tx.tanggal).toLocaleDateString('id-ID')}</small>
                            </div>
                            <div className={tx.jenis === 'pemasukan' ? 'text-success fw-bold small' : 'text-danger fw-bold small'}>
                                {tx.jenis === 'pemasukan' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
            
        </div>
    );
};

export default TransactionHistory;