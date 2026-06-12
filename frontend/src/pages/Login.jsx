export default function Login() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '24px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>One Day</h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>Your unified life dashboard</p>
      </div>

      <button
        onClick={handleLogin}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#fff',
          color: '#1a1a1a',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          marginTop: '16px',
        }}
      >
        <img src="https://www.google.com/favicon.ico" width="20" height="20" alt="" />
        Continue with Google
      </button>
    </div>
  )
}
