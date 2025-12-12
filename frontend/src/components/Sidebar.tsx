import React from 'react';
import { Nav, Button } from 'react-bootstrap'; 
import { Link, useLocation } from 'react-router-dom';
import { WalletFill, Speedometer, PieChartFill, Bullseye, GearFill, BoxArrowRight } from 'react-bootstrap-icons'; // <-- Import BoxArrowRight di sini
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { handleLogout } = useAuth();
  
  // Array untuk menu navigasi
  const navItems = [
    { to: "/dashboard", icon: Speedometer, label: "Beranda" },
    { to: "/analisis", icon: PieChartFill, label: "Analisis Keuangan" },
    { to: "/target", icon: Bullseye, label: "Target Menabung" },
    { to: "/settings", icon: GearFill, label: "Pengaturan" },
  ];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ height: '100%', padding: '20px', backgroundColor: 'white', position: 'relative' }}>
      
      {/* Logo dan Judul */}
      <div className="d-flex align-items-center mb-4">
        <WalletFill size={30} className="me-2 text-primary" />
        <h3 className="mb-0 text-primary fw-bold">SipDana</h3>
      </div>
      
      {/* Menu Navigasi */}
      <Nav className="flex-column mt-4">
        {navItems.map(item => (
          <Nav.Link 
            as={Link} 
            to={item.to} 
            key={item.to}
            className={`d-flex align-items-center mb-2 p-3 rounded ${isActive(item.to) ? 'bg-primary text-white fw-bold' : 'text-secondary'}`}
            style={{ 
                color: isActive(item.to) ? 'white' : '#6c757d',
                backgroundColor: isActive(item.to) ? '#007bff' : 'transparent',
                transition: '0.3s'
            }}
          >
            <item.icon size={20} className="me-3" />
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
      
      {/* Tombol Logout (Di pojok bawah sidebar) */}
      <div style={{ position: 'absolute', bottom: '20px', width: 'calc(100% - 40px)' }}>
         <Button 
            variant="outline-danger" 
            className="w-100 d-flex align-items-center justify-content-center"
            onClick={handleLogout}
        >
            <BoxArrowRight size={20} className="me-2" /> Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;