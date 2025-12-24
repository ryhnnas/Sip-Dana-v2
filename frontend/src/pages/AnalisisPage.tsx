import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, ButtonGroup, Alert, Spinner } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { BarChartFill, GraphUp, InfoCircle, CheckCircleFill, ArrowUpShort, ArrowDownShort, ArrowLeftShort, ArrowRightShort,BookHalf, LightbulbFill, InfoCircleFill} from 'react-bootstrap-icons';
import { fetchAnalysisReport, fetchHistoricalData, fetchMonthlySummary } from '../services/report.service'; 
import type * as ReportTypes from '../types/report.types';
import MonthlyBarChart from '../components/MonthlyBarChart'; 
import { useAuth } from '../context/AuthContext'; 
import { useTimeFilter } from '../hooks/useTimeFilter'; 
import TransactionModal from '../components/TransactionModal';
import IllustrationNoData from '../assets/ilustrasi2.png';
import IconAnalisisBiru from '../assets/IconAnalisisBiru.svg';
import OnlyLogoBiru from '../assets/OnlyLogoBiru.svg';
import IconBuku from '../assets/Buku.svg'; 
import IconLampu from '../assets/Lampu.svg'; 
import IconHurufI from '../assets/HurufIHijau.svg'; 
import IconChecklist from '../assets/ChecklistHijau.svg'; 

