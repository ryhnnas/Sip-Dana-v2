import React, { ReactNode } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import TransactionHistory from './TransactionHistory';

interface MainLayoutProps {
    children: ReactNode;
    // Props baru untuk interaksi modal transaksi
    onTransactionAdded?: () => void;
    openTransactionModal?: () => void;
    hideAddButton?: boolean; // TAMBAH PROP INI
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
    children, 
    onTransactionAdded, 
    openTransactionModal,
    hideAddButton = false // DEFAULT false agar button muncul di halaman lain
}) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            
            {/* Kolom Kiri: Sidebar (Fixed Width) */}
            <div style={{ width: '280px', minWidth: '280px', borderRight: '1px solid #e0e0e0', zIndex: 10 }}>
                <Sidebar />
            </div>

            {/* Kolom Tengah & Kanan (Konten & Riwayat) */}
            <div style={{ flexGrow: 1, display: 'flex' }}>
                
                {/* Kolom Tengah: Content (Beranda/Analisis) */}
                <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
                    {children}
                </div>

                {/* Kolom Kanan: Riwayat Transaksi (Fixed Width) */}
                <div style={{ width: '350px', minWidth: '350px', borderLeft: '1px solid #e0e0e0', backgroundColor: '#eef7ff' }}>
                    <TransactionHistory 
                        onTransactionAdded={onTransactionAdded!}
                        openTransactionModal={openTransactionModal!}
                        hideAddButton={hideAddButton} // TERUSKAN PROP INI
                    />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;