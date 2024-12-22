import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('accessToken') !== null;
    
    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;