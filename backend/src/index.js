const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getAuthUrl, getTokens } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// In-memory token store (we'll upgrade this later)
const tokenStore = {};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'One Day API is running' });
});

// Step 1: Send user to Google login
app.get('/auth/google', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// Step 2: Google redirects back here with a code
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokens = await getTokens(code);
    // Store tokens with a simple key for now
    tokenStore['user'] = tokens;
    res.redirect(`${FRONTEND_URL}?auth=success`);
  } catch (err) {
    console.error('Auth error:', err);
    res.redirect(`${FRONTEND_URL}?auth=error`);
  }
});

app.get('/auth/status', (req, res) => {
  const isAuthenticated = !!tokenStore['user'];
  res.json({ isAuthenticated });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
