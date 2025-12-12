import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// Gunakan ikon untuk placeholder logo jika gambar belum diimpor dengan benar
import { WalletFill } from 'react-bootstrap-icons'; 

// Ganti 'logo.png' dan 'startpage.jpg' dengan nama file Anda yang sebenarnya
import SipDanaLogo from '../assets/logo.png'; 
import StartPageImage from '../assets/startpage.jpg'; 

const StartPage = () => {
  // Style untuk background full-screen tanpa card/area putih
  const backgroundStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Gradasi biru muda (pastikan konsisten dengan desain)
    background: 'linear-gradient(to right, #e0f7fa 0%, #b2ebf2 100%)', 
    position: 'relative' // Diperlukan untuk logo yang diposisikan absolute
  };

  return (
    <div style={backgroundStyle} className="p-3 p-md-5">
      
      {/* 1. Logo di Kiri Atas (Posisi Absolute) */}
      <div style={{ position: 'absolute', top: '30px', left: '30px' }} className="d-flex align-items-center">
          <img src={SipDanaLogo} alt="SipDana Logo" style={{ height: '35px' }} className="me-2" />
          <h4 className="text-primary mb-0 fw-bold">SipDana</h4>
      </div>

      <Container fluid className="my-auto">
        <Row className="justify-content-center align-items-center">
          
          {/* Menggunakan Col yang lebih besar untuk membatasi lebar konten di tengah layar */}
          <Col md={12} lg={10} className="p-0">
            <Row className="align-items-center">
                
                {/* Bagian Kiri (Teks & Tombol) */}
                <Col md={6} className="text-left p-3 p-md-5 order-2 order-md-1">
                    
                    {/* Teks Welcome */}
                    <h1 className="display-4 fw-light mb-1" style={{ color: '#212529' }}>
                        Welcome to
                    </h1>
                    <h1 className="display-3 fw-bold mb-4" style={{ color: '#212529' }}>
                        SipDana
                    </h1>
                    
                    {/* Tombol Navigasi */}
                    <div className="d-grid gap-3 mt-5" style={{ maxWidth: '250px' }}>
                        <Link to="/login">
                            <Button variant="primary" size="lg" className="px-5 py-2 fw-bold" style={{ borderRadius: '50px' }}>
                                Masuk (Login)
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="outline-primary" size="lg" className="px-5 py-2 fw-bold" style={{ borderRadius: '50px' }}>
                                Daftar (Register)
                            </Button>
                        </Link>
                    </div>
                </Col>
                
                {/* Bagian Kanan (Ilustrasi) */}
                <Col md={6} className="text-center p-3 p-md-5 order-1 order-md-2">
                    <img 
                        src={StartPageImage} 
                        alt="Ilustrasi SipDana Pengelola Keuangan" 
                        className="img-fluid" 
                    />
                </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StartPage;