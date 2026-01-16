import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerServiceWorker } from './utils/registerSW'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Регистрируем Service Worker для PWA
// VitePWA плагин автоматически регистрирует SW, но можно использовать и наш
// registerServiceWorker()
