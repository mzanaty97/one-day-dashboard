const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { getAuthUrl, getTokens, createAuthenticatedClient } = require('./auth');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Token store — persisted to tokens.json so sessions survive server restarts
const TOKENS_FILE = path.join(__dirname, '../tokens.json');
let tokenStore = {};
try {
  tokenStore = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
} catch (_) {
  // File doesn't exist or is invalid JSON — start fresh
}

function saveTokenStore() {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokenStore), 'utf8');
}

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
    saveTokenStore();
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

app.post('/auth/logout', (req, res) => {
  delete tokenStore['user'];
  saveTokenStore();
  res.json({ success: true });
});

app.get('/api/emails', async (req, res) => {
  if (!tokenStore['user']) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const auth = createAuthenticatedClient(tokenStore['user']);
    const gmail = google.gmail({ version: 'v1', auth });
    const list = await gmail.users.messages.list({ userId: 'me', maxResults: 10, labelIds: ['INBOX'] });
    const messages = await Promise.all(
      (list.data.messages || []).map(async (msg) => {
        const full = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'metadata', metadataHeaders: ['From', 'Subject', 'Date'] });
        const headers = full.data.payload.headers;
        const get = (name) => headers.find(h => h.name === name)?.value || '';
        return { id: msg.id, subject: get('Subject'), from: get('From'), date: get('Date'), snippet: full.data.snippet };
      })
    );
    res.json(messages);
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/calendar', async (req, res) => {
  if (!tokenStore['user']) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const auth = createAuthenticatedClient(tokenStore['user']);
    const calendar = google.calendar({ version: 'v3', auth });
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: weekLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 20,
    });
    const items = (events.data.items || []).map(e => ({
      id: e.id,
      summary: e.summary,
      start: e.start.dateTime || e.start.date,
      end: e.end.dateTime || e.end.date,
      location: e.location,
    }));
    res.json(items);
  } catch (err) {
    console.error('Calendar error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/calendar/events', async (req, res) => {
  if (!tokenStore['user']) return res.status(401).json({ error: 'Not authenticated' });
  const { title, date, time, notes, repeat, frequency, endDate, count, timeZone } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'title and date are required' });

  try {
    const auth = createAuthenticatedClient(tokenStore['user']);
    const calendar = google.calendar({ version: 'v3', auth });

    const isAllDay = !time;
    const tz = timeZone || 'UTC';
    let startDateTime, endDateTime;
    if (!isAllDay) {
      startDateTime = `${date}T${time}:00`;
      const endDT = new Date(`${date}T${time}:00`);
      endDT.setHours(endDT.getHours() + 1);
      const pad = n => String(n).padStart(2, '0');
      endDateTime = `${endDT.getFullYear()}-${pad(endDT.getMonth() + 1)}-${pad(endDT.getDate())}T${pad(endDT.getHours())}:${pad(endDT.getMinutes())}:00`;
    }

    const event = {
      summary: title,
      description: notes || '',
      start: isAllDay ? { date } : { dateTime: startDateTime, timeZone: tz },
      end: isAllDay ? { date } : { dateTime: endDateTime, timeZone: tz },
    };

    if (repeat && frequency) {
      let rrule = `RRULE:FREQ=${frequency.toUpperCase()}`;
      if (endDate) {
        const until = endDate.replace(/-/g, '') + 'T000000Z';
        rrule += `;UNTIL=${until}`;
      } else if (count) {
        rrule += `;COUNT=${count}`;
      }
      event.recurrence = [rrule];
    }

    const created = await calendar.events.insert({ calendarId: 'primary', resource: event });
    res.json({ id: created.data.id, link: created.data.htmlLink });
  } catch (err) {
    console.error('Create event error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback — serve frontend build for any non-API route
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
