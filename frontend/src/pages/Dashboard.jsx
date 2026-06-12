import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatFrom(from) {
  const match = from.match(/^"?([^"<]+)"?\s*</)
  return match ? match[1].trim() : from.split('@')[0]
}

export default function Dashboard() {
  const [emails, setEmails] = useState(null)
  const [events, setEvents] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/emails`, { credentials: 'include' })
      .then(r => r.json())
      .then(setEmails)
      .catch(() => setError('Could not load emails'))

    fetch(`${API}/api/calendar`, { credentials: 'include' })
      .then(r => r.json())
      .then(setEvents)
      .catch(() => setError('Could not load calendar'))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{greeting} ☀️</h1>
        <p style={{ color: '#888', marginTop: '4px' }}>Here's your day at a glance</p>
      </header>

      {error && <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

        {/* Emails */}
        <div style={{ background: '#1a1a24', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emails</h2>
          {!emails ? (
            <p style={{ color: '#555' }}>Loading...</p>
          ) : emails.error ? (
            <p style={{ color: '#f87171' }}>{emails.error}</p>
          ) : emails.length === 0 ? (
            <p style={{ color: '#555' }}>Inbox is empty</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {emails.map(email => (
                <li key={email.id} style={{ borderBottom: '1px solid #2a2a3a', paddingBottom: '12px' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px', color: '#e0e0e0' }}>{email.subject || '(no subject)'}</p>
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>{formatFrom(email.from)}</p>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>{email.snippet}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Calendar */}
        <div style={{ background: '#1a1a24', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calendar</h2>
          {!events ? (
            <p style={{ color: '#555' }}>Loading...</p>
          ) : events.error ? (
            <p style={{ color: '#f87171' }}>{events.error}</p>
          ) : events.length === 0 ? (
            <p style={{ color: '#555' }}>No events this week</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.map(event => (
                <li key={event.id} style={{ borderBottom: '1px solid #2a2a3a', paddingBottom: '12px' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px', color: '#e0e0e0' }}>{event.summary}</p>
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>{formatDate(event.start)}</p>
                  {event.location && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>{event.location}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* AI Briefing */}
        <div style={{ background: '#1a1a24', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Briefing</h2>
          <p style={{ color: '#555' }}>Run <code style={{ background: '#2a2a3a', padding: '2px 6px', borderRadius: '4px' }}>/briefing</code> in Claude Code to generate your daily briefing.</p>
        </div>

      </div>
    </div>
  )
}
