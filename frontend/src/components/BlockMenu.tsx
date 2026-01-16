import { FiType, FiImage, FiVideo, FiMusic, FiFile, FiCheckSquare, FiMinus } from 'react-icons/fi';

interface BlockMenuProps {
  onSelect: (blockType: string) => void;
  onClose: () => void;
}

function BlockMenu({ onSelect, onClose }: BlockMenuProps) {
  const blockTypes = [
    { type: 'text', icon: <FiType />, label: 'Текст' },
    { type: 'heading1', icon: <FiType size={24} />, label: 'Заголовок 1' },
    { type: 'heading2', icon: <FiType size={20} />, label: 'Заголовок 2' },
    { type: 'heading3', icon: <FiType size={18} />, label: 'Заголовок 3' },
    { type: 'checkbox', icon: <FiCheckSquare />, label: 'Чекбокс' },
    { type: 'quote', icon: <FiType />, label: 'Цитата' },
    { type: 'divider', icon: <FiMinus />, label: 'Разделитель' },
    { type: 'image', icon: <FiImage />, label: 'Изображение' },
    { type: 'video', icon: <FiVideo />, label: 'Видео' },
    { type: 'audio', icon: <FiMusic />, label: 'Аудио' },
    { type: 'file', icon: <FiFile />, label: 'Файл' },
  ];

  return (
    <>
      <div
        className="block-menu-overlay"
        onClick={onClose}
      />
      <div className="block-menu">
        {blockTypes.map((bt, index) => (
          <div
            key={bt.type}
            className="block-menu-item"
            onClick={() => onSelect(bt.type)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {bt.icon}
            <span>{bt.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default BlockMenu;
