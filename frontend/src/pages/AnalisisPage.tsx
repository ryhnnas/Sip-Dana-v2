import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { BarChartFill, GraphUp, Calendar, InfoCircle, CheckCircleFill, ArrowUpShort, ArrowDownShort, ArrowLeftShort, ArrowRightShort, ChatRightTextFill } from 'react-bootstrap-icons';
import { fetchAnalysisReport, fetchHistoricalData } from '../services/report.service'; 
import type * as ReportTypes from '../types/report.types';
import MonthlyBarChart from '../components/MonthlyBarChart'; 
import { useAuth } from '../context/AuthContext'; 
import { useTimeFilter } from '../hooks/useTimeFilter'; 
import TransactionModal from '../components/TransactionModal';
import IllustrationNoData from '../assets/ilustrasi2.png'; 

const AnalisisPage = () => {
    const { user } = useAuth();
    // 'unit' di sini berisi 'mingguan', 'bulan', atau 'tahunan' dari hook useTimeFilter
    const { unit, period, navigate, changeUnit } = useTimeFilter('bulan'); 
    
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
            // PERBAIKAN: Mengirim parameter 'unit' ke fetchHistoricalData agar grafik dinamis
            const [analysisData, historical] = await Promise.all([
                fetchAnalysisReport(period.apiParam), 
                fetchHistoricalData({ unit: unit === 'bulan' ? 'bulanan' : unit }) 
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
    }, [period.apiParam, unit]); // Tambahkan 'unit' sebagai dependency agar re-fetch saat tombol filter diklik

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
    
    const summary = report?.summary;
    const totalPemasukan = summary?.totalPemasukan || 0;
    const totalPengeluaran = summary?.totalPengeluaran || 0;
    const totalSelisih = summary?.neto || 0;
    const isSurplus = totalSelisih >= 0;
    const topExpense = report?.topPengeluaran;
    
    const rec = report?.recommendation;
    const persentasePerubahan = 5.89;

    return (
        <MainLayout onTransactionAdded={handleModalSuccess} openTransactionModal={() => setShowModal(true)}>
            
            <h2 className="mb-4 d-flex align-items-center text-primary">
                <BarChartFill size={28} className="me-2" /> Analisis Keuangan
            </h2>

            {/* Bagian Filter Waktu */}
            <div className="d-flex mb-4 align-items-center flex-wrap gap-3">
                <ButtonGroup>
                    {['mingguan', 'bulan', 'tahunan'].map((u) => (
                        <Button 
                            key={u}
                            variant={unit === u ? 'primary' : 'outline-secondary'} 
                            onClick={() => handleFilterChange(u)}
                            className="text-capitalize"
                        >{u}</Button>
                    ))}
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
                        <small className="text-success d-flex align-items-center"><ArrowUpShort size={16} /> +{persentasePerubahan}%</small>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100 p-3" style={{ borderLeft: '5px solid red' }}>
                        <h5 className="fw-bold mb-1 text-uppercase small" style={{ color: 'red' }}>Total Pengeluaran</h5>
                        <h3 className="fw-bold text-danger mb-0">{formatRupiah(totalPengeluaran)}</h3>
                        <small className="text-danger d-flex align-items-center"><ArrowDownShort size={16} /> +{persentasePerubahan}%</small>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100 p-3">
                        <h5 className="fw-bold mb-1 text-uppercase small text-secondary">Total Selisih</h5>
                        <h3 className="fw-bold mb-2" style={{ color: isSurplus ? '#007bff' : 'red' }}>{formatRupiah(totalSelisih)}</h3>
                        <p className="small text-muted mb-0 text-capitalize">Status: <span className="fw-bold text-success">{isSurplus ? 'surplus' : 'minus'}</span></p>
                        {topExpense && (
                            <div className="small mt-1">
                                <span className="text-danger fw-bold">{topExpense.nama_kategori}</span> ({formatPercent((topExpense.jumlah / (totalPengeluaran || 1)) * 100)})
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0 p-4 mb-5">
                <h4 className="mb-3">Grafik Keuangan</h4>
                {historicalData.length > 0 ? (
                    /* Komponen ini akan menerima data yang sudah difilter oleh backend */
                    <MonthlyBarChart chartData={historicalData} />
                ) : (
                    <div className="text-center p-5 text-muted">Belum ada data grafis tersedia.</div>
                )}
            </Card>

            {/* SEKSI METODE MENGELOLA KEUANGAN */}
            <Card className="shadow-sm border-0 p-4 mb-5" style={{ backgroundColor: '#e6f7ff' }}>
                <h4 className="mb-4 text-primary d-flex align-items-center">
                    <BarChartFill className="me-2" size={24} /> Metode Mengelola Keuangan
                </h4>
                
                {/* 1. CEK APAKAH DATA TRANSAKSI KOSONG */}
                {totalPemasukan === 0 && totalPengeluaran === 0 ? (
                    <div className="text-center p-4 bg-white rounded shadow-sm">
                        <div className="mb-3">
                            <img 
                                src={IllustrationNoData} 
                                alt="Ilustrasi Data Kosong" 
                                className="img-fluid mb-4 mx-auto"
                                style={{ maxWidth: '350px' }}
                            />
                            <p className="small text-muted mb-0">
                            Kami belum bisa memberikan analisis untuk periode <strong>{period.display}</strong> karena belum ada data pemasukan atau pengeluaran.
                        </p>
                        </div>                       
                    </div>
                ) : rec ? (
                    <>
                        {/* 2. TAMPILKAN REKOMENDASI JIKA ADA DATA (Kode lama kamu di bawah ini) */}
                        <div className="bg-white p-3 rounded shadow-sm mb-4" style={{ borderLeft: '5px solid #0d6efd' }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <h6 className="fw-bold text-primary mb-0">{rec.tipeRekomendasi}</h6>
                            </div>
                            <p className="mb-0 small text-muted">"{rec.detailRekomendasi}"</p>
                        </div>

                        <div className="bg-white p-3 rounded shadow-sm mb-4">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary text-white rounded p-2 me-3">
                                    <GraphUp size={24} />
                                </div>
                                <div>
                                    <h5 className="mb-0 text-primary fw-bold">{rec.namaMetode}</h5>
                                    <div className="badge bg-light text-success border border-success mt-1">
                                        <CheckCircleFill size={12} className="me-1" /> Direkomendasikan
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 mb-0 small text-muted">{rec.deskripsiMetode}</p>
                        </div>
                        
                        {rec.namaMetode && (
                            <div className="p-3 rounded shadow-sm" style={{ backgroundColor: '#e9f7f1' }}>
                                <h5 className="mb-3 text-success d-flex align-items-center fw-bold">
                                    <InfoCircle size={20} className="me-2" /> Cara Implementasi Metode
                                </h5>
                                <ul className="list-unstyled mb-0 ms-1">
                                    {rec.langkah_implementasi?.split('|').map((step: string, i: number) => (
                                        <li key={i} className="small mb-2 d-flex align-items-start text-secondary">
                                            <span className="text-success me-2 fw-bold">•</span>
                                            <span>{step.replace('● ', '')}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    /* Jika ada transaksi tapi database rekomendasi bermasalah */
                    <p className="text-muted small text-center">Gagal memuat rekomendasi. Coba hubungi admin.</p>
                )}
            </Card>

            <TransactionModal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                onSuccess={handleModalSuccess} 
            />
        </MainLayout>
    );
};

export default AnalisisPage;