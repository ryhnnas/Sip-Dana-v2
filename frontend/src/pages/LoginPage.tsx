import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import * as AuthTypes from '../types/auth.types'; 
import { loginUser } from '../services/auth.service';
import SipDanaLogo from '../assets/logo.png'; 
import { ArrowLeft, Envelope, Lock } from 'react-bootstrap-icons'; 
import { useAuth } from '../context/AuthContext'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [formData, setFormData] = useState<AuthTypes.LoginFormInput>({
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
      const response = await loginUser(formData);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user); // <-- UPDATE CONTEXT
      
      alert(`Selamat datang, ${response.user.username}!`);
      navigate('/dashboard');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal login. Periksa email dan password Anda.';
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

            <div className="text-center mb-5">
              <img src={SipDanaLogo} alt="SipDana Logo" style={{ height: '60px' }} className="mb-2" />
            </div>

            <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4 p-md-5">
                <h3 className="text-center mb-4">Login</h3>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  {/* Field Email */}
                  <Form.Group className="mb-4" controlId="formBasicEmail">
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
                  <Form.Group className="mb-5" controlId="formBasicPassword">
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

                  {/* Tombol Login */}
                  <div className="d-grid mt-4">
                    <Button variant="primary" type="submit" size="lg" disabled={loading} style={{ borderRadius: '50px' }}>
                      {loading ? 'Memuat...' : 'Login'}
                    </Button>
                  </div>

                  {/* Link Daftar */}
                  <div className="text-center mt-3">
                    <p>Belum punya akun? <Link to="/register">Daftar</Link></p>
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

export default LoginPage;