export default function Dashboard() {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Good morning ☀️</h1>
        <p style={{ color: '#888', marginTop: '4px' }}>Here's your day at a glance</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#1a1a24', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emails</h2>
          <p style={{ color: '#555' }}>No emails loaded yet</p>
        </div>

        <div style={{ background: '#1a1a24', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calendar</h2>
          <p style={{ color: '#555' }}>No events loaded yet</p>
        </div>

        <div style={{ background: '#1a1a24', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Briefing</h2>
          <p style={{ color: '#555' }}>Briefing will appear here</p>
        </div>
      </div>
    </div>
  )
}
