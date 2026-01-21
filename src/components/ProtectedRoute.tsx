import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    // If no roles specified, allow all authenticated users
    if (!allowedRoles || allowedRoles.length === 0) {
        return <>{children}</>;
    }

    // Check user role
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) {
        return <Navigate to="/signin" replace />;
    }

    try {
        const userData = JSON.parse(userDataString);
        const userRole = userData.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                        <div className="mb-6">
                            <div className="mx-auto w-20 h-20 bg-linear-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-red-600" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h2>
                        <p className="text-gray-600 mb-4">
                            You don't have permission to access this page.
                        </p>
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-2">Your role:</p>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                                {userRole}
                            </span>
                            <p className="text-sm text-gray-500 mt-3 mb-2">Required role(s):</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {allowedRoles.map(role => (
                                    <span key={role} className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }

        return <>{children}</>;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return <Navigate to="/signin" replace />;
    }
};
