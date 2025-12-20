import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import './index.css'
import { CurrencyProvider } from './context/CurrencyContext'; // Import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CurrencyProvider>
      <App />
    </CurrencyProvider>
  </BrowserRouter>
)
