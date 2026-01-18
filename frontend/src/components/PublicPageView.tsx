import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Page } from '../types';
import { api } from '../api';
import PageView from './PageView';

function PublicPageView() {
  const { token } = useParams<{ token: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadPublicPage(token);
    }
  }, [token]);

  const loadPublicPage = async (shareToken: string) => {
    try {
      const response = await api.getPublicPage(shareToken);
      setPage(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки публичной страницы:', err);
      setError('Страница не найдена или недоступна');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePage = () => {
    // Заглушка - в публичном режиме редактирование недоступно
  };

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
        <p>Загрузка страницы...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <h2>Страница не найдена</h2>
        <p>{error || 'Эта страница недоступна или была удалена'}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="public-page-header">
        <Link to="/" className="public-page-logo">
          <img 
            src="/favicon.svg" 
            alt="SKWISKWA NOTES" 
            className="logo-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.includes('favicon.svg')) {
                target.src = '/favicon.ico';
              } else if (target.src.includes('favicon.ico')) {
                target.src = '/icon-192.png';
              }
            }}
          />
          <span className="logo-text">SKWISKWA NOTES</span>
        </Link>
        <Link to="/login" className="public-page-login-link">
          Войти
        </Link>
      </div>
      <div className="main-content" style={{ marginTop: '0px' }}>
        <PageView
          page={page}
          onUpdatePage={handleUpdatePage}
          isEditMode={false}
        />
      </div>
    </div>
  );
}

export default PublicPageView;