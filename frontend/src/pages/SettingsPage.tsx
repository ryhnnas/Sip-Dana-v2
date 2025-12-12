import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { GearFill, PersonFill, EnvelopeFill, KeyFill, CheckCircleFill } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
// --- PERBAIKAN IMPORT TIPE DATA MENGGUNAKAN NAMESPACE ---
import * as AuthTypes from '../types/auth.types'; 
// --------------------------------------------------------
import { updateProfileService, updatePasswordService } from '../services/user.service';

const SettingsPage = () => {
    const { user, setUser } = useAuth();
    
    // State untuk Form Profil
    const [profileData, setProfileData] = useState<AuthTypes.ProfileUpdateInput>({ // <-- Menggunakan AuthTypes
        username: user?.username || '',
        email: user?.email || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    // State untuk Form Password
    const [passwordData, setPasswordData] = useState<AuthTypes.PasswordUpdateInput>({ // <-- Menggunakan AuthTypes
        currentPassword: '',
        newPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    // --- Handlers Profil ---
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
        setProfileMessage(null);
    };

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage(null);
        
        try {
            const { message } = await updateProfileService(profileData);
            
            // Update Context dan Local Storage jika berhasil
            if (user) {
                // Pastikan kita hanya update jika ada perubahan (logika sederhana)
                const updatedUser = { 
                    ...user, 
                    username: profileData.username || user.username, 
                    email: profileData.email || user.email
                };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            setProfileMessage({ type: 'success', text: message });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal update profil. Coba lagi.';
            setProfileMessage({ type: 'danger', text: msg });
        } finally {
            setProfileLoading(false);
        }
    };

    // --- Handlers Password ---
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        setPasswordMessage(null);
    };
    
    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage(null);

        if (passwordData.newPassword.length < 6) {
             setPasswordMessage({ type: 'danger', text: 'Password baru minimal 6 karakter.' });
             setPasswordLoading(false);
             return;
        }

        try {
            const { message } = await updatePasswordService(passwordData);
            
            setPasswordMessage({ type: 'success', text: message });
            // Reset fields
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal update password. Pastikan password lama benar.';
            setPasswordMessage({ type: 'danger', text: msg });
        } finally {
            setPasswordLoading(false);
        }
    };


    return (
        <MainLayout>
            
            <h2 className="mb-4 d-flex align-items-center text-primary">
                <GearFill size={28} className="me-2" /> Pengaturan Akun
            </h2>

            <Row>
                
                {/* 1. Form Pembaruan Profil */}
                <Col lg={6} className="mb-4">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h4 className="mb-4 text-primary d-flex align-items-center"><PersonFill className="me-2" /> Detail Profil</h4>
                            
                            {profileMessage && <Alert variant={profileMessage.type} className="d-flex align-items-center"><CheckCircleFill className="me-2" />{profileMessage.text}</Alert>}

                            <Form onSubmit={handleProfileSubmit}>
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Nama Pengguna</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={profileData.username}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={profileLoading}>
                                        {profileLoading ? 'Memperbarui...' : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 2. Form Perubahan Password */}
                <Col lg={6} className="mb-4">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h4 className="mb-4 text-primary d-flex align-items-center"><KeyFill className="me-2" /> Ubah Kata Sandi</h4>
                            
                            {passwordMessage && <Alert variant={passwordMessage.type} className="d-flex align-items-center"><CheckCircleFill className="me-2" />{passwordMessage.text}</Alert>}

                            <Form onSubmit={handlePasswordSubmit}>
                                <Form.Group className="mb-3" controlId="formCurrentPassword">
                                    <Form.Label>Kata Sandi Lama</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formNewPassword">
                                    <Form.Label>Kata Sandi Baru</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="danger" type="submit" disabled={passwordLoading}>
                                        {passwordLoading ? 'Mengubah...' : 'Ubah Kata Sandi'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </MainLayout>
    );
};

export default SettingsPage;