const AnalisisPage = () => {
    const { user } = useAuth();
    const { unit, period, navigate, changeUnit } = useTimeFilter('bulan'); 
    
    // State untuk data perbandingan persentase
    const [summaryData, setSummaryData] = useState({
        totalPemasukan: 0,
        totalPengeluaran: 0,
        neto: 0,
        saldoAkhir: 0,
        persentasePemasukan: 0,
        persentasePengeluaran: 0
    });
    const [showModal, setShowModal] = useState(false);
    const [report, setReport] = useState<any>(null); 
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
       const [analysisRes, historical] = await Promise.all([
            fetchAnalysisReport(period.apiParam), 
            fetchHistoricalData({ unit: unit === 'bulan' ? 'bulanan' : unit })
        ]);

        if (analysisRes && analysisRes.summary) {
            setSummaryData({
                totalPemasukan: analysisRes.summary.totalPemasukan || 0,
                totalPengeluaran: analysisRes.summary.totalPengeluaran || 0,
                neto: analysisRes.summary.neto || 0,
                saldoAkhir: 0,
                persentasePemasukan: analysisRes.summary.persentasePemasukan || 0,
                persentasePengeluaran: analysisRes.summary.persentasePengeluaran || 0
            });
        }
            
        setReport(analysisRes);
        setHistoricalData(historical);
        
        // Ambil data summary dari hasil Analysis Report
        if (analysisRes.summary) {
            setSummaryData({
                totalPemasukan: analysisRes.summary.totalPemasukan,
                totalPengeluaran: analysisRes.summary.totalPengeluaran,
                neto: analysisRes.summary.neto,
                saldoAkhir: 0,
                persentasePemasukan: analysisRes.summary.persentasePemasukan || 0,
                persentasePengeluaran: analysisRes.summary.persentasePengeluaran || 0
            });
        }
        setError(null);
    } catch (err: any) {
        setError("Gagal memuat data analisis.");
    } finally {
        setLoading(false);
    }
}, [period.apiParam, unit]);

    useEffect(() => {
        loadAnalysisData();
    }, [loadAnalysisData]);

    const handleModalSuccess = () => {
        setShowModal(false);
        loadAnalysisData();
    };

    const handleFilterChange = (newUnit: string) => {
        changeUnit(newUnit as 'mingguan' | 'bulan' | 'tahunan');
    };

    if (loading) {
        return (
            <MainLayout onTransactionAdded={handleModalSuccess} openTransactionModal={() => setShowModal(true)}>
                <div className="d-flex justify-content-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-3">Memuat laporan analisis...</span>
                </div>
            </MainLayout>
        );
    }

    if (error) {
         return (
            <MainLayout onTransactionAdded={handleModalSuccess} openTransactionModal={() => setShowModal(true)}>
                <Alert variant="danger" className="mt-5">{error}</Alert>
            </MainLayout>
        );
    }

    // Variabel pembantu untuk mempermudah pembacaan JSX
    const summary = report?.summary;
    const totalPemasukan = summary?.totalPemasukan || 0;
    const totalPengeluaran = summary?.totalPengeluaran || 0;
    const totalSelisih = summary?.neto || 0;
    const topExpense = report?.topPengeluaran;
    const rec = report?.recommendation;

    return (
        <MainLayout onTransactionAdded={handleModalSuccess} openTransactionModal={() => setShowModal(true)}>
           <h2 className="mb-4 d-flex align-items-center text-primary fw-bold" style={{ fontSize: '35px' }}>
                <img 
                    src={IconAnalisisBiru} 
                    alt="Ikon Analisis" 
                    className="me-2" 
                    style={{ 
                        width: '32px', 
                        height: '32px',
                        display: 'block',
                        marginTop: '-1px' 
                    }} 
                /> 
                <span style={{ display: 'inline-block', lineHeight: '1.2' }}>
                    Analisis Keuangan
                </span>
            </h2>

           <div className="d-flex mb-4 align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex gap-2">
                    {['mingguan', 'bulan', 'tahunan'].map((u) => (
                        <Button 
                            key={u}
                            variant={unit === u ? 'primary' : 'outline-primary'} 
                            onClick={() => handleFilterChange(u as any)} 
                            className={`rounded-pill px-4 fw-bold border-2 ${unit !== u ? 'bg-white' : ''}`}
                            style={{ 
                                fontSize: '14px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {u === 'mingguan' ? 'Mingguan' : u === 'bulan' ? 'Bulanan' : 'Tahunan'}
                        </Button>
                    ))}
                </div>

                <div className="d-flex align-items-center bg-white p-1 rounded-pill shadow-sm border">
                    <Button 
                        variant="link" 
                        onClick={() => navigate('prev')} 
                        disabled={loading} 
                        className="text-primary p-1 d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: '35px', height: '35px' }}
                    >
                        <ArrowLeftShort size={24} />
                    </Button>

                    <div className="px-3">
                        <span className="fw-bold text-dark" style={{ fontSize: '15px', whiteSpace: 'nowrap' }}>
                            {period.display}
                        </span>
                    </div>

                    <Button 
                        variant="link" 
                        onClick={() => navigate('next')} 
                        disabled={loading} 
                        className="text-primary p-1 d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: '35px', height: '35px' }}
                    >
                        <ArrowRightShort size={24} />
                    </Button>
                </div>
            </div>
            
            <Row className="mb-4">
                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100 p-3" style={{ borderLeft: '5px solid green', borderRadius: '20px' }}>
                        <h5 className="fw-bold mb-1 text-uppercase small text-success">Total Pemasukan</h5>
                        <h3 className="fw-bold text-success mb-0">{formatRupiah(totalPemasukan)}</h3>
                        </Card>
                    </Col>

                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100 p-3" style={{ borderLeft: '5px solid red', borderRadius: '20px' }}>
                        <h5 className="fw-bold mb-1 text-uppercase small text-danger">Total Pengeluaran</h5>
                        <h3 className="fw-bold text-danger mb-0">{formatRupiah(totalPengeluaran)}</h3>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100 p-3" style={{ borderRadius: '20px' }}>
                        <h5 className="fw-bold mb-1 text-uppercase small text-primary">Total Selisih</h5>
                        <h3 className="fw-bold mb-2 text-primary">{formatRupiah(totalSelisih)}</h3>
                        <p className="small text-muted mb-1">
                            Status: <span className={`fw-bold ${totalSelisih > 0 ? 'text-success' : totalSelisih === 0 ? 'text-secondary' : 'text-danger'}`}>
                                {totalSelisih > 0 ? 'Surplus' : totalSelisih === 0 ? 'Seimbang' : 'Minus'}
                            </span>
                        </p>
                        <p className="small text-muted mb-0">
                            Pengeluaran Terbesar: {topExpense ? (
                                <span className="fw-bold text-danger">
                                    {topExpense.nama_kategori} ({formatPercent((topExpense.jumlah / (totalPengeluaran || 1)) * 100)})
                                </span>
                            ) : <span className="fw-bold text-secondary">--</span>}
                        </p>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0 mb-5" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold text-muted mb-0" style={{ color: '#000' }}>Grafik Keuangan</h4>

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

        {(totalPemasukan === 0 && totalPengeluaran === 0) ? (
            <Card className="shadow-sm border-0 p-5 text-center mt-5" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <img 
                    src={OnlyLogoBiru} 
                    alt="Logo SipDana" 
                    className="img-fluid mb-4 mx-auto"
                    style={{ maxWidth: '350px' }}
                />
                <h4 className="text-secondary">Ayo mulai kelola keuangan Anda dengan mencatat transaksi!</h4>
                <p className="small text-muted mb-0">Kami belum bisa memberikan Metode Mengelola Keuangan untuk periode <strong>{period.display}</strong> karena data kosong.</p>
            </Card>
            
        ) : (rec && rec.namaMetode) ? ( 
            <>
                {/* METODE MENGELOLA KEUANGAN */}
                <Card className="shadow-sm border-0 mb-4 overflow-hidden" style={{ borderRadius: '25px' }}>
                    <div className="bg-primary p-3 px-4 d-flex align-items-center text-white">
                        <img 
                            src={IconBuku} 
                            alt="Ikon Buku" 
                            className="me-2" 
                            style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} 
                        /> 
                        <h5 className="mb-0 fw-bold">Metode Mengelola Keuangan</h5>
                    </div>
                    
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                            <div className="p-3 rounded-4 me-3 d-flex align-items-center justify-content-center" 
                                style={{ backgroundColor: '#007bff', width: '70px', height: '70px', flexShrink: 0 }}>
                                <img 
                                    src={IconLampu} 
                                    alt="Ikon Lampu" 
                                    style={{ width: '35px', height: '35px', filter: 'brightness(0) invert(1)' }} 
                                />
                            </div>
                        
                            <div>
                                <h4 className="fw-bold text-primary mb-1">{rec.namaMetode}</h4>
                                <div className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2" 
                                    style={{ width: 'fit-content', display: 'inline-flex', alignItems: 'center' }}> 
                                    <img src={IconChecklist} alt="Checklist" className="me-1" style={{ width: '14px', height: '14px' }} />
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Direkomendasikan</span> 
                                </div>
                            </div>
                        </div>
                        <p className="text-secondary fw-medium mb-0" style={{ fontSize: '15px' }}>
                            {rec.detailRekomendasi || rec.deskripsiMetode} 
                        </p>
                    </Card.Body>
                </Card>

                {/* CARA IMPLEMENTASI */}
                {rec.langkah_implementasi ? (
                    <Card className="shadow-sm border-0" style={{ borderRadius: '25px', backgroundColor: '#e9f7f1' }}>
                        <Card.Body className="p-4">
                            <h4 className="mb-4 text-success d-flex align-items-center fw-bold">
                                <img src={IconHurufI} alt="Ikon Informasi" className="me-3" style={{ width: '28px', height: '28px' }} /> 
                                Cara Implementasi Metode
                            </h4>
                            <ul className="list-unstyled mb-0 ms-1">
                                {rec.langkah_implementasi.split('|').map((step: string, i: number) => (
                                    <li key={i} className="mb-3 d-flex align-items-start text-secondary fw-medium">
                                        <span className="text-secondary me-3">•</span>
                                        <span style={{ fontSize: '15px' }}>{step.trim()}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card.Body>
                    </Card>
                ) : null}
            </>
        ) : (
            <Card className="shadow-sm border-0 p-4 text-center">
                <p className="text-muted small mb-0">
                    Sistem sedang memproses data untuk memberikan rekomendasi terbaik. <br/>
                    Cobalah untuk memfilter periode lain.
                </p>
            </Card>
        )}

        <TransactionModal show={showModal} handleClose={() => setShowModal(false)} onSuccess={handleModalSuccess} />
    </MainLayout>
);
};

export default AnalisisPage;