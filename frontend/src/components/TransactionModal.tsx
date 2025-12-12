import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { PlusCircle, InfoCircle, XCircle } from 'react-bootstrap-icons';
import { fetchCategories } from '../services/utility.service';
import { createTransaction } from '../services/transaction.service';
import type { TransactionInput, Category, TransactionType } from '../types/transaction.types'; 
import type { AxiosError } from 'axios'; 
import type { HTMLSelectElement, HTMLTextAreaElement } from 'react'; // Impor tipe React standar

// Tipe data untuk error response
interface BackendErrorResponse {
    message: string;
}

interface TransactionModalProps {
    show: boolean;
    handleClose: () => void;
    onSuccess: () => void;
}

// FIX: Ubah jumlah menjadi string untuk masking
const initialFormState: Omit<TransactionInput, 'jumlah'> & { jumlah: string } = {
    jenis: 'pengeluaran', 
    jumlah: '', // <-- Harus string untuk masking
    tanggal: new Date().toISOString().split('T')[0], 
    keterangan: '',
    id_kategori: 0,
};

// Fungsi helper untuk mendapatkan pesan error dari Axios
const getErrorMessage = (err: unknown): string => {
    const axiosError = err as AxiosError<BackendErrorResponse>;
    if (axiosError.response && axiosError.response.data && axiosError.response.data.message) {
         return axiosError.response.data.message;
    }
    return 'Terjadi kesalahan jaringan atau server.';
};

