import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, ProgressBar, Alert, Spinner, InputGroup } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { Bullseye, PlusCircle, CheckCircle, Clock, CashStack, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import { fetchActiveTargets, createNewTarget, contributeToTarget } from '../services/target.service';
import * as TargetTypes from '../types/target.types'; 
import { fetchMonthlySummary } from '../services/report.service';
import type * as ReportTypes from '../types/report.types'; 
import TransactionModal from '../components/TransactionModal';
import IconTargetBiru from '../assets/IconTargetBiru.svg';
import OnlyLogoBiru from '../assets/OnlyLogoBiru.svg';

const formatRupiah = (amount: number) => {
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0
    }).format(Math.floor(amount));
    return formatted.replace('Rp', 'Rp ');
};

const ContributeModal: React.FC<ContributeModalProps> = ({ show, handleClose, target, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Style kustom seragam dengan TransactionModal
    const inputStyle = {
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount.replace(/\D/g, ''));
        
        if (!numericAmount || numericAmount <= 0) {
            setError('Masukkan jumlah yang valid.');
            return;
        }

        setLoading(true);
        try {
            await contributeToTarget({
                id_target: target!.id_target,
                jumlah: numericAmount
            });
            setAmount('');
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memproses kontribusi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <div className="bg-white shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden', border: 'none' }}>
                {/* Header dengan Ikon Box sesuai TransactionModal */}
                <Modal.Header closeButton className="border-0 pt-4 px-4 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary">
                            <CashStack size={24} />
                        </div>
                        Tabung untuk Target
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-4 pb-4 pt-3">
                    {/* Alert modern */}
                    {error && (
                        <Alert variant="danger" className="border-0 rounded-4 mb-4 small fw-medium">
                            {error}
                        </Alert>
                    )}

                    {/* Info Target yang sedang dipilih */}
                    <div className="text-center mb-4 p-3 rounded-4" style={{ backgroundColor: '#f0f7ff', border: '1px dashed #0d6efd' }}>
                        <p className="small text-muted mb-1">Anda akan menabung untuk:</p>
                        <h5 className="fw-bold text-primary mb-0">{target?.nama_target}</h5>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold small text-muted mb-2">
                                Nominal Nabung (Rp)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                className="fw-bold fs-4 text-primary text-center"
                                style={inputStyle}
                                placeholder="0"
                                value={amount}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setAmount(val ? parseInt(val).toLocaleString('id-ID') : '');
                                }}
                                required
                            />
                            <p className="text-center small text-muted mt-2 mb-0">
                                Saldo utama Anda akan dialokasikan ke target ini secara virtual.
                            </p>
                        </Form.Group>

                        <div className="d-flex gap-2">
                            
                            <Button 
                                variant="primary" 
                                type="submit" 
                                disabled={loading} 
                                className="flex-fill py-3 fw-bold shadow-sm" 
                                style={{ borderRadius: '15px' }}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Konfirmasi Nabung'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </div>
        </Modal>
    );
};

// --- MODAL TAMBAH TARGET (Disesuaikan UI) ---
interface TargetModalProps {
    show: boolean;
    handleClose: () => void;
    onSuccess: () => void;
}

