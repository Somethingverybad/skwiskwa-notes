import { useState, useEffect } from 'react';
import { Page, Block } from '../types';
import { api } from '../api';
import BlockComponent from './BlockComponent';
import BlockMenu from './BlockMenu';
import { DndContext, closestCenter, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiPlus } from 'react-icons/fi';

interface PageViewProps {
  page: Page;
  onUpdatePage: (pageId: number, data: Partial<Page>) => void;
  onReload?: () => void;
}

function PageView({ page, onUpdatePage }: PageViewProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [titleValue, setTitleValue] = useState<string>(page.title || '');

  useEffect(() => {
    loadBlocks();
  }, [page.id]);

  // Синхронизируем локальное состояние с пропсом page при его изменении
  useEffect(() => {
    // Обновляем только если значение действительно изменилось (не из нашего локального изменения)
    const serverTitle = page.title || '';
    if (serverTitle !== titleValue && document.activeElement?.className !== 'notion-title') {
      setTitleValue(serverTitle);
    }
  }, [page.title]);

  const loadBlocks = async () => {
    try {
      const response = await api.getBlocks(page.id);
      setBlocks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки блоков:', error);
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

  const handleFileUpload = async (blockId: number, file: File) => {
    try {
      const response = await api.uploadFile(blockId, file);
      setBlocks(blocks.map(b => b.id === blockId ? response.data : b));
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
    }
  };

  const activeBlock = blocks.find(b => b.id === activeId);

  return (
    <div className="notion-page">
      <input
        type="text"
        className="notion-title"
        value={titleValue}
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        placeholder="Без названия"
      />

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockComponent
              key={block.id}
              block={block}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              onFileUpload={handleFileUpload}
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

      <button className="add-block-btn" onClick={() => setShowBlockMenu(!showBlockMenu)}>
        <FiPlus /> Добавить блок
      </button>

      {showBlockMenu && (
        <BlockMenu
          onSelect={handleCreateBlock}
          onClose={() => setShowBlockMenu(false)}
        />
      )}
    </div>
  );
}

export default PageView;
