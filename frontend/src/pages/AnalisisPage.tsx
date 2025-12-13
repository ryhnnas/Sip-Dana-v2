import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { BarChartFill, GraphUp, Calendar, InfoCircle, CheckCircleFill, ArrowUpShort, ArrowDownShort, ArrowLeftShort, ArrowRightShort } from 'react-bootstrap-icons';
import { fetchAnalysisReport, fetchHistoricalData } from '../services/report.service'; 
import type * as ReportTypes from '../types/report.types';
import MonthlyBarChart from '../components/MonthlyBarChart'; 
import { useAuth } from '../context/AuthContext'; 
import { useTimeFilter } from '../hooks/useTimeFilter'; 
import TransactionModal from '../components/TransactionModal'; // TAMBAH INI

const AnalisisPage = () => {
    const { user } = useAuth();
    const { unit, period, navigate, changeUnit } = useTimeFilter('bulan'); 
    
    // TAMBAH STATE UNTUK MODAL
    const [showModal, setShowModal] = useState(false);
    
    const [report, setReport] = useState<ReportTypes.AnalysisReport | null>(null);
    const [historicalData, setHistoricalData] = useState<ReportTypes.AnalysisReport['chartData']>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatRupiah = (amount: number) => {
        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0
        }).format(Math.floor(amount));
        return formatted.replace('Rp', 'Rp ');
    };
    const formatPercent = (value: number) => `${value.toFixed(1)}%`;

    const loadAnalysisData = useCallback(async () => {
        setLoading(true);
        try {
            const monthParam = period.apiParam.month || new Date().toISOString().substring(0, 7); 
            
            const [analysisData, historical] = await Promise.all([
                fetchAnalysisReport(period.apiParam), 
                fetchHistoricalData()
            ]);
            setReport(analysisData);
            setHistoricalData(historical);
            setError(null);
        } catch (err: any) {
            console.error("Gagal memuat analisis:", err);
            setError("Gagal memuat data analisis. Pastikan ada data transaksi.");
        } finally {
            setLoading(false);
        }
    }, [period.apiParam]); 

    useEffect(() => {
        loadAnalysisData();
    }, [loadAnalysisData]);

    // TAMBAH HANDLER UNTUK MODAL
    const handleModalSuccess = () => {
        setShowModal(false);
        loadAnalysisData(); // Reload data setelah tambah transaksi
    };

    const handleFilterChange = (newUnit: string) => {
        changeUnit(newUnit as 'mingguan' | 'bulan' | 'tahunan');
    };
    
    if (loading) {
        return (
            <MainLayout 
                onTransactionAdded={handleModalSuccess} 
                openTransactionModal={() => setShowModal(true)}
            >
                <div className="d-flex justify-content-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-3">Memuat laporan analisis...</span>
                </div>
            </MainLayout>
        );
    }

    if (error) {
         return (
            <MainLayout 
                onTransactionAdded={handleModalSuccess} 
                openTransactionModal={() => setShowModal(true)}
            >
                <Alert variant="danger" className="mt-5">{error}</Alert>
            </MainLayout>
        );
    }
    
    const totalPemasukan = report?.summary?.totalPemasukan || 0;
    const totalPengeluaran = report?.summary?.totalPengeluaran || 0;
    const totalSelisih = report?.summary?.neto || 0;
    const isSurplus = totalSelisih >= 0;
    const topExpense = report?.topPengeluaran as ReportTypes.ReportCategory | undefined;
    const recommendation = report?.recommendation as { namaMetode: string, deskripsiMetode: string } | undefined;
    
    const persentasePerubahan = 5.89;

    return (
        <MainLayout 
            onTransactionAdded={handleModalSuccess} 
            openTransactionModal={() => setShowModal(true)}
        >
            
            <h2 className="mb-4 d-flex align-items-center text-primary">
                <BarChartFill size={28} className="me-2" /> Analisis Keuangan
            </h2>

            <div className="d-flex mb-4 align-items-center">
                
                <ButtonGroup className="me-4">
                    <Button 
                        variant={unit === 'mingguan' ? 'primary' : 'outline-secondary'} 
                        onClick={() => handleFilterChange('mingguan')}
                    >Mingguan</Button>
                    <Button 
                        variant={unit === 'bulan' ? 'primary' : 'outline-secondary'} 
                        onClick={() => handleFilterChange('bulan')}
                    >Bulanan</Button>
                    <Button 
                        variant={unit === 'tahunan' ? 'primary' : 'outline-secondary'} 
                        onClick={() => handleFilterChange('tahunan')}
                    >Tahunan</Button>
                </ButtonGroup>
                
                <div className="d-flex align-items-center">
                    <Button variant="outline-secondary" size="sm" onClick={() => navigate('prev')} disabled={loading} className="me-2">
                        <ArrowLeftShort size={18} />
                    </Button>
                    <Card className="p-2 border-0 shadow-sm">
                         <small className="mb-0 fw-bold">{period.display}</small>
                    </Card>
                    <Button variant="outline-secondary" size="sm" onClick={() => navigate('next')} disabled={loading} className="ms-2">
                        <ArrowRightShort size={18} />
                    </Button>
                </div>
            </div>
            
            <Row className="mb-4">
                
                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100 p-3" style={{ borderLeft: '5px solid green' }}>
                        <h5 className="fw-bold mb-1 text-uppercase small" style={{ color: 'green' }}>Total Pemasukan</h5>
                        <h3 className="fw-bold text-success mb-0">{formatRupiah(totalPemasukan)}</h3>
                        <small className="text-success d-flex align-items-center">
                            <ArrowUpShort size={16} /> +{persentasePerubahan}% dari bulan lalu
                        </small>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100 p-3" style={{ borderLeft: '5px solid red' }}>
                        <h5 className="fw-bold mb-1 text-uppercase small" style={{ color: 'red' }}>Total Pengeluaran</h5>
                        <h3 className="fw-bold text-danger mb-0">{formatRupiah(totalPengeluaran)}</h3>
                        <small className="text-danger d-flex align-items-center">
                            <ArrowDownShort size={16} /> +{persentasePerubahan}% dari bulan lalu
                        </small>
                    </Card>
                </Col>
                
                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100 p-3">
                        <h5 className="fw-bold mb-1 text-uppercase small text-secondary">Total Selisih</h5>
                        <h3 className="fw-bold mb-2" style={{ color: isSurplus ? '#007bff' : 'red' }}>
                            {formatRupiah(totalSelisih)}
                        </h3>
                        <p className="small text-muted">
                            Selamat Saldo Anda <span className="fw-bold text-success">{isSurplus ? 'surplus' : 'minus'}</span>.
                        </p>

                        {topExpense ? (
                            <div className="small">
                                <p className="mb-0 fw-bold">Pengeluaran Terbanyak:</p>
                                <p className="mb-0 text-danger">
                                    {topExpense.nama_kategori} ({formatPercent(topExpense.persentase)})
                                </p>
                            </div>
                        ) : (
                            <p className="small text-muted">Belum ada pengeluaran tercatat.</p>
                        )}
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0 p-4 mb-5">
                <h4 className="mb-3">Grafik Keuangan</h4>
                {historicalData.length > 0 ? (
                    <MonthlyBarChart chartData={historicalData} />
                ) : (
                    <div className="text-center p-5 text-muted">
                        Tidak ada data historis yang cukup (minimal 2 bulan) untuk menampilkan grafik.
                    </div>
                )}
            </Card>

            <Card className="shadow-sm border-0 p-4 mb-5" style={{ backgroundColor: '#e6f7ff' }}>
                <h4 className="mb-4 text-primary">Metode Mengelola Keuangan</h4>
                
                {recommendation ? (
                    <>
                        <Card className="border-0 p-3 mb-4">
                            <h5 className="mb-1 text-primary">{recommendation.namaMetode}</h5>
                            <p className="small text-success fw-bold d-flex align-items-center">
                                <CheckCircleFill size={16} className="me-2" /> Direkomendasikan
                            </p>
                            <p className="mb-0 small">{recommendation.deskripsiMetode}</p> 
                        </Card>
                        
                        <h5 className="mb-3 text-secondary d-flex align-items-center"><InfoCircle size={18} className="me-2" /> Cara Implementasi Metode</h5>
                        <ul className="list-unstyled small"> 
                            <li className="mb-1">
                                <span className="text-success me-2">●</span> Catat transaksi
                            </li>
                            <li className="mb-1">
                                <span className="text-success me-2">●</span> Kelompokkan pengeluaran
                            </li>
                            <li className="mb-1">
                                <span className="text-success me-2">●</span> Review mingguan
                            </li>
                            <li className="mb-1">
                                <span className="text-success me-2">●</span> Sesuaikan budget
                            </li>
                        </ul>
                    </>
                ) : (
                     <p className="text-muted">Tidak ada rekomendasi metode yang tersedia saat ini.</p>
                )}
            </Card>

            {/* TAMBAH MODAL */}
            <TransactionModal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                onSuccess={handleModalSuccess} 
            />

        </MainLayout>
    );
};

export default AnalisisPage;