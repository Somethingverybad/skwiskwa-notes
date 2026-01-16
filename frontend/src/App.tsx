import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { api } from './api';
import { Page } from './types';
import Sidebar from './components/Sidebar';
import PageView from './components/PageView';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import MobileMenu from './components/MobileMenu';
import Loader from './components/Loader';

function Dashboard() {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user, logout } = useAuth();
  
  // Отслеживаем изменение размера окна
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await api.getPages();
      const pagesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || []);
      
      setPages(pagesData);
      if (pagesData.length > 0 && !currentPage) {
        loadPage(pagesData[0].id);
      }
    } catch (error) {
      console.error('Ошибка загрузки страниц:', error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (pageId: number) => {
    try {
      const response = await api.getPage(pageId);
      setCurrentPage(response.data);
    } catch (error) {
      console.error('Ошибка загрузки страницы:', error);
    }
  };

  const handleCreatePage = async () => {
    try {
      const response = await api.createPage({ title: 'Новая страница' });
      setPages([response.data, ...pages]);
      setCurrentPage(response.data);
    } catch (error) {
      console.error('Ошибка создания страницы:', error);
    }
  };

  const handleDeletePage = async (pageId: number) => {
    try {
      await api.deletePage(pageId);
      setPages(pages.filter(p => p.id !== pageId));
      if (currentPage?.id === pageId) {
        setCurrentPage(pages.length > 1 ? pages.find(p => p.id !== pageId) || null : null);
      }
    } catch (error) {
      console.error('Ошибка удаления страницы:', error);
    }
  };

  const handleUpdatePage = async (pageId: number, data: Partial<Page>) => {
    try {
      // Если title пустой, отправляем пустую строку (бэкенд обработает)
      const updateData = { ...data };
      if ('title' in updateData && (updateData.title === null || updateData.title === undefined)) {
        updateData.title = '';
      }
      
      const response = await api.updatePage(pageId, updateData);
      setPages(pages.map(p => p.id === pageId ? response.data : p));
      if (currentPage?.id === pageId) {
        setCurrentPage(response.data);
      }
    } catch (error: any) {
      console.error('Ошибка обновления страницы:', error);
      // Показываем более понятное сообщение об ошибке
      if (error.response?.data) {
        console.error('Детали ошибки:', error.response.data);
      }
    }
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
        <p>Загрузка SKWISKWA NOTES...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Мобильное меню */}
      {isMobile && (
        <MobileMenu
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* Мобильный header */}
      {isMobile ? (
        <div className="mobile-header">
          <span className="mobile-header-title">
            {currentPage?.title && currentPage.title.trim() !== '' 
              ? currentPage.title 
              : 'Без названия'}
          </span>
          <button
            onClick={logout}
            className="logout-button"
          >
            Выйти
          </button>
        </div>
      ) : (
        <div className="desktop-header">
          <span className="desktop-header-username">
            {user?.username}
          </span>
          <button
            onClick={logout}
            className="logout-button"
          >
            Выйти
          </button>
        </div>
      )}

      <Sidebar
        pages={pages}
        currentPage={currentPage}
        onSelectPage={loadPage}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content" style={{ marginTop: isMobile ? '56px' : '50px' }}>
        {currentPage ? (
          <PageView
            page={currentPage}
            onUpdatePage={handleUpdatePage}
            onReload={() => loadPage(currentPage.id)}
          />
        ) : (
          <div className="notion-page">
            <h2>Добро пожаловать в SKWISKWA NOTES, {user?.username}!</h2>
            <p>Создайте новую страницу, чтобы начать работу.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Скрываем прелоадер через 2 секунды
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      {showLoader && <Loader />}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
