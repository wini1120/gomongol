import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ReviewDetailPage from './pages/ReviewDetailPage.jsx'
import PostDetailPage from './pages/PostDetailPage.jsx'
import AgencyDetailPage from './pages/AgencyDetailPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/review/:reviewId" element={<ReviewDetailPage />} />
        <Route path="/post/:postId" element={<PostDetailPage />} />
        <Route path="/agency/:agencyId" element={<AgencyDetailPage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
