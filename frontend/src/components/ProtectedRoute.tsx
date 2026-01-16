import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <img 
          src="/favicon.svg" 
          alt="SKWISKWA NOTES" 
          style={{ width: '48px', height: '48px' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('favicon.svg')) {
              target.src = '/favicon.ico';
            } else if (target.src.includes('favicon.ico')) {
              target.src = '/icon-192.png';
            }
          }}
        />
        <p>Загрузка SKWISKWA NOTES...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
