import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const TYPE_OPTIONS = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
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

function AddEntryCard({ onCreated }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(todayStr())
  const [type, setType] = useState('expense')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || !category || !date) return
    setLoading(true)
    setFeedback(null)
    try {
      const body = { type, amount: parseFloat(amount), category, date, notes }
      const res = await fetch(`${API}/api/budget`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add entry')
      setFeedback({ type: 'success', message: 'Entry added!' })
      setAmount(''); setCategory(''); setDate(todayStr()); setType('expense'); setNotes('')
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
        Add Entry
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        <div>
          <label style={labelStyle}>Type</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: type === opt.value ? '#6366f1' : '#2a2a3a',
                  background: type === opt.value ? '#6366f1' : 'transparent',
                  color: type === opt.value ? '#fff' : '#888',
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              style={inputStyle}
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} required />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Category *</label>
          <input
            style={inputStyle}
            placeholder="e.g. Groceries"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Notes (optional)</label>
          <input
            style={inputStyle}
            placeholder="Any details..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {feedback && (
          <p style={{ fontSize: '0.85rem', color: feedback.type === 'success' ? '#4ade80' : '#f87171', margin: 0 }}>
            {feedback.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !amount || !category || !date}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            background: loading || !amount || !category || !date ? '#2a2a3a' : '#6366f1',
            color: loading || !amount || !category || !date ? '#555' : '#fff',
            cursor: loading || !amount || !category || !date ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Adding...' : 'Add Entry'}
        </button>
      </form>
    </div>
  )
}

export default function BudgetPlanner() {
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState(null)

  function loadEntries() {
    fetch(`${API}/api/budget`, { credentials: 'include' })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || r.statusText)
        return data
      })
      .then(setEntries)
      .catch(() => setError('Could not load budget entries'))
  }

  useEffect(() => {
    loadEntries()
  }, [])

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API}/api/budget/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to delete entry')
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch {
      setError('Could not delete entry')
    }
  }

  const totalIncome = entries ? entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) : 0
  const totalExpenses = entries ? entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0) : 0
  const balance = totalIncome - totalExpenses

  const sortedEntries = entries ? [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)) : null

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Budget Planner</h1>
        <p style={{ color: '#888', marginTop: '4px' }}>Track your income and expenses</p>
      </header>

      {error && <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>}

      {/* Balance summary */}
      <div style={{ background: '#1a1a24', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Balance
        </h2>
        {!entries ? (
          <p style={{ color: '#555' }}>Loading...</p>
        ) : (
          <p style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: balance >= 0 ? '#4ade80' : '#f87171',
          }}>
            {balance >= 0 ? '+' : '-'}${Math.abs(balance).toFixed(2)}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

        {/* Add Entry */}
        <AddEntryCard onCreated={loadEntries} />

        {/* Entries list */}
        <div style={{ background: '#1a1a24', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Entries
          </h2>
          {!sortedEntries ? (
            <p style={{ color: '#555' }}>Loading...</p>
          ) : sortedEntries.length === 0 ? (
            <p style={{ color: '#555' }}>No entries yet</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedEntries.map(entry => (
                <li
                  key={entry.id}
                  style={{
                    borderBottom: '1px solid #2a2a3a',
                    paddingBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px', color: '#e0e0e0' }}>{entry.category}</p>
                    <p style={{ fontSize: '0.8rem', color: '#888' }}>{formatDate(entry.date)}</p>
                    {entry.notes && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>{entry.notes}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <p style={{
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      color: entry.type === 'income' ? '#4ade80' : '#f87171',
                      whiteSpace: 'nowrap',
                    }}>
                      {entry.type === 'income' ? '+' : '-'}${Number(entry.amount).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #2a2a3a',
                        background: 'transparent',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
