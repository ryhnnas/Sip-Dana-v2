import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, ProgressBar, Alert, Spinner, InputGroup } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { Bullseye, PlusCircle, CheckCircle, Clock, ArrowUpShort, CashStack } from 'react-bootstrap-icons';
import { fetchActiveTargets, createNewTarget, contributeToTarget } from '../services/target.service'; // Tambah contributeToTarget
import * as TargetTypes from '../types/target.types'; 
import { useAuth } from '../context/AuthContext'; 
import { fetchMonthlySummary } from '../services/report.service';
import type * as ReportTypes from '../types/report.types'; 
import TransactionModal from '../components/TransactionModal';

const formatRupiah = (amount: number) => {
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0
    }).format(Math.floor(amount));
    return formatted.replace('Rp', 'Rp ');
};

// --- KOMPONEN BARU: Modal Kontribusi ---
interface ContributeModalProps {
    show: boolean;
    handleClose: () => void;
    target: TargetTypes.TargetMenabung | null;
    onSuccess: () => void;
}

const ContributeModal: React.FC<ContributeModalProps> = ({ show, handleClose, target, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            alert(`Berhasil menabung ${formatRupiah(numericAmount)} untuk ${target?.nama_target}`);
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
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title className="fs-5 text-white">Tabung untuk {target?.nama_target}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    <div className="text-center mb-4">
                        <CashStack size={40} className="text-primary mb-2" />
                        <p className="small text-muted">Saldo utama Anda akan dipindahkan ke tabungan ini secara virtual.</p>
                    </div>
                    <Form.Group>
                        <Form.Label className="fw-bold">Jumlah Kontribusi</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>Rp</InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Contoh: 500.000"
                                value={amount}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setAmount(val ? parseInt(val).toLocaleString('id-ID') : '');
                                }}
                                required
                            />
                        </InputGroup>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Batal</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Memproses...' : 'Konfirmasi Nabung'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// --- Komponen Modal Tambah Target ---
interface TargetModalProps {
    show: boolean;
    handleClose: () => void;
    onSuccess: () => void;
}

type MaskedTargetInput = Omit<TargetTypes.TargetInput, 'target_jumlah'> & { target_jumlah: string };

const TargetModal: React.FC<TargetModalProps> = ({ show, handleClose, onSuccess }) => {
    const [formData, setFormData] = useState<MaskedTargetInput>({
        nama_target: '',
        target_jumlah: '',
        tanggal_target: new Date().toISOString().substring(0, 10),
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'target_jumlah') {
            const cleanValue = value.replace(/\D/g, ''); 
            const numberValue = parseInt(cleanValue) || 0;
            const maskedValue = numberValue.toLocaleString('id-ID'); 
            setFormData(prev => ({ ...prev, [name]: maskedValue })); 
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
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal membuat target.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Buat Target Menabung Baru</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Nama Target</Form.Label>
                        <Form.Control type="text" name="nama_target" value={formData.nama_target} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Target Jumlah (Rp)</Form.Label>
                        <Form.Control type="text" name="target_jumlah" value={formData.target_jumlah} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Target Tanggal Tercapai</Form.Label>
                        <Form.Control type="date" name="tanggal_target" value={formData.tanggal_target} onChange={handleChange} required />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Batal</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Buat Target'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// --- Komponen Item Target ---
const TargetItem: React.FC<{ target: TargetTypes.TargetMenabung, onContribute: (t: TargetTypes.TargetMenabung) => void }> = ({ target, onContribute }) => {
    const progress = Math.min(100, (target.jumlah_terkumpul / target.target_jumlah) * 100);
    const isAchieved = target.status === 'tercapai' || progress >= 100;
    
    return (
        <Card 
            className={`shadow-sm border-0 h-100 mb-3 transition-all ${isAchieved ? 'bg-light-success' : ''}`}
            style={{ 
                borderRadius: '15px', 
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
            }}
        >
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">
                        <Bullseye size={14} className="me-1" /> Target Simpanan
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
                
                <div className="mb-2 d-flex justify-content-between align-items-end">
                    <div>
                        <span className="text-muted small d-block">Terkumpul</span>
                        <span className="h4 fw-bold text-success mb-0">{formatRupiah(target.jumlah_terkumpul)}</span>
                    </div>
                    <div className="text-end">
                        <span className="text-muted small d-block">Goal</span>
                        <span className="fw-bold text-dark">{formatRupiah(target.target_jumlah)}</span>
                    </div>
                </div>

                <ProgressBar 
                    now={progress} 
                    variant={isAchieved ? 'success' : 'primary'} 
                    className="mb-2 shadow-sm" 
                    style={{ height: '10px', borderRadius: '5px' }} 
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
                    className="w-100 py-2 fw-bold shadow-sm"
                    disabled={isAchieved}
                    onClick={() => onContribute(target)}
                    style={{ borderRadius: '10px' }}
                >
                    {isAchieved ? 'Target Telah Terpenuhi' : 'Tambah Tabungan'}
                </Button>
            </Card.Footer>
        </Card>
    );
};

// --- Halaman Utama Target Menabung ---
const TargetMenabungPage = () => {
    const [targets, setTargets] = useState<TargetTypes.TargetMenabung[]>([]);
    const [summary, setSummary] = useState<ReportTypes.MonthlySummary | null>(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    // State Kontribusi
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
            setError("Gagal memuat target menabung.");
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
            <h2 className="mb-4 d-flex align-items-center text-primary">
                <Bullseye size={28} className="me-2" /> Target Menabung
            </h2>
            
            <div className="d-flex justify-content-end mb-4">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <PlusCircle size={20} className="me-2" /> Buat Target Baru
                </Button>
            </div>
            
            {loading ? (
                <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    <Row className="mb-5">
                        <Col md={6} className="mb-3">
                            <Card className="shadow-sm border-0 h-100 p-4">
                                <h5 className="text-muted">Total Saldo</h5>
                                <h3 className="fw-bold mb-1">{formatRupiah(totalSaldo)}</h3>
                                <p className="text-info small mb-0">Saldo utama yang tersedia untuk dialokasikan.</p>
                            </Card>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Card className="shadow-sm border-0 h-100 p-4 bg-primary text-white">
                                <h5 className="text-white-50">Saran Menabung (20%)</h5>
                                <h3 className="fw-bold mb-1 text-white">{formatRupiah(totalSaldo * 0.2)}</h3>
                                <p className="small mb-0 text-white-50">Alokasi ideal berdasarkan saldo Anda saat ini.</p>
                            </Card>
                        </Col>
                    </Row>
                    
                    <h4 className="mb-3 fw-bold">Daftar Target Aktif</h4>
                    {targets.length === 0 ? (
                        <Card className="text-center p-5 shadow-sm border-0"><p>Belum ada target aktif.</p></Card>
                    ) : (
                        <Row>
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
            
            <ContributeModal 
                show={showContributeModal} 
                handleClose={() => setShowContributeModal(false)} 
                target={selectedTarget} 
                onSuccess={loadTargets} 
            />

            <TransactionModal show={showTransactionModal} handleClose={() => setShowTransactionModal(false)} onSuccess={loadTargets} />
        </MainLayout>
    );
};

export default TargetMenabungPage;