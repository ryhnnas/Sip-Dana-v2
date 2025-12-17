import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import * as AuthTypes from '../types/auth.types'; 
import { registerUser } from '../services/auth.service';
import SipDanaLogo from '../assets/logo.png'; 
import { ArrowLeft, Envelope, Lock, Person, CheckCircleFill, XCircleFill } from 'react-bootstrap-icons'; 

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<AuthTypes.RegisterFormInput>({
    username: '',
    email: '',
    password: '',
  });

  // State untuk kriteria password
  const [checks, setChecks] = useState({
    length: false,
    capital: false,
    number: false
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [validated, setValidated] = useState(false);

  // Efek untuk memvalidasi password secara real-time
  useEffect(() => {
    setChecks({
      length: formData.password.length >= 8,
      capital: /[A-Z]/.test(formData.password),
      number: /\d/.test(formData.password)
    });
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // 1. Validasi Dasar Bootstrap
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // 2. Validasi Khusus Email @gmail.com
    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      setError('Email wajib menggunakan domain @gmail.com');
      return;
    }

    // 3. Validasi Keamanan Password
    if (!(checks.length && checks.capital && checks.number)) {
      setError('Password belum memenuhi syarat keamanan.');
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      // Kirim ke API
      await registerUser(formData);
      
      alert('Registrasi Berhasil! Silakan login menggunakan akun yang telah Anda buat.');
      
      // Arahkan ke halaman login
      navigate('/login');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal registrasi. Coba lagi.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ isPassed, text }: { isPassed: boolean, text: string }) => (
    <div className={`d-flex align-items-center mb-1 ${isPassed ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.8rem' }}>
      {isPassed ? <CheckCircleFill className="me-2" /> : <XCircleFill className="me-2" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="d-flex align-items-center justify-content-center bg-gradient-full" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={11} sm={8} md={6} lg={4}>
            
            <div className="mb-4">
              <div 
                onClick={() => navigate('/')} 
                className="d-flex align-items-center justify-content-center bg-white shadow-sm rounded-circle back-button-wrapper"
                style={{ 
                  width: '45px', 
                  height: '45px', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <ArrowLeft size={24} color="#0d6efd" />
              </div>
            </div>

            <div className="text-center mb-4">
              <img src={SipDanaLogo} alt="SipDana Logo" style={{ height: '60px' }} className="mb-2" />
            </div>

            <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4">
                <h3 className="text-center mb-4 fw-bold">Register</h3>

                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold small">Nama</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        placeholder="Masukkan Nama"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                      <span className="input-group-text"><Person size={18} /></span>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold small">Email</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="email"
                        placeholder="contoh@gmail.com"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <span className="input-group-text"><Envelope size={18} /></span>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="fw-bold small">Password</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="password"
                        placeholder="Masukkan password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <span className="input-group-text"><Lock size={18} /></span>
                    </div>
                  </Form.Group>

                  {/* Checklist UI */}
                  <div className="mb-4 p-3 border rounded bg-light shadow-sm">
                    <ValidationItem isPassed={checks.length} text="Minimal 8 karakter" />
                    <ValidationItem isPassed={checks.capital} text="Minimal 1 Huruf Kapital" />
                    <ValidationItem isPassed={checks.number} text="Minimal 1 Angka" />
                  </div>

                  <div className="text-center mb-3 small">
                    <p>Sudah punya akun? <Link to="/login" className="fw-bold text-decoration-none">Masuk</Link></p>
                  </div>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading || !(checks.length && checks.capital && checks.number)} 
                      size="lg" 
                      style={{ borderRadius: '50px', fontSize: '1rem' }}
                    >
                      {loading ? 'Mendaftarkan...' : 'Register'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;