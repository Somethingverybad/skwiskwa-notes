import * as FiIcons from 'react-icons/fi';
import { FiPlus, FiFileText, FiTrash2, FiX } from 'react-icons/fi';
import { Page } from '../types';

interface SidebarProps {
  pages: Page[];
  currentPage: Page | null;
  onSelectPage: (pageId: number) => void;
  onCreatePage: () => void;
  onDeletePage: (pageId: number) => void;
  onUpdatePage: (pageId: number, data: Partial<Page>) => void;
  isOpen?: boolean;
  isEditMode?: boolean;
  onClose?: () => void;
}

function Sidebar({ pages, currentPage, onSelectPage, onCreatePage, onDeletePage, onUpdatePage, isOpen, isEditMode = true, onClose }: SidebarProps) {
  // Защита от ошибок: убеждаемся, что pages - это массив
  // Сортируем страницы по дате изменения (недавно измененные наверху)
  const pagesArray = Array.isArray(pages) 
    ? [...pages].sort((a, b) => {
        const dateA = new Date(a.updated_at).getTime();
        const dateB = new Date(b.updated_at).getTime();
        return dateB - dateA; // DESC - новые сверху
      })
    : [];
  
  const handlePageSelect = (pageId: number) => {
    onSelectPage(pageId);
    // Закрываем sidebar на мобильных после выбора
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  const handleIconSelect = (pageId: number, iconName: string) => {
    onUpdatePage(pageId, { icon: iconName });
  };

  const handleColorSelect = (pageId: number, color: string) => {
    onUpdatePage(pageId, { background_color: color });
  };

  // Форматируем дату изменения
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`;
    } else {
      return 'только что';
    }
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return <FiFileText />;
    // Пытаемся найти иконку в react-icons/fi по имени
    const IconComponent = (FiIcons as any)[iconName];
    return IconComponent ? <IconComponent /> : <FiFileText />;
  };

  const popularIcons = [
    'FiFileText', 'FiFolder', 'FiStar', 'FiHeart', 'FiBookmark',
    'FiHome', 'FiUser', 'FiSettings', 'FiCalendar', 'FiClock',
    'FiBell', 'FiMail', 'FiMessageSquare', 'FiImage', 'FiVideo',
    'FiMusic', 'FiFile', 'FiArchive', 'FiTag', 'FiFlag'
  ];

  const colorOptions = [
    null, // прозрачный
    '#FF4444', '#00D4AA', '#3B82F6', '#FF6B35', '#10B981',
    '#FBBF24', '#A855F7', '#06B6D4', '#F59E0B', '#22C55E'
  ];
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <h3 className="sidebar-title">
        Мои страницы
      </h3>
      
      <div>
        {pagesArray.map((page) => {
          const isSelected = currentPage?.id === page.id;
          const showEditor = isEditMode && isSelected;
          
          return (
            <div
              key={page.id}
              className={`sidebar-item ${isSelected ? 'active' : ''} ${showEditor ? 'expanded' : ''}`}
              style={page.background_color ? { backgroundColor: page.background_color + '20' } : {}}
              onClick={() => handlePageSelect(page.id)}
            >
              <div className="sidebar-item-main">
                <div className="sidebar-item-icon">
                  {getIconComponent(page.icon)}
                </div>
                <div className="sidebar-item-content" style={{ flex: 1 }}>
                  <span className="sidebar-item-title">
                    {page.title && page.title.trim() !== '' ? page.title : 'Без названия'}
                  </span>
                  {page.updated_at && (
                    <span className="sidebar-item-date">
                      {formatDate(page.updated_at)}
                    </span>
                  )}
                </div>
                {isEditMode && !showEditor && (
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
                )}
              </div>
              
              {showEditor && (
                <div className="sidebar-item-editor-expanded">
                  <div className="editor-section">
                    <label className="editor-label">Иконка:</label>
                    <div className="icon-picker-inline">
                      {popularIcons.map(iconName => {
                        const IconComponent = (FiIcons as any)[iconName];
                        return IconComponent ? (
                          <button
                            key={iconName}
                            className={`icon-picker-btn ${page.icon === iconName ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIconSelect(page.id, iconName);
                            }}
                            title={iconName}
                          >
                            <IconComponent />
                          </button>
                        ) : null;
                      })}
                      <button
                        className={`icon-picker-btn ${!page.icon ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIconSelect(page.id, '');
                        }}
                        title="Убрать иконку"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                  
                  <div className="editor-section">
                    <label className="editor-label">Цвет фона:</label>
                    <div className="color-picker-inline">
                      {colorOptions.map((color, index) => (
                        <button
                          key={index}
                          className={`color-picker-btn ${page.background_color === color ? 'active' : ''}`}
                          style={color ? { backgroundColor: color } : { backgroundColor: 'transparent', border: '2px solid var(--border-color)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleColorSelect(page.id, color || '');
                          }}
                          title={color || 'Прозрачный'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <button className="add-page-btn" onClick={onCreatePage}>
        <FiPlus /> Новая страница
      </button>
    </div>
  );
}

export default Sidebar;
