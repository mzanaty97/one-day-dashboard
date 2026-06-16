import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BudgetPlanner from './pages/BudgetPlanner'
import AppLayout from './components/AppLayout'
import './index.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    // Check if user is logged in when app loads
    fetch(`${import.meta.env.VITE_API_URL}/auth/status`)
      .then(res => res.json())
      .then(data => setIsAuthenticated(data.isAuthenticated))
      .catch(() => setIsAuthenticated(false))
  }, [])

  // Still checking auth status
  if (isAuthenticated === null) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="budget" element={<BudgetPlanner />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
