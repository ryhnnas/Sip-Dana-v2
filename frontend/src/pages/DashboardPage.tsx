import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Navbar, Nav, Button, Spinner, Card, ProgressBar, Alert } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMonthlySummary, fetchTransactionHistory, fetchHistoricalData } from '../services/report.service'; 
import type * as ReportTypes from '../types/report.types'; 
import { WalletFill, BoxArrowRight, CurrencyDollar, ArrowDown, ArrowUp, GraphUp, EyeFill, PlusCircle, BellFill } from 'react-bootstrap-icons';
import TransactionModal from '../components/TransactionModal'; 
import MonthlyBarChart from '../components/MonthlyBarChart'; 
import IllustrationNoData from '../assets/ilustrasi2.png'; 

const DashboardPage = () => {
    const navigate = useNavigate();
    const { handleLogout, user } = useAuth(); 
    
    const [summary, setSummary] = useState<ReportTypes.MonthlySummary | null>(null);
    const [history, setHistory] = useState<ReportTypes.TransactionHistoryItem[]>([]); 
    const [historicalData, setHistoricalData] = useState<ReportTypes.AnalysisReport['chartData']>([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false); 
    
    const formatRupiah = (amount: number) => {
        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.floor(amount));
        
        return formatted.replace('Rp', 'Rp ');
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryData, historyData, historicalData] = await Promise.all([ 
                fetchMonthlySummary(),
                fetchTransactionHistory(),
                fetchHistoricalData()
            ]);
            setSummary(summaryData);
            setHistory(historyData);
            setHistoricalData(historicalData);
            setError(null);
        } catch (err: any) {
            console.error("Gagal memuat data Dashboard:", err);
            setError("Gagal memuat data keuangan. Cek koneksi Backend.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleModalSuccess = () => {
        setShowModal(false);
        loadData(); 
    };

    const totalSaldo = summary?.saldoAkhir || 0;
    const totalPemasukan = summary?.totalPemasukan || 0;
    const totalPengeluaran = summary?.totalPengeluaran || 0;
    const isSurplus = (totalPemasukan - totalPengeluaran) > 0;
    
    const hasData = history.length > 0;
    const progressPlaceholder = 75; 
    

    if (loading) {
        return (
            <MainLayout hideAddButton={true}>
                <div className="d-flex justify-content-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-3">Memuat data Dashboard...</span>
                </div>
            </MainLayout>
        );
    }
    
    if (error) {
        return (
            <MainLayout hideAddButton={true}>
                <Alert variant="danger" className="mt-5">{error}</Alert>
            </MainLayout>
        );
    }

    return (
        <MainLayout 
            onTransactionAdded={handleModalSuccess} 
            openTransactionModal={() => setShowModal(true)}
            hideAddButton={true} // TAMBAHKAN PROP INI untuk hide button di TransactionHistory
        >
            
            <h2 className="mb-4 d-flex align-items-center text-primary">
                <GraphUp size={28} className="me-2" /> Beranda
            </h2>
            
            {hasData ? (
                <>
                    {/* Baris Atas: Saldo & Notifikasi */}
                    <Row className="mb-4">
                        {/* 1. Kotak Saldo Saat Ini / Tabungan */}
                        <Col md={6} className="mb-3">
                            <Card className="shadow-sm border-0 h-100 p-4">
                                <h5 className="text-muted">Total Saldo Saat Ini</h5>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="fw-bold text-primary mb-0">{formatRupiah(totalSaldo)}</h3>
                                    <EyeFill size={20} className="text-muted" style={{ cursor: 'pointer' }} />
                                </div>
                                <p className={`small mt-2 ${isSurplus ? 'text-success' : 'text-danger'}`}>
                                    {isSurplus ? <ArrowUp size={16} /> : <ArrowDown size={16} />} 
                                    {formatRupiah(totalPemasukan - totalPengeluaran)} Neto Bulan Ini
                                </p>
                                <ProgressBar now={progressPlaceholder} variant="success" className="mb-2 mt-3" />
                                <small className="text-muted">{progressPlaceholder}% Target Tabungan</small>
                            </Card>
                        </Col>
                        
                        {/* 2. Notifikasi */}
                        <Col md={6} className="mb-3">
                            <Card className="shadow-sm border-0 h-100 border-start border-warning border-4" style={{ backgroundColor: '#fffbe6' }}>
                                <Card.Body>
                                    <h5 className="text-warning"><BellFill className="me-2" /> Notifikasi</h5>
                                    <p className="fw-bold">Halo, {user?.username}!</p>
                                    <p className="small mb-1">
                                        Saldo Anda **{isSurplus ? 'surplus' : 'minus'}**. 
                                    </p>
                                    <p className="text-muted small">
                                        Pemasukan: {formatRupiah(totalPemasukan)} | Pengeluaran: {formatRupiah(totalPengeluaran)}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Tombol Tambah Transaksi (Full-width) - TETAP DI DASHBOARD */}
                    <div className="d-grid mb-5">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="py-3 fw-bold shadow"
                            onClick={() => setShowModal(true)} 
                        >
                            <PlusCircle size={24} className="me-2" /> Tambah Transaksi
                        </Button>
                    </div>
                    
                    {/* Area Analisis Keuangan (Grafik Bar Chart) */}
                    <h4 className="mb-3">Analisis Keuangan</h4>
                    <Card className="shadow-sm border-0 p-4 mb-5">
                        {historicalData.length > 0 ? (
                            <MonthlyBarChart chartData={historicalData} /> 
                        ) : (
                            <div className="text-center p-5 text-muted">
                                Tidak ada data historis untuk ditampilkan. Catat lebih banyak transaksi!
                            </div>
                        )}
                    </Card>
                </>
            ) : (
                /* Tampilan Jika TIDAK ADA DATA */
                <Card className="shadow-sm border-0 p-5 text-center mt-5">
                    <img 
                        src={IllustrationNoData} 
                        alt="Ilustrasi Data Kosong" 
                        className="img-fluid mb-4 mx-auto"
                        style={{ maxWidth: '350px' }}
                    />
                    <h4 className="text-secondary">Selamat Datang di SipDana!</h4>
                    <p className="text-muted mb-4">
                        Ayo mulai kelola keuangan Anda dengan mencatat transaksi pertama.
                    </p>
                    <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={() => setShowModal(true)}
                        className="fw-bold"
                    >
                        <PlusCircle size={24} className="me-2" /> Mulai Catat Transaksi Pertama
                    </Button>
                </Card>
            )}

            {/* Modal Transaksi */}
            <TransactionModal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                onSuccess={handleModalSuccess} 
            />

        </MainLayout>
    );
};

export default DashboardPage;