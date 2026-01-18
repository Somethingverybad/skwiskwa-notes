import { useState, useEffect } from 'react';
import { Page, Block } from '../types';
import { api } from '../api';
import BlockComponent from './BlockComponent';
import BlockMenu from './BlockMenu';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiPlus, FiShare2, FiCopy, FiCheck } from 'react-icons/fi';

interface PageViewProps {
  page: Page;
  onUpdatePage: (pageId: number, data: Partial<Page>) => void;
  onReload?: () => void;
  isEditMode?: boolean;
}

function PageView({ page, onUpdatePage, isEditMode = true }: PageViewProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [titleValue, setTitleValue] = useState<string>(page.title || '');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [blockId: number]: number }>({});
  
  // Настройка сенсоров для перетаскивания - отключаем на мобильных
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 999 : 8, // На мобильных отключаем (большое расстояние)
      },
    })
  );

  useEffect(() => {
    // Если блоки уже есть в page.blocks (например, из публичного API), используем их
    if (page.blocks && Array.isArray(page.blocks)) {
      setBlocks(page.blocks);
    } else if (!isEditMode && page.share_token) {
      // Для публичных страниц загружаем блоки через публичный API
      loadPublicBlocks(page.share_token);
    } else if (isEditMode) {
      // Для авторизованных пользователей загружаем блоки обычным способом
      loadBlocks();
    }
    if (page.share_url) {
      setShareUrl(page.share_url);
    }
  }, [page.id, page.share_url, page.blocks, page.share_token, isEditMode]);

  // Синхронизируем локальное состояние с пропсом page при его изменении
  useEffect(() => {
    // Обновляем только если значение действительно изменилось (не из нашего локального изменения)
    const serverTitle = page.title || '';
    if (serverTitle !== titleValue && document.activeElement?.className !== 'notion-title') {
      setTitleValue(serverTitle);
    }
  }, [page.title]);

  const loadBlocks = async () => {
    // Загружаем блоки только для авторизованных пользователей
    try {
      const response = await api.getBlocks(page.id);
      setBlocks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки блоков:', error);
    }
  };

  const loadPublicBlocks = async (token: string) => {
    // Загружаем блоки через публичный API
    try {
      const response = await api.getPublicBlocks(token);
      setBlocks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки публичных блоков:', error);
      // Если блоки есть в page.blocks, используем их как fallback
      if (page.blocks && Array.isArray(page.blocks)) {
        setBlocks(page.blocks);
      }
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    // Обновляем локальное состояние сразу для плавности ввода
    setTitleValue(newTitle);
    // Разрешаем пустую строку - отправляем как есть
    onUpdatePage(page.id, { title: newTitle });
  };
  
  const handleTitleBlur = () => {
    // При потере фокуса синхронизируем с серверным значением
    const serverTitle = page.title || '';
    setTitleValue(serverTitle);
  };

  const handleCreateBlock = async (blockType: string) => {
    try {
      const response = await api.createBlock({
        page: page.id,
        block_type: blockType as any,
        content: '',
        order: blocks.length,
      });
      setBlocks([...blocks, response.data]);
      setShowBlockMenu(false);
    } catch (error) {
      console.error('Ошибка создания блока:', error);
    }
  };

  const handleUpdateBlock = async (blockId: number, data: Partial<Block>) => {
    try {
      await api.updateBlock(blockId, data);
      setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...data } : b));
    } catch (error) {
      console.error('Ошибка обновления блока:', error);
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    try {
      await api.deleteBlock(blockId);
      setBlocks(blocks.filter(b => b.id !== blockId));
    } catch (error) {
      console.error('Ошибка удаления блока:', error);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(oldIndex, 1);
    newBlocks.splice(newIndex, 0, movedBlock);

    // Обновляем order для всех блоков
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));

    setBlocks(updatedBlocks);

    try {
      await api.reorderBlocks(
        updatedBlocks.map((b, index) => ({ id: b.id, order: index }))
      );
    } catch (error) {
      console.error('Ошибка изменения порядка блоков:', error);
      loadBlocks(); // Перезагрузить при ошибке
    }
  };

  const moveBlock = async (blockId: number, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(currentIndex, 1);
    newBlocks.splice(newIndex, 0, movedBlock);

    // Обновляем order для всех блоков
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));

    setBlocks(updatedBlocks);

    try {
      await api.reorderBlocks(
        updatedBlocks.map((b, index) => ({ id: b.id, order: index }))
      );
    } catch (error) {
      console.error('Ошибка изменения порядка блоков:', error);
      loadBlocks(); // Перезагрузить при ошибке
    }
  };

  const handleMoveUp = (blockId: number) => {
    moveBlock(blockId, 'up');
  };

  const handleMoveDown = (blockId: number) => {
    moveBlock(blockId, 'down');
  };

  const handleFileUpload = async (blockId: number, file: File) => {
    // Устанавливаем прогресс загрузки в 0
    setUploadProgress(prev => ({ ...prev, [blockId]: 0 }));
    
    try {
      const response = await api.uploadFile(blockId, file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [blockId]: progress }));
      });
      setBlocks(blocks.map(b => b.id === blockId ? response.data : b));
      // Убираем прогресс после успешной загрузки
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[blockId];
        return newProgress;
      });
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      // Убираем прогресс при ошибке
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[blockId];
        return newProgress;
      });
    }
  };

  const handleToggleShare = async () => {
    try {
      const response = await api.toggleSharePage(page.id);
      onUpdatePage(page.id, response.data);
      if (response.data.share_url) {
        setShareUrl(response.data.share_url);
      } else {
        setShareUrl('');
      }
    } catch (error) {
      console.error('Ошибка переключения шаринга:', error);
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const response = await api.generateShareLink(page.id);
      setShareUrl(response.data.share_url);
      onUpdatePage(page.id, { share_token: response.data.share_token, is_public: true });
    } catch (error) {
      console.error('Ошибка генерации ссылки:', error);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Ошибка копирования ссылки:', error);
      }
    }
  };

  const activeBlock = blocks.find(b => b.id === activeId);

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

  return (
    <div className="notion-page">
      <div className="page-header">
        <div className="page-title-container">
          <input
            type="text"
            className="notion-title"
            value={titleValue}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder="Без названия"
            disabled={!isEditMode}
            readOnly={!isEditMode}
          />
          {page.updated_at && (
            <span className="page-updated-date">
              Изменено {formatDate(page.updated_at)}
            </span>
          )}
        </div>
        {isEditMode && (
          <div className="share-controls">
          <button 
            className={`share-btn ${page.is_public ? 'active' : ''}`}
            onClick={() => setShowShareMenu(!showShareMenu)}
            title="Поделиться страницей"
          >
            <FiShare2 /> {page.is_public ? 'Публичная' : 'Поделиться'}
          </button>
          {showShareMenu && (
            <div className="share-menu">
              <label className="share-toggle">
                <input
                  type="checkbox"
                  checked={page.is_public || false}
                  onChange={handleToggleShare}
                />
                <span>Публичный доступ</span>
              </label>
              {page.is_public && shareUrl && (
                <div className="share-url-container">
                  <input 
                    type="text" 
                    value={shareUrl} 
                    readOnly 
                    className="share-url-input"
                  />
                  <button 
                    className="copy-btn"
                    onClick={handleCopyLink}
                    title="Копировать ссылку"
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              )}
              {page.is_public && !shareUrl && (
                <button className="generate-link-btn" onClick={handleGenerateShareLink}>
                  Сгенерировать ссылку
                </button>
              )}
            </div>
          )}
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => (
            <BlockComponent
              key={block.id}
              block={block}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              onFileUpload={handleFileUpload}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
              isEditMode={isEditMode}
              uploadProgress={uploadProgress[block.id]}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeBlock && (
            <div className="drag-overlay">
              <BlockComponent
                block={activeBlock}
                onUpdate={() => {}}
                onDelete={() => {}}
                onFileUpload={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {isEditMode && (
        <button className="add-block-btn" onClick={() => setShowBlockMenu(!showBlockMenu)}>
          <FiPlus /> Добавить блок
        </button>
      )}

      {showBlockMenu && isEditMode && (
        <BlockMenu
          onSelect={handleCreateBlock}
          onClose={() => setShowBlockMenu(false)}
        />
      )}
    </div>
  );
}

export default PageView;
