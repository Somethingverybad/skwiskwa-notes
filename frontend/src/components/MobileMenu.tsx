import { FiMenu, FiX } from 'react-icons/fi';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

function MobileMenu({ isOpen, onToggle }: MobileMenuProps) {
  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={onToggle}
        aria-label="Меню"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      {isOpen && (
        <div
          className="sidebar-overlay active"
          onClick={onToggle}
        />
      )}
    </>
  );
}

export default MobileMenu;
