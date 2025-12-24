import React, { ReactNode } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import TransactionHistory from './TransactionHistory';

interface MainLayoutProps {
    children: ReactNode;
    onTransactionAdded?: () => void;
    openTransactionModal?: () => void;
    hideAddButton?: boolean; 
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
    children, 
    onTransactionAdded, 
    openTransactionModal,
    hideAddButton = false 
}) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            
            <div style={{ width: '280px', minWidth: '280px', borderRight: '1px solid #e0e0e0', zIndex: 10 }}>
                <Sidebar />
            </div>

            <div style={{ flexGrow: 1, display: 'flex' }}>
                
                <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
                    {children}
                </div>

                <div style={{ width: '350px', minWidth: '350px', borderLeft: '1px solid #e0e0e0', backgroundColor: '#eef7ff' }}>
                    <TransactionHistory 
                        onTransactionAdded={onTransactionAdded!}
                        openTransactionModal={openTransactionModal!}
                        hideAddButton={hideAddButton} 
                    />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;