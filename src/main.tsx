import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import './assets/searchbar.js'

const api_key = import.meta.env.VITE_TMDB_API_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App api_key={api_key} />
    </BrowserRouter>
  </StrictMode>,
)