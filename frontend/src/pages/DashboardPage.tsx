import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Navbar, Nav, Button, Spinner, Card, ProgressBar, Alert } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMonthlySummary, fetchTransactionHistory, fetchHistoricalData } from '../services/report.service'; 
import type * as ReportTypes from '../types/report.types'; 
import { WalletFill, BoxArrowRight, CurrencyDollar, ArrowDown, ArrowUp, GraphUp, EyeFill, PlusCircle, BellFill, DashCircle, EyeSlashFill } from 'react-bootstrap-icons';
import TransactionModal from '../components/TransactionModal'; 
import MonthlyBarChart from '../components/MonthlyBarChart'; 
import IllustrationNoData from '../assets/ilustrasi2.png'; 
import OnlyLogoBiru from '../assets/OnlyLogoBiru.svg';
import IconBerandaBiru from '../assets/IconBerandaBiru.svg';


const DashboardPage = () => {
    const navigate = useNavigate();
    const { handleLogout, user } = useAuth(); 
    
    const [summary, setSummary] = useState<ReportTypes.MonthlySummary | null>(null);
    const [history, setHistory] = useState<ReportTypes.TransactionHistoryItem[]>([]); 
    const [historicalData, setHistoricalData] = useState<ReportTypes.AnalysisReport['chartData']>([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false); 
    const [showSaldo, setShowSaldo] = useState(true); 

    
    
    
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
    const totalSelisih = totalPemasukan - totalPengeluaran;
    const isSurplus = totalSelisih > 0;
    const isMinus = totalSelisih < 0;  
    const hasData = history.length > 0;
    const getStatusDetails = () => {
        if (isSurplus) {
            return {
                label: "Surplus",
                color: "success",
                advice: "Silakan menabung dan tetap jaga pengeluaran agar tetap stabil."
            };
        } else if (isMinus) {
            return {
                label: "Minus",
                color: "danger",
                advice: "Ayo berhemat sehingga saldo Anda tidak minus. Prioritaskan kebutuhan pokok terlebih dahulu."
            };
        } else {
            return {
                label: "Balance",
                color: "primary",
                advice: "Pertahankan kedisiplinan mencatat transaksi agar keuangan tetap terkontrol."
            };
        }
    };

    const statusInfo = getStatusDetails();
    

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
            hideAddButton={true}
        >
            
           <h2 className="mb-4 d-flex align-items-center text-primary fw-bold" style={{ fontSize: '35px' }}>
                <img 
                    src={IconBerandaBiru} 
                    alt="Ikon Beranda" 
                    className="me-2" 
                    style={{ 
                        width: '32px', 
                        height: '32px',
                        display: 'block',
                        marginTop: '-1px' 
                    }} 
                /> 
                <span style={{ display: 'inline-block', lineHeight: '1.2' }}>
                    Beranda
                </span>
            </h2>
            
            {hasData ? (
                <>
                    {/* Saldo & Notifikasi */}
                    <Row className="mb-4">
                        <Col md={6} className="mb-3">
                            <Card className="shadow-sm border-0 h-100 p-4" style={{ borderRadius: '20px' }}>
                                <h5 className="fw-bold text-muted">Total Saldo Saat Ini</h5>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="fw-bold text-primary mb-0">
                                        {showSaldo ? formatRupiah(totalSaldo) : "Rp ••••••"}
                                    </h3>
                                    
                                    <div 
                                        onClick={() => setShowSaldo(!showSaldo)} 
                                        style={{ cursor: 'pointer' }}
                                        className="text-muted p-2"
                                    >
                                        {showSaldo ? <EyeFill size={20} /> : <EyeSlashFill size={20} />}
                                    </div>
                                </div>
                                
                                <p className={`small mt-2 d-flex align-items-center ${
                                    totalSelisih > 0 ? 'text-success' : 
                                    totalSelisih < 0 ? 'text-danger' : 'text-muted'
                                }`}>
                                    {totalSelisih > 0 && <ArrowUp size={16} className="me-1" />}
                                    {totalSelisih < 0 && <ArrowDown size={16} className="me-1" />}
                                    {totalSelisih === 0 && <span className="me-1">—</span>} 
                                    
                                    {showSaldo ? formatRupiah(Math.abs(totalSelisih)) : "Rp •••"} Neto Bulan Ini
                                </p>
                            </Card>
                        </Col>
                        
                        <Col md={6} className="mb-3">
                            <Card className="shadow-sm border-0 h-100 border-start border-warning border-4" style={{ backgroundColor: '#fffbe6', borderRadius: '20px' }}>
                                <Card.Body>
                                    <h5 className="fw-bold text-warning d-flex align-items-center">
                                        <BellFill className="me-2" /> Notifikasi
                                    </h5>
                                    <p className="fw-bold mb-1">Halo, {user?.username}!</p>
                                    
                                    <p className="small mb-1">
                                        Saldo Anda saat ini <span className={`fw-bold text-${statusInfo.color}`}>{statusInfo.label}</span>.
                                    </p>
                                    <hr className="my-2 opacity-25" />
                                    <p className="text-dark small mb-2">
                                        {statusInfo.advice}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className="d-grid mb-5">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="py-3 fw-bold shadow"
                            onClick={() => setShowModal(true)} 
                            style={{ 
                            borderRadius: '30px',
                            backgroundColor: 'primary',
                            border: 'none',
                            fontSize: '20px'
                        }}
                        >
                            Tambah Transaksi
                        </Button>
                        
                    </div>
                    
                    
                    <Card className="shadow-sm border-0 mb-5" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold text-muted mb-0" style={{ color: '#000' }}>Grafik Keuangan Bulanan</h4>
                                
                                <div className="d-flex gap-3 small fw-bold text-muted">
                                    <div className="d-flex align-items-center">
                                        <span className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '50%', display: 'inline-block' }}></span>
                                        Pemasukan
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#ff4d4d', borderRadius: '50%', display: 'inline-block' }}></span>
                                        Pengeluaran
                                    </div>
                                </div>
                            </div>

                            <div style={{ minHeight: '300px' }}>
                                {historicalData.length > 0 ? (
                                    <MonthlyBarChart chartData={historicalData} /> 
                                ) : (
                                    <div className="text-center p-5 text-muted d-flex flex-column align-items-center justify-content-center" style={{ height: '300px' }}>
                                        <p className="mb-0">Tidak ada data historis untuk ditampilkan.</p>
                                        <small>Catat lebih banyak transaksi untuk melihat analisis!</small>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </>
            ) : (
                <Card className="shadow-sm border-0 p-5 text-center mt-5" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <img 
                        src={OnlyLogoBiru} 
                        alt="Logo SipDana" 
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
                        style={{ 
                            borderRadius: '30px',
                            backgroundColor: 'primary',
                            border: 'none',
                            fontSize: '20px'
                        }}
                    >
                        Mulai Catat Transaksi Pertama
                    </Button>
                </Card>
            )}

            <TransactionModal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                onSuccess={handleModalSuccess} 
            />

        </MainLayout>
    );
};

export default DashboardPage;