import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import * as AuthTypes from '../types/auth.types'; 
import { registerUser } from '../services/auth.service';
import SipDanaLogo from '../assets/logo.png'; 
import { ArrowLeft, Envelope, Lock, Person } from 'react-bootstrap-icons'; 
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [formData, setFormData] = useState<AuthTypes.RegisterFormInput>({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [validated, setValidated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      const response = await registerUser(formData);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user); 
      
      alert('Registrasi Berhasil! Anda akan diarahkan ke Dashboard.');
      navigate('/dashboard');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal registrasi. Coba lagi.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center bg-gradient-full">
      
      <Container>
        <Row className="justify-content-center">
          <Col xs={11} sm={8} md={6} lg={4}>
            
            <div className="mb-4 d-flex align-items-center">
              <ArrowLeft size={30} onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'white' }} />
            </div>

            <div className="text-center mb-5">
              <img src={SipDanaLogo} alt="SipDana Logo" style={{ height: '40px' }} className="mb-2" />
              <h4 className="text-white">SipDana</h4>
            </div>

            <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4 p-md-5">
                <h3 className="text-center mb-4">Register</h3>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  {/* Field Nama/Username */}
                  <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label className="fw-bold">Nama</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        placeholder="Masukkan Nama"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                      <span className="input-group-text"><Person size={20} /></span>
                      <Form.Control.Feedback type="invalid">Nama harus diisi.</Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  {/* Field Email */}
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="email"
                        placeholder="Masukkan Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                      <span className="input-group-text"><Envelope size={20} /></span>
                      <Form.Control.Feedback type="invalid">Email harus diisi dan valid.</Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  {/* Field Password */}
                  <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label className="fw-bold">Password</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="password"
                        placeholder="Masukkan password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                      <span className="input-group-text"><Lock size={20} /></span>
                      <Form.Control.Feedback type="invalid">Password harus diisi.</Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  {/* Link Masuk */}
                  <div className="text-center mb-3">
                    <p>Sudah punya akun? <Link to="/login">Masuk</Link></p>
                  </div>
                  
                  {/* Tombol Register */}
                  <div className="d-grid">
                    <Button variant="primary" type="submit" disabled={loading} size="lg" style={{ borderRadius: '50px' }}>
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