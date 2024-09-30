import { Navigate } from 'react-router-dom';
import DotLoader from './DotLoader';

function RedirectToHome() {
  const isAuthenticated = sessionStorage.getItem('authenticated');
  if (isAuthenticated) {
    return <Navigate to="/Home" />;
  } else {
    return <DotLoader />;
  }
}

export default RedirectToHome;