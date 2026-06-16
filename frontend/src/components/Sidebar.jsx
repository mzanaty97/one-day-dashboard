import { NavLink } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Daily Dashboard' },
  { to: '/budget', label: 'Budget Planner' },
]

const linkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '10px 16px',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: isActive ? '600' : '400',
  color: isActive ? '#fff' : '#888',
  background: isActive ? '#6366f1' : 'transparent',
  transition: 'background 0.15s, color 0.15s',
})

export default function Sidebar() {
  async function handleLogout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' })
    window.location.href = '/'
  }

  return (
    <div style={{
      width: '220px',
      flexShrink: 0,
      height: '100vh',
      background: '#1a1a24',
      borderRight: '1px solid #2a2a3a',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
      boxSizing: 'border-box',
    }}>
      <div style={{ padding: '0 12px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>One Day</h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} style={linkStyle}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #2a2a3a',
          background: 'transparent',
          color: '#888',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Log out
      </button>
    </div>
  )
}