const TransactionModal: React.FC<TransactionModalProps> = ({ show, handleClose, onSuccess }) => {
    // FIX: State menggunakan tipe data baru yang menerima jumlah sebagai string
    const [formData, setFormData] = useState<Omit<TransactionInput, 'jumlah'> & { jumlah: string }>(initialFormState);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [catLoading, setCatLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    const loadCategories = useCallback(async () => {
        setCatLoading(true);
        try {
            const cats = await fetchCategories();
            setCategories(cats);
            
            if (cats.length > 0) {
                setFormData(prev => ({ ...prev, id_kategori: prev.id_kategori === 0 ? cats[0].id_kategori : prev.id_kategori }));
            }
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            setMessage({ type: 'danger', text: msg });
        } finally {
            setCatLoading(false);
        }
    }, []); 

    useEffect(() => {
        if (show) {
             loadCategories();
             // Reset form dan message setiap kali modal dibuka
             setFormData(initialFormState);
             setMessage(null);
        }
    }, [show, loadCategories]); 

    // FIX: Tipe data handleChange diperluas untuk mencakup select, input, dan textarea
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMessage(null);
        
        if (name === 'jumlah') {
            // Logika Masking Input Ribuan
            const cleanValue = value.replace(/\D/g, ''); 
            const numberValue = parseInt(cleanValue) || 0;
            // Menampilkan string berformat (e.g., 500.000)
            const maskedValue = numberValue.toLocaleString('id-ID'); 
            setFormData({ ...formData, [name]: maskedValue }); 
            
        } else if (name === 'id_kategori') {
            setFormData({ ...formData, [name]: parseFloat(value) || 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleTypeChange = (type: TransactionType) => {
        setFormData(prev => ({ ...prev, jenis: type }));
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // FIX: Konversi Jumlah Masked (string) ke number sebelum dikirim ke API
        const numericJumlah = parseFloat(formData.jumlah.replace(/\./g, '').replace(/,/g, ''));

        if (numericJumlah <= 0 || !formData.keterangan || formData.id_kategori === 0) {
            setMessage({ type: 'danger', text: 'Semua field wajib diisi dan Jumlah harus lebih dari 0.' });
            return;
        }

        setLoading(true);

        try {
            // Data yang dikirim ke API
            const dataToSend: TransactionInput = {
                ...formData,
                jumlah: numericJumlah, // <-- Kirim sebagai number
            };

            const { message } = await createTransaction(dataToSend);
            setMessage({ type: 'success', text: message });
            
            setTimeout(() => {
                handleClose(); 
                setFormData(initialFormState); 
                onSuccess();
            }, 1000);

        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            setMessage({ type: 'danger', text: msg });
        } finally {
            setLoading(false);
        }
    };
    
    // Fungsi untuk memfilter kategori
    const filteredCategories = categories.filter(cat => {
        const name = cat.nama_kategori.toLowerCase();
        const isIncomeCat = name.includes('gaji') || name.includes('bonus') || name.includes('investasi');
        
        if (formData.jenis === 'pemasukan') {
             return isIncomeCat;
        }
        return !isIncomeCat;
    });

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center text-primary">
                    <PlusCircle size={24} className="me-2" /> Tambah Transaksi Baru
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                
                {/* Tombol Pemilih Jenis Transaksi */}
                <div className="d-flex justify-content-center mb-4">
                    <Button 
                        variant={formData.jenis === 'pengeluaran' ? 'danger' : 'outline-secondary'}
                        onClick={() => handleTypeChange('pengeluaran')}
                        className="me-2 fw-bold"
                    >
                        Pengeluaran
                    </Button>
                    <Button 
                        variant={formData.jenis === 'pemasukan' ? 'success' : 'outline-secondary'}
                        onClick={() => handleTypeChange('pemasukan')}
                        className="fw-bold"
                    >
                        Pemasukan
                    </Button>
                </div>
                
                {message && (
                    <Alert variant={message.type === 'success' ? 'success' : 'danger'} className="d-flex align-items-center small">
                        {message.type === 'success' ? <InfoCircle size={18} className="me-2" /> : <XCircle size={18} className="me-2" />}
                        {message.text}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    
                    {/* Jumlah (Type TEXT dengan inputMode=numeric untuk masking) */}
                    <Form.Group className="mb-3" controlId="formJumlah">
                        <Form.Label className="fw-bold">Jumlah (Rp)</Form.Label>
                        <Form.Control
                            type="text" // <-- FIX: type="text"
                            name="jumlah"
                            placeholder="Contoh: 500.000"
                            value={formData.jumlah} // <-- Menampilkan string masked
                            onChange={handleChange}
                            required
                            inputMode="numeric" // <-- Membuka keyboard numerik di mobile
                        />
                    </Form.Group>

                    {/* Keterangan */}
                    <Form.Group className="mb-3" controlId="formKeterangan">
                        <Form.Label className="fw-bold">Keterangan/Deskripsi</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="keterangan"
                            placeholder="Contoh: Beli Makan Siang"
                            value={formData.keterangan}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* Tanggal */}
                    <Form.Group className="mb-3" controlId="formTanggal">
                        <Form.Label className="fw-bold">Tanggal</Form.Label>
                        <Form.Control
                            type="date"
                            name="tanggal"
                            value={formData.tanggal}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* Kategori */}
                    <Form.Group className="mb-4" controlId="formKategori">
                        <Form.Label className="fw-bold">Kategori</Form.Label>
                        <Form.Select 
                            name="id_kategori" 
                            value={formData.id_kategori} 
                            onChange={handleChange}
                            disabled={catLoading}
                            required
                        >
                            {catLoading ? (
                                <option>Memuat Kategori...</option>
                            ) : (
                                <>
                                    <option value={0} disabled>Pilih Kategori...</option>
                                    {filteredCategories.map(cat => (
                                        <option key={cat.id_kategori} value={cat.id_kategori}>
                                            {cat.nama_kategori}
                                        </option>
                                    ))}
                                </>
                            )}
                        </Form.Select>
                    </Form.Group>
                    
                    <div className="d-grid mt-4">
                        <Button variant="primary" type="submit" disabled={loading} className="fw-bold py-2">
                            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> : <PlusCircle size={18} className="me-2" />}
                            Catat Transaksi
                        </Button>
                    </div>

                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default TransactionModal;