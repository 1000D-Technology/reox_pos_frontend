import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface PublicRouteProps {
    children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
    if (authService.isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
