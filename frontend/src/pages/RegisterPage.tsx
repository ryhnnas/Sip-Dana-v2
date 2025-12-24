import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Envelope, Lock, Person, CheckCircleFill, XCircleFill, EyeFill, EyeSlashFill, ArrowLeft } from 'react-bootstrap-icons';

import LogoBiru from '../assets/Logo Biru.svg';
import { registerUser } from '../services/auth.service';

const RegisterPage = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [checks, setChecks] = useState({ length: false, capital: false, number: false });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);

    const inputStyle = {
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
    };

    useEffect(() => {
        setChecks({
            length: formData.password.length >= 8,
            capital: /[A-Z]/.test(formData.password),
            number: /\d/.test(formData.password)
        });
    }, [formData.password]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
            setError('Email wajib menggunakan domain @gmail.com');
            return;
        }

        if (!(checks.length && checks.capital && checks.number)) {
            setError('Password belum memenuhi syarat keamanan.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const response = await registerUser(formData);

            alert('Registrasi Berhasil! Silakan login.');
            navigate('/login');
            
        } catch (err) {
            const errorBody = err as any;
            setError(errorBody.response?.data?.message || 'Gagal registrasi. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const ValidationItem = ({ isPassed, text }) => (
        <div className={`d-flex align-items-center mb-1 ${isPassed ? 'text-success' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
            {isPassed ? <CheckCircleFill className="me-2" /> : <XCircleFill className="me-2" style={{ opacity: 0.3 }} />}
            <span>{text}</span>
        </div>
    );

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
            overflow: 'hidden',
            position: 'relative'
        }} className="d-flex align-items-stretch">

            <div 
                onClick={() => navigate('/')}
                className="position-absolute shadow-sm d-flex align-items-center justify-content-center bg-white rounded-circle"
                style={{ 
                    top: '30px', 
                    left: '30px', 
                    width: '45px', 
                    height: '45px', 
                    cursor: 'pointer', 
                    zIndex: 1000, 
                    border: '1px solid #eee',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <ArrowLeft size={20} className="text-primary" />
            </div>

            <Row className="w-100 m-0">
                <Col md={6} lg={7} className="d-none d-md-flex flex-column justify-content-center align-items-start position-relative p-5" 
                    style={{ 
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                        position: 'relative'
                    }}>
                    
                    <div style={{
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        width: '300px',
                        height: '300px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        filter: 'blur(80px)'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '10%',
                        right: '10%',
                        width: '400px',
                        height: '400px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        filter: 'blur(100px)'
                    }}></div>

                    <div className="d-flex flex-column justify-content-center" style={{ zIndex: 2, paddingLeft: '60px' }}>
                        <h1 className="text-white fw-bold mb-3" style={{ fontSize: '3rem' }}>Selamat Datang!</h1>
                        <h5 className="text-white opacity-75 fw-light mb-5">
                            Kelola Dana Jadi Lebih Sip bersama SipDana
                        </h5>
                    </div>
                </Col>

                <Col md={6} lg={5} className="d-flex flex-column justify-content-center align-items-center p-4 bg-white position-relative">

                    <div className="text-center mb-4">
                        <img 
                            src={LogoBiru} 
                            alt="SipDana Logo" 
                            style={{ 
                                height: '80px',
                                filter: 'drop-shadow(0 10px 20px rgba(13, 110, 253, 0.2))'
                            }} 
                        />
                    </div>

                    <Card className="border-0 shadow-lg p-3 p-md-4" style={{ borderRadius: '25px', width: '100%', maxWidth: '450px' }}>
                        <Card.Body>
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-dark mb-1">Daftar Akun</h2>
                                <p className="text-muted small">Buat akun untuk mulai mengelola keuangan</p>
                            </div>

                            {error && (
                                <Alert variant="danger" className="border-0 rounded-4 py-2 small mb-4 fw-medium text-center">
                                    {error}
                                </Alert>
                            )}

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted mb-2">Nama Pengguna</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                                            <Person />
                                        </InputGroup.Text>
                                        <Form.Control 
                                            type="text" 
                                            name="username" 
                                            placeholder="Masukkan nama..." 
                                            value={formData.username} 
                                            onChange={handleChange} 
                                            style={{ ...inputStyle, borderLeft: 0, borderRadius: '0 10px 10px 0' }} 
                                            required 
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted mb-2">Email</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                                            <Envelope />
                                        </InputGroup.Text>
                                        <Form.Control 
                                            type="email" 
                                            name="email" 
                                            placeholder="Masukkan email..." 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            style={{ ...inputStyle, borderLeft: 0, borderRadius: '0 10px 10px 0' }} 
                                            required 
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label className="small fw-bold text-muted mb-2">Kata Sandi</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                                            <Lock />
                                        </InputGroup.Text>
                                        <Form.Control 
                                            type={showPassword ? "text" : "password"} 
                                            name="password" 
                                            placeholder="Masukkan kata sandi..." 
                                            value={formData.password} 
                                            onChange={handleChange} 
                                            style={{ ...inputStyle, borderLeft: 0, borderRight: 0, borderRadius: 0 }} 
                                            required 
                                        />
                                        <InputGroup.Text 
                                            className="bg-white border-start-0 text-muted" 
                                            style={{ cursor: 'pointer', borderRadius: '0 10px 10px 0' }} 
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeSlashFill size={18} /> : <EyeFill size={18} />}
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>

                                <div className="mb-4 p-3 bg-light rounded-4 border-0 mt-3">
                                    <ValidationItem isPassed={checks.length} text="Minimal 8 karakter" />
                                    <ValidationItem isPassed={checks.capital} text="Minimal 1 Huruf Kapital" />
                                    <ValidationItem isPassed={checks.number} text="Minimal 1 Angka" />
                                </div>

                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    className="w-100 py-3 fw-bold shadow-sm mb-3" 
                                    style={{ 
                                        borderRadius: '15px',
                                        fontSize: '1rem'
                                    }} 
                                    disabled={loading || !(checks.length && checks.capital && checks.number)}
                                >
                                    {loading ? 'Sedang Memproses...' : 'Daftar Sekarang'}
                                </Button>

                                <div className="text-center small">
                                    <span className="text-muted">Sudah punya akun? </span>
                                    <Link to="/login" className="fw-bold text-decoration-none text-primary">Masuk</Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    <div className="text-center text-muted small mt-4">
                        © 2025 SipDana. All Rights Reserved.
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default RegisterPage;