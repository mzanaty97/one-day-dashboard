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

const FREQ_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const END_OPTIONS = [
  { value: 'forever', label: 'Forever' },
  { value: 'until', label: 'Until a date' },
  { value: 'count', label: 'After N times' },
]

const inputStyle = {
  width: '100%',
  background: '#12121a',
  border: '1px solid #2a2a3a',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#e0e0e0',
  fontSize: '0.875rem',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: '0.75rem',
  color: '#888',
  marginBottom: '4px',
  display: 'block',
}

function AddReminderCard({ onCreated }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [repeat, setRepeat] = useState(false)
  const [frequency, setFrequency] = useState('daily')
  const [endType, setEndType] = useState('forever')
  const [endDate, setEndDate] = useState('')
  const [count, setCount] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title || !date) return
    setLoading(true)
    setFeedback(null)
    try {
      const body = {
        title, date, time, notes, repeat,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        frequency: repeat ? frequency : undefined,
        endDate: repeat && endType === 'until' ? endDate : undefined,
        count: repeat && endType === 'count' ? parseInt(count, 10) : undefined,
      }
      const res = await fetch(`${API}/api/calendar/events`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create event')
      setFeedback({ type: 'success', message: 'Event added to your calendar!' })
      setTitle(''); setDate(''); setTime(''); setNotes('')
      setRepeat(false); setFrequency('daily'); setEndType('forever')
      setEndDate(''); setCount('')
      onCreated?.()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#1a1a24', borderRadius: '12px', padding: '24px' }}>
      <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Add Reminder
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        <div>
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle}
            placeholder="e.g. Morning workout"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Time (optional)</label>
            <input type="time" style={inputStyle} value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: '64px' }}
            placeholder="Any details..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Repeat toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setRepeat(r => !r)}
            style={{
              position: 'relative',
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: repeat ? '#6366f1' : '#2a2a3a',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
            aria-pressed={repeat}
          >
            <span style={{
              position: 'absolute',
              top: '3px',
              left: repeat ? '23px' : '3px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ fontSize: '0.875rem', color: '#ccc' }}>Repeat this event</span>
        </div>

        {/* Repeat options */}
        {repeat && (
          <div style={{ background: '#12121a', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <div>
              <label style={labelStyle}>Frequency</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {FREQ_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: frequency === opt.value ? '#6366f1' : '#2a2a3a',
                      background: frequency === opt.value ? '#6366f1' : 'transparent',
                      color: frequency === opt.value ? '#fff' : '#888',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Ends</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {END_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEndType(opt.value)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: endType === opt.value ? '#6366f1' : '#2a2a3a',
                      background: endType === opt.value ? '#6366f1' : 'transparent',
                      color: endType === opt.value ? '#fff' : '#888',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {endType === 'until' && (
              <div>
                <label style={labelStyle}>End date</label>
                <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            )}

            {endType === 'count' && (
              <div>
                <label style={labelStyle}>Number of occurrences</label>
                <input
                  type="number"
                  min="1"
                  style={{ ...inputStyle, width: '120px' }}
                  placeholder="e.g. 10"
                  value={count}
                  onChange={e => setCount(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {feedback && (
          <p style={{ fontSize: '0.85rem', color: feedback.type === 'success' ? '#4ade80' : '#f87171', margin: 0 }}>
            {feedback.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !title || !date}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            background: loading || !title || !date ? '#2a2a3a' : '#6366f1',
            color: loading || !title || !date ? '#555' : '#fff',
            cursor: loading || !title || !date ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Adding...' : 'Add to Calendar'}
        </button>
      </form>
    </div>
  )
}

export default function Dashboard() {
  const [emails, setEmails] = useState(null)
  const [events, setEvents] = useState(null)
  const [error, setError] = useState(null)

  function loadCalendar() {
    fetch(`${API}/api/calendar`, { credentials: 'include' })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || r.statusText)
        return data
      })
      .then(setEvents)
      .catch(() => setError('Could not load calendar'))
  }

  useEffect(() => {
    fetch(`${API}/api/emails`, { credentials: 'include' })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || r.statusText)
        return data
      })
      .then(setEmails)
      .catch(() => setError('Could not load emails'))

    loadCalendar()

    const keepAlive = setInterval(() => {
      fetch(`${API}/health`).catch(() => {})
    }, 10 * 60 * 1000)

    return () => clearInterval(keepAlive)
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

        {/* Add Reminder */}
        <AddReminderCard onCreated={loadCalendar} />

      </div>
    </div>
  )
}
