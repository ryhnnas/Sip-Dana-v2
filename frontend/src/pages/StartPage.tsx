import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'react-bootstrap-icons';

// Asset Imports
import LogoBiru from '../assets/Logo Biru.svg'; // Menggunakan LogoBiru sebagai ilustrasi utama

const StartPage = () => {
    // Style background Soft Blue Gradient
    const backgroundStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
        position: 'relative' as const,
        overflow: 'hidden'
    };

    return (
        <div style={backgroundStyle} className="p-4 p-md-5">
            
            <Container>
                <Row className="justify-content-center align-items-center">
                    
                    {/* Bagian Kiri: Teks & Action */}
                    <Col md={6} lg={5} className="text-center text-md-start order-2 order-md-1">
                        <div className="pe-lg-5">
                            <h5 className="text-primary fw-bold mb-3 text-uppercase" style={{ letterSpacing: '2px', fontSize: '14px' }}>
                                Smart Financial Manager
                            </h5>
                            <h1 className="display-3 fw-bold mb-3 text-dark" style={{ letterSpacing: '-2px', lineHeight: '1.1' }}>
                                Kelola Dana <br /> 
                                <span className="text-primary">Jadi Lebih Sip.</span>
                            </h1>
                            <p className="text-muted fs-5 mb-5" style={{ lineHeight: '1.6' }}>
                                Pantau pemasukan, atur pengeluaran, dan capai target menabung Anda dalam satu aplikasi yang cerdas dan mudah.
                            </p>
                            
                            {/* Tombol Navigasi */}
                            <div className="d-flex flex-column flex-md-row gap-3">
                                <Link to="/login" className="text-decoration-none">
                                    <Button 
                                        variant="primary" 
                                        className="px-5 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center" 
                                        style={{ borderRadius: '15px', minWidth: '180px' }}
                                    >
                                        Mulai Sekarang <ArrowRight className="ms-2" />
                                    </Button>
                                </Link>
                                <Link to="/register" className="text-decoration-none">
                                    <Button 
                                        variant="outline-primary" 
                                        className="px-5 py-3 fw-bold" 
                                        style={{ borderRadius: '15px', minWidth: '180px', borderWidth: '2px' }}
                                    >
                                        Daftar Akun
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Col>
                    
                    {/* Bagian Kanan: LogoBiru sebagai Ilustrasi Utama */}
                    <Col md={6} className="text-center order-1 order-md-2 mb-5 mb-md-0">
                    <div className="position-relative d-flex justify-content-center align-items-center">
                        {/* Dekorasi lingkaran di belakang logo juga diperbesar agar proporsional */}
                        <div 
                            style={{ 
                                position: 'absolute', 
                                top: '50%', 
                                left: '50%', 
                                transform: 'translate(-50%, -50%)',
                                width: '100%', // Diperbesar dari 70%
                                height: '100%', 
                                backgroundColor: '#0d6efd', 
                                borderRadius: '50%', 
                                filter: 'blur(100px)', // Blur ditambah agar lebih halus
                                opacity: '0.12', // Sedikit lebih tegas
                                zIndex: 0
                            }}
                        ></div>
                        
                        <img 
                            src={LogoBiru} 
                            alt="SipDana Logo Large" 
                            className="img-fluid position-relative animate__animated animate__zoomIn" 
                            style={{ 
                                maxWidth: '120%', // Diperbesar dari 80% ke 120% untuk menjorok keluar kolom sedikit agar megah
                                width: '500px',   // Menetapkan lebar dasar yang lebih besar
                                zIndex: 1,
                                filter: 'drop-shadow(0 30px 50px rgba(13, 110, 253, 0.2))' // Shadow diperkuat
                            }}
                        />
                    </div>
                </Col>
                </Row>
            </Container>

            {/* Footer */}
            <div style={{ position: 'absolute', bottom: '30px', left: '0', right: '0' }} className="text-center text-muted small">
                © 2025 SipDana. All Rights Reserved.
            </div>
        </div>
    );
};

export default StartPage;