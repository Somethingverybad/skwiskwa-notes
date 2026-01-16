export interface Page {
  id: number;
  title: string;
  icon?: string;
  cover_image?: string;
  cover_image_url?: string;
  parent?: number;
  created_at: string;
  updated_at: string;
  blocks?: Block[];
}

export interface Block {
  id: number;
  page: number;
  block_type: BlockType;
  content: string;
  file?: File | null;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  checked?: boolean;
  order: number;
  parent?: number;
  created_at: string;
  updated_at: string;
}

export type BlockType = 
  | 'text' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'file' 
  | 'quote' 
  | 'list' 
  | 'checkbox' 
  | 'divider';

export interface Comment {
  id: number;
  block: number;
  content: string;
  created_at: string;
  updated_at: string;
}
