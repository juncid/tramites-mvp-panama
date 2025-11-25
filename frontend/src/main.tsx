import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import App from './App.tsx'
import ThemeProvider from './theme'
import { AuthProvider } from './context/AuthContext'
import { logger } from './utils/logger'

// Test inicial del logger
logger.info('Frontend iniciado', {
  environment: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_BASE_URL,
  logJson: import.meta.env.VITE_LOG_JSON,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
