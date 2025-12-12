import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Tidak perlu Spinner karena ditangani di AuthProvider, tapi tetap rapi
// import { Spinner } from 'react-bootstrap'; 

const PrivateRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    // AuthProvider sudah menampilkan Spinner, kita bisa kembalikan null
    return null; 
  }

  // Jika sudah login, izinkan akses
  if (isLoggedIn) {
    return <Outlet />;
  }

  // Jika belum login, redirect ke Login
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;