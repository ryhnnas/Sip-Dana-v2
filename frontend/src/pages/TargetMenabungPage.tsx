import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { Bullseye, PlusCircle, CheckCircle, Clock, ArrowUpShort } from 'react-bootstrap-icons';
import { fetchActiveTargets, createNewTarget } from '../services/target.service';
import * as TargetTypes from '../types/target.types'; 
import { useAuth } from '../context/AuthContext'; 
import { fetchMonthlySummary } from '../services/report.service';
import type * as ReportTypes from '../types/report.types'; 
import TransactionModal from '../components/TransactionModal'; // TAMBAH INI

const formatRupiah = (amount: number) => {
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0
    }).format(Math.floor(amount));
    
    return formatted.replace('Rp', 'Rp ');
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
            const dataToSend: TargetTypes.TargetInput = {
                ...formData,
                target_jumlah: numericTarget,
            };

            await createNewTarget(dataToSend);
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal membuat target.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleModalClose = () => {
        setFormData({ nama_target: '', target_jumlah: '', tanggal_target: new Date().toISOString().substring(0, 10) });
        setError(null);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleModalClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Buat Target Menabung Baru</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Nama Target</Form.Label>
                        <Form.Control
                            type="text"
                            name="nama_target"
                            value={formData.nama_target}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formTargetJumlah">
                        <Form.Label>Target Jumlah (Rp)</Form.Label>
                        <Form.Control
                            type="text"
                            name="target_jumlah"
                            value={formData.target_jumlah}
                            onChange={handleChange}
                            required
                            inputMode="numeric"
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Target Tanggal Tercapai</Form.Label>
                        <Form.Control
                            type="date"
                            name="tanggal_target"
                            value={formData.tanggal_target}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Buat Target'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};


// --- Komponen Item Target ---
const TargetItem: React.FC<{ target: TargetTypes.TargetMenabung }> = ({ target }) => {
    const progress = Math.min(100, (target.jumlah_terkumpul / target.target_jumlah) * 100);
    const isAchieved = target.status === 'tercapai' || progress >= 100;
    
    return (
        <Card className="shadow-sm border-0 h-100 mb-3" border={isAchieved ? 'success' : undefined}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 className="fw-bold mb-1 text-primary">{target.nama_target}</h6>
                        <p className="text-muted small mb-1 d-flex align-items-center">
                            <Clock size={14} className="me-1" />
                            Target: {new Date(target.tanggal_target).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    {isAchieved && <CheckCircle size={28} className="text-success" />}
                </div>
                
                <p className="mt-3 mb-1 small">
                    Terkumpul: <span className="text-success fw-bold">{formatRupiah(target.jumlah_terkumpul)}</span>
                </p>
                <p className="fw-bold mb-2">
                    Target: {formatRupiah(target.target_jumlah)}
                </p>

                <ProgressBar 
                    now={progress} 
                    variant={isAchieved ? 'success' : 'info'} 
                    className="mb-2" 
                />
                <small className="text-muted">{progress.toFixed(1)}% Tercapai</small>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-end">
                <Button variant="outline-primary" size="sm" disabled={isAchieved}>
                    Detail & Kontribusi
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
    
    // TAMBAH STATE UNTUK TRANSACTION MODAL
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
            console.error("Gagal memuat target:", err);
            setError("Gagal memuat target menabung.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTargets();
    }, [loadTargets]);
    
    const handleTargetCreated = () => {
        setShowModal(false);
        loadTargets(); 
    };
    
    // TAMBAH HANDLER UNTUK TRANSACTION MODAL
    const handleTransactionSuccess = () => {
        setShowTransactionModal(false);
        loadTargets(); // Reload data setelah tambah transaksi
    };
    
    const totalSaldo = summary?.saldoAkhir || 0;
    const uangBisaDitabung = totalSaldo * 0.2; 

    return (
        <MainLayout 
            onTransactionAdded={handleTransactionSuccess} 
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
                <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Memuat target menabung...</p>
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    <Row className="mb-5">
                        <Col md={6} className="mb-3">
                            <Card className="shadow-sm border-0 h-100 p-4">
                                <h5 className="text-muted">Total Saldo</h5>
                                <h3 className="fw-bold mb-1">{formatRupiah(totalSaldo)}</h3>
                                <p className="text-success small d-flex align-items-center mb-0">
                                    <ArrowUpShort size={20} /> +5.89% dari Minggu Lalu
                                </p>
                            </Card>
                        </Col>

                        <Col md={6} className="mb-3">
                            <Card className="shadow-sm border-0 h-100 p-4">
                                <h5 className="text-muted">Uang yang Disarankan Ditabung</h5>
                                <h3 className="fw-bold text-primary mb-1">{formatRupiah(uangBisaDitabung)}</h3>
                                <p className="text-success small d-flex align-items-center mb-0">
                                    <ArrowUpShort size={20} /> Estimasi: 20% dari saldo Anda
                                </p>
                            </Card>
                        </Col>
                    </Row>
                    
                    <h4 className="mb-3">Daftar Target Aktif ({targets.length})</h4>
                    
                    {targets.length === 0 ? (
                        <Card className="text-center p-5 shadow-sm border-0">
                            <h5 className="text-secondary">Belum ada Target Aktif</h5>
                            <p className="text-muted">Klik "Buat Target Baru" di atas!</p>
                        </Card>
                    ) : (
                        <Row>
                            {targets.map(target => (
                                <Col md={6} lg={4} key={target.id_target}>
                                    <TargetItem target={target} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}

            {/* Modal Target */}
            <TargetModal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                onSuccess={handleTargetCreated}
            />

            {/* TAMBAH TRANSACTION MODAL */}
            <TransactionModal 
                show={showTransactionModal} 
                handleClose={() => setShowTransactionModal(false)} 
                onSuccess={handleTransactionSuccess} 
            />

        </MainLayout>
    );
};

export default TargetMenabungPage;