import './Loader.css';

function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <img 
          src="/favicon.svg" 
          alt="SKWISKWA NOTES" 
          className="loader-logo"
          onError={(e) => {
            // Если favicon.svg не найден, используем fallback
            const target = e.target as HTMLImageElement;
            if (target.src.includes('favicon.svg')) {
              target.src = '/favicon.ico';
            } else if (target.src.includes('favicon.ico')) {
              target.src = '/icon-192.png';
            }
          }}
        />
        <div className="loader-spinner"></div>
        <p className="loader-text">SKWISKWA NOTES</p>
      </div>
    </div>
  );
}

export default Loader;