const TargetModal: React.FC<TargetModalProps> = ({ show, handleClose, onSuccess }) => {
    // State Awal
    const initialState = {
        nama_target: '',
        target_jumlah: '',
        tanggal_target: new Date().toISOString().substring(0, 10),
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // RESET STATE SAAT MODAL DIBUKA/DITUTUP
    useEffect(() => {
        if (show) {
            setFormData(initialState);
            setError(null);
        }
    }, [show]);

    const inputStyle = {
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'target_jumlah') {
            const cleanValue = value.replace(/\D/g, ''); 
            const numberValue = parseInt(cleanValue) || 0;
            setFormData(prev => ({ ...prev, [name]: numberValue.toLocaleString('id-ID') })); 
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericTarget = parseFloat(formData.target_jumlah.replace(/\./g, '').replace(/,/g, ''));
        
        if (numericTarget <= 0) {
            setError('Target jumlah harus lebih dari Rp 0.');
            return;
        }

        setLoading(true);
        try {
            await createNewTarget({ ...formData, target_jumlah: numericTarget });
            
            // Penting: Reset data setelah sukses
            setFormData(initialState);
            
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal membuat target.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <div className="bg-white shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden', border: 'none' }}>
                <Modal.Header closeButton className="border-0 pt-4 px-4 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary">
                            <Bullseye size={24} />
                        </div>
                        Buat Target Baru
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-4 pb-4 pt-3">
                    {error && <Alert variant="danger" className="border-0 rounded-4 mb-4 small fw-medium">{error}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-muted mb-2">Nama Target</Form.Label>
                            <Form.Control 
                                type="text" name="nama_target" value={formData.nama_target} 
                                onChange={handleChange} style={inputStyle} placeholder="Misal: Liburan Akhir Tahun" required 
                            />
                        </Form.Group>

                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted mb-2">Target Jumlah (Rp)</Form.Label>
                                    <Form.Control 
                                        type="text" name="target_jumlah" value={formData.target_jumlah} 
                                        onChange={handleChange} style={inputStyle} placeholder="0" required 
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-6">
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted mb-2">Target Tanggal</Form.Label>
                                    <Form.Control 
                                        type="date" name="tanggal_target" value={formData.tanggal_target} 
                                        onChange={handleChange} style={inputStyle} required 
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <Button variant="primary" type="submit" disabled={loading} className="w-100 py-3 border-0 shadow-sm fw-bold mt-2" style={{ borderRadius: '15px' }}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Simpan Target'}
                        </Button>
                    </Form>
                </Modal.Body>
            </div>
        </Modal>
    );
};

// --- ITEM TARGET ---
const TargetItem: React.FC<{ target: TargetTypes.TargetMenabung, onContribute: (t: TargetTypes.TargetMenabung) => void }> = ({ target, onContribute }) => {
    const progress = Math.min(100, (target.jumlah_terkumpul / target.target_jumlah) * 100);
    const isAchieved = target.status === 'tercapai' || progress >= 100;
    
    return (
        <Card 
            className={`shadow-sm border-0 h-100 mb-4`}
            style={{ borderRadius: '25px', overflow: 'hidden' }}
        >
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 fw-bold" style={{ fontSize: '11px' }}>
                        <Bullseye size={14} className="me-1" /> TARGET SIMPANAN
                    </div>
                    {isAchieved ? (
                        <div className="text-success d-flex align-items-center fw-bold small">
                            <CheckCircle size={18} className="me-1" /> Selesai
                        </div>
                    ) : (
                        <div className="text-warning d-flex align-items-center fw-bold small">
                            <Clock size={16} className="me-1" /> Aktif
                        </div>
                    )}
                </div>

                <h5 className="fw-bold mb-1 text-dark text-truncate">{target.nama_target}</h5>
                <p className="text-muted small mb-4">
                    Sampai: {new Date(target.tanggal_target).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                
                {/* TATA LETAK VERTIKAL: Goal di atas, Terkumpul di bawah */}
    <div className="mb-3">
        {/* Baris Goal (Lebih Kecil) */}
        <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted small fw-bold">Goal</span>
            <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                {formatRupiah(target.target_jumlah)}
            </span>
        </div>

        {/* Baris Terkumpul (Lebih Besar/Utama) */}
        <div className="d-flex flex-column mt-3">
            <span className="text-muted small fw-bold mb-1">Terkumpul</span>
            <h3 className="fw-bold text-success mb-0" style={{ letterSpacing: '-0.5px' }}>
                {formatRupiah(target.jumlah_terkumpul)}
            </h3>
        </div>
    </div>

                <ProgressBar 
                    now={progress} 
                    variant={isAchieved ? 'success' : 'primary'} 
                    className="mb-2 shadow-sm" 
                    style={{ height: '12px', borderRadius: '10px' }} 
                    animated={!isAchieved && progress > 0}
                />
                
                <div className="d-flex justify-content-between align-items-center">
                    <span className={`fw-bold ${isAchieved ? 'text-success' : 'text-primary'}`}>
                        {progress.toFixed(0)}%
                    </span>
                    <span className="text-muted small">
                        {isAchieved ? 'Hebat! Target tercapai' : `Sisa ${formatRupiah(target.target_jumlah - target.jumlah_terkumpul)} lagi`}
                    </span>
                </div>
            </Card.Body>

            <Card.Footer className="bg-transparent border-0 p-4 pt-0">
                <Button 
                    variant={isAchieved ? "outline-success" : "primary"} 
                    className="w-100 py-2 fw-bold"
                    disabled={isAchieved}
                    onClick={() => onContribute(target)}
                    style={{ borderRadius: '15px' }}
                >
                    {isAchieved ? 'Target Terpenuhi' : 'Tambah Tabungan'}
                </Button>
            </Card.Footer>
        </Card>
    );
};

// --- HALAMAN UTAMA (FINAL UI SINKRONISASI) ---
const TargetMenabungPage = () => {
    const [targets, setTargets] = useState<TargetTypes.TargetMenabung[]>([]);
    const [summary, setSummary] = useState<ReportTypes.MonthlySummary | null>(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showSaldo, setShowSaldo] = useState(true); 
    
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<TargetTypes.TargetMenabung | null>(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    
    const loadTargets = useCallback(async () => {
        setLoading(true);
        try {
            const [targetData, summaryData] = await Promise.all([
                fetchActiveTargets(),
                fetchMonthlySummary()
            ]);
            setTargets(targetData);
            setSummary(summaryData);
            setError(null);
        } catch (err: any) {
            setError("Gagal memuat data target menabung.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTargets();
    }, [loadTargets]);
    
    const handleOpenContribute = (target: TargetTypes.TargetMenabung) => {
        setSelectedTarget(target);
        setShowContributeModal(true);
    };

    const totalSaldo = summary?.saldoAkhir || 0;

    return (
        <MainLayout 
            onTransactionAdded={loadTargets} 
            openTransactionModal={() => setShowTransactionModal(true)}
        >
            {/* Header Halaman Sesuai Dashboard */}
            <h2 className="mb-4 d-flex align-items-center text-primary fw-bold" style={{ fontSize: '35px' }}>
                <img 
                    src={IconTargetBiru} 
                    alt="Ikon Target" 
                    className="me-2" 
                    style={{ width: '32px', height: '32px', display: 'block', marginTop: '-1px' }} 
                /> 
                <span style={{ display: 'inline-block', lineHeight: '1.2' }}>
                    Target Menabung
                </span>
            </h2>
            
            {loading ? (
                <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
            ) : error ? (
                <Alert variant="danger" style={{ borderRadius: '15px' }}>{error}</Alert>
            ) : (
                <>
                    {/* Ringkasan Saldo Sesuai Dashboard */}
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
                                <p className="text-dark small mb-0 mt-2 fw-bold">Saldo tersedia untuk dialokasikan ke target.</p>

                            </Card>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Card 
                                className="shadow-sm border-0 h-100 p-4 text-white" 
                                style={{ 
                                    borderRadius: '20px',
                                    background: '#198754 0%' // Gradien Hijau
                                }}
                            >
                                <h5 className="fw-bold opacity-85">Saran Menabung (20%)</h5>
                                <h3 className="fw-bold mb-1">
                                    {showSaldo ? formatRupiah(totalSaldo * 0.2) : "Rp ••••••"}
                                </h3>
                                <p className="small mb-0 opacity-85">Bagus! Alokasi untuk masa depan Anda.</p>
                            </Card>
                        </Col>
                    </Row>

                    {/* Tombol Utama Sesuai Dashboard (Full Width) */}
                    <div className="d-grid mb-5">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="py-3 fw-bold shadow"
                            onClick={() => setShowModal(true)} 
                            style={{ borderRadius: '30px', border: 'none', fontSize: '20px' }}
                        >
                            Buat Target Baru
                        </Button>
                    </div>
                    
{/* Judul Daftar Target dengan Line Selebar Tombol */}
<div className="text-center my-5 px-1">
    <h2 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.5px' }}>
        Daftar Target
    </h2>
    <p className="text-muted small mb-4">Kelola dan pantau kemajuan tabungan Anda</p>
    
    {/* Garis Dekoratif yang Panjangnya Mengikuti Kontainer (Simetris dengan Tombol) */}
    <div 
        className="mx-auto"
        style={{ 
            width: '100%',            // Menyamakan lebar dengan d-grid button
            height: '2px',            // Tipis agar elegan
            background: 'linear-gradient(to right, rgba(13, 110, 253, 0), rgba(13, 110, 253, 0.4), rgba(13, 110, 253, 0))', 
            borderRadius: '10px'
        }}
    ></div>
</div>

                    {targets.length === 0 ? (
                        /* Tampilan Jika TIDAK ADA DATA TARGET */
                        <Card 
                            className="shadow-sm border-0 p-5 text-center mt-2" 
                            style={{ borderRadius: '25px', overflow: 'hidden' }}
                        >
                            <img 
                                src={OnlyLogoBiru} 
                                alt="Logo SipDana" 
                                className="img-fluid mb-4 mx-auto"
                                style={{ maxWidth: '300px' }} // Sedikit diperkecil agar proporsional di halaman target
                            />
                            <h4 className="fw-bold text-secondary">Belum Ada Target Aktif</h4>
                            <p className="text-muted mb-4">
                                Miliki rencana masa depan yang lebih tertata.<br /> 
                                Ayo buat target menabung pertamamu sekarang!
                            </p>
                            <div className="d-flex justify-content-center">
                            </div>
                        </Card>
                    ) : (
                        /* Tampilan Jika ADA DATA TARGET */
                        <Row className="g-4">
                            {targets.map(target => (
                                <Col md={6} lg={4} key={target.id_target}>
                                    <TargetItem target={target} onContribute={handleOpenContribute} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}

            <TargetModal show={showModal} handleClose={() => setShowModal(false)} onSuccess={loadTargets} />
            <ContributeModal show={showContributeModal} handleClose={() => setShowContributeModal(false)} target={selectedTarget} onSuccess={loadTargets} />
            <TransactionModal show={showTransactionModal} handleClose={() => setShowTransactionModal(false)} onSuccess={loadTargets} />
        </MainLayout>
    );
};

export default TargetMenabungPage;