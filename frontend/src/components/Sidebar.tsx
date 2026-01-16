import { FiPlus, FiFileText, FiTrash2 } from 'react-icons/fi';
import { Page } from '../types';

interface SidebarProps {
  pages: Page[];
  currentPage: Page | null;
  onSelectPage: (pageId: number) => void;
  onCreatePage: () => void;
  onDeletePage: (pageId: number) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({ pages, currentPage, onSelectPage, onCreatePage, onDeletePage, isOpen, onClose }: SidebarProps) {
  // Защита от ошибок: убеждаемся, что pages - это массив
  const pagesArray = Array.isArray(pages) ? pages : [];
  
  const handlePageSelect = (pageId: number) => {
    onSelectPage(pageId);
    // Закрываем sidebar на мобильных после выбора
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <h3 className="sidebar-title">
        Мои страницы
      </h3>
      
      <div>
        {pagesArray.map((page) => (
          <div
            key={page.id}
            className={`sidebar-item ${currentPage?.id === page.id ? 'active' : ''}`}
            onClick={() => handlePageSelect(page.id)}
          >
            <FiFileText />
            <span style={{ flex: 1 }}>
              {page.title && page.title.trim() !== '' ? page.title : 'Без названия'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Удалить страницу?')) {
                  onDeletePage(page.id);
                }
              }}
              className="sidebar-delete-btn"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <button className="add-page-btn" onClick={onCreatePage}>
        <FiPlus /> Новая страница
      </button>
    </div>
  );
}

export default Sidebar;
