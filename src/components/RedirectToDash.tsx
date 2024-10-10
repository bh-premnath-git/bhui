import { Navigate } from 'react-router-dom';

export default function RedirectToHome() {
    const isAuthenticated = sessionStorage.getItem('authenticated');
    //return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
    return <Navigate to="/dashboard" />;
}