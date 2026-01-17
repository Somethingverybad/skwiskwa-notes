import { useState, useRef, useEffect } from 'react';
import { Block } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMove, FiTrash2 } from 'react-icons/fi';
import { useDropzone, Accept } from 'react-dropzone';

interface BlockComponentProps {
  block: Block;
  onUpdate: (blockId: number, data: Partial<Block>) => void;
  onDelete: (blockId: number) => void;
  onFileUpload: (blockId: number, file: File) => void;
}

function BlockComponent({ block, onUpdate, onDelete, onFileUpload }: BlockComponentProps) {
  const [content, setContent] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  const handleBlur = () => {
    if (content !== block.content) {
      onUpdate(block.id, { content });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(block.id, { checked: e.target.checked });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(block.id, acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptTypes(block.block_type),
    maxFiles: 1,
  });

  const renderBlockContent = () => {
    switch (block.block_type) {
      case 'text':
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'quote':
      case 'list':
        return (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onBlur={handleBlur}
            placeholder={getPlaceholder(block.block_type)}
            rows={1}
          />
        );

      case 'checkbox':
        return (
          <div className="checkbox-block">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={handleCheckboxChange}
            />
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onBlur={handleBlur}
              placeholder="Элемент списка"
              rows={1}
              className={block.checked ? 'checked-text' : ''}
            />
          </div>
        );

      case 'divider':
        return <div className="divider-block" />;

      case 'image':
      case 'video':
      case 'audio':
        return (
          <div className="media-block">
            {block.file_url ? (
              <>
                {block.block_type === 'image' && (
                  <img src={block.file_url} alt="uploaded" />
                )}
                {block.block_type === 'video' && (
                  <video src={block.file_url} controls />
                )}
                {block.block_type === 'audio' && (
                  <audio src={block.file_url} controls />
                )}
              </>
            ) : (
              <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <p>
                  {isDragActive
                    ? 'Отпустите файл здесь'
                    : `Перетащите ${getFileTypeText(block.block_type)} или нажмите для выбора`}
                </p>
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="media-block">
            {block.file_url ? (
              <a href={block.file_url} download className="file-download-link">
                📎 {block.content || 'Скачать файл'} ({formatFileSize(block.file_size)})
              </a>
            ) : (
              <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <p>
                  {isDragActive
                    ? 'Отпустите файл здесь'
                    : 'Перетащите файл или нажмите для выбора'}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="notion-block"
      data-type={block.block_type}
    >
      <div className="block-actions">
        <button {...attributes} {...listeners}>
          <FiMove />
        </button>
        <button onClick={() => onDelete(block.id)}>
          <FiTrash2 />
        </button>
      </div>
      {renderBlockContent()}
    </div>
  );
}

function getPlaceholder(blockType: string): string {
  switch (blockType) {
    case 'heading1':
      return 'Заголовок 1';
    case 'heading2':
      return 'Заголовок 2';
    case 'heading3':
      return 'Заголовок 3';
    case 'quote':
      return 'Цитата';
    case 'list':
      return 'Элемент списка';
    default:
      return 'Введите текст...';
  }
}

function getAcceptTypes(blockType: string): Accept | undefined {
  switch (blockType) {
    case 'image':
      return { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] };
    case 'video':
      return { 'video/*': ['.mp4', '.webm', '.ogg'] };
    case 'audio':
      return { 'audio/*': ['.mp3', '.wav', '.ogg'] };
    default:
      return undefined;
  }
}

function getFileTypeText(blockType: string): string {
  switch (blockType) {
    case 'image':
      return 'изображение';
    case 'video':
      return 'видео';
    case 'audio':
      return 'аудио';
    default:
      return 'файл';
  }
}

function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return '';
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
  if (bytes === 0) return '0 Байт';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export default BlockComponent;
