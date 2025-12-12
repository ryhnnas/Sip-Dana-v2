import React from 'react';
import { Nav, Button } from 'react-bootstrap'; 
import { Link, useLocation } from 'react-router-dom';
import { WalletFill, Speedometer, PieChartFill, Bullseye, GearFill, BoxArrowRight } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
// Logo
import LogoPutih from '../assets/Logo Putih.svg';

// Beranda
import HomeWhite from '../assets/IconBeranda.svg';
import HomeBlue from '../assets/IconBerandaBiru.svg'; 

// Analisis Keuangan
import AnalysisWhite from '../assets/IconAnalisis.svg';
import AnalysisBlue from '../assets/IconAnalisisBiru.svg';

// Target Menabung
import TargetWhite from '../assets/IconTarget.svg';
import TargetBlue from '../assets/IconTargetBiru.svg';

// Pengaturan
import SettingsWhite from '../assets/IconPengaturan.svg';
import SettingsBlue from '../assets/IconPengaturanBiru.svg';

const Sidebar = () => {
  const location = useLocation();
  
  // Array untuk menu navigasi
  const navItems = [
    { 
      to: "/dashboard", 
      icon: { active: HomeBlue, inactive: HomeWhite },
      label: "Beranda" 
    },
    { 
      to: "/analisis", 
      icon: { active: AnalysisBlue, inactive: AnalysisWhite },
      label: "Analisis Keuangan" 
    },
    { 
      to: "/target", 
      icon: { active: TargetBlue, inactive: TargetWhite },
      label: "Target Menabung" 
    },
  ];

  // Item Pengaturan
  const settingsItem = { 
    to: "/settings", 
    icon: { active: SettingsBlue, inactive: SettingsWhite }, 
    label: "Pengaturan" 
  };
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      style={{ 
        height: '100vh', 
        backgroundColor: '#007bff', 
        position: 'relative',
        padding: '20px 0 20px 0', 
      }}
      className="d-flex flex-column" 
    >
      
      {/* Logo Kustom */}
      <div className="d-flex align-items-center justify-content-center mb-5 mt-3">
        <img 
          src={LogoPutih} 
          alt="SipDana Logo" 
          style={{ width: '250px' }} 
          className="px-4" 
        />
      </div>
      
      {/* Menu Navigasi Utama */}
      <Nav className="flex-column flex-grow-1" style={{ padding: '0 20px' }}>
        {navItems.map(item => (
          <Nav.Link 
            as={Link} 
            to={item.to} 
            key={item.to}
            className={`d-flex align-items-center mb-2 p-3 rounded text-white ${isActive(item.to) ? 'bg-white fw-bold' : 'text-white'}`}
            style={{ 
                backgroundColor: isActive(item.to) ? 'white' : 'transparent',
                transition: '0.3s',
            }}
          >
           <img 
                // Pilih ikon Biru jika Aktif, atau ikon Putih jika Tidak Aktif
                src={isActive(item.to) ? item.icon.active : item.icon.inactive} 
                alt={`${item.label} Icon`} 
                className="me-3" 
                style={{ width: '20px', height: '20px', filter: 'none' }}
            />
            <span className={isActive(item.to) ? 'text-primary' : 'text-white'}>
                {item.label}
            </span>
          </Nav.Link>
        ))}
      </Nav>
      <div 
        style={{ padding: '0 20px' }}
        className="mt-auto mb-3"
      >
        {/* Item Pengaturan */}
        <Nav.Link 
            as={Link} 
            to={settingsItem.to} 
            key={settingsItem.to}
            className={`d-flex align-items-center mb-2 p-3 rounded text-white ${isActive(settingsItem.to) ? 'bg-white fw-bold' : 'text-white'}`}
            style={{ 
                backgroundColor: isActive(settingsItem.to) ? 'white' : 'transparent',
                transition: '0.3s',
            }}
          >
            {/* Ikon Pengaturan Kustom */}
            <img 
                src={isActive(settingsItem.to) ? settingsItem.icon.active : settingsItem.icon.inactive} 
                alt={`${settingsItem.label} Icon`} 
                className="me-3" 
                style={{ width: '20px', height: '20px', filter: 'none' }}
            />
            <span className={isActive(settingsItem.to) ? 'text-primary' : 'text-white'}>
                {settingsItem.label}
            </span>
          </Nav.Link>
      </div>
      
    </div>
  );
};

export default Sidebar;