import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#000',
            color: '#fff',
            border: '1px solid #00ff00',
            fontFamily: 'JetBrains Mono, monospace',
          },
          success: {
            iconTheme: {
              primary: '#00ff00',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff0040',
              secondary: '#000',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)