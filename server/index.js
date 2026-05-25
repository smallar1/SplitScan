import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());


// Root API check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ScanSplit API is healthy' });
});

// POST /api/receipt - Create a receipt session
app.post('/api/receipt', (req, res) => {
  const { items, tax, tip, numPeople } = req.body;
  
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Items list is required' });
  }

  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    items: items.map((item, idx) => ({
      id: item.id || `item-${idx}-${Date.now()}`,
      name: item.name,
      price: Number(item.price) || 0
    })),
    tax: Number(tax) || 0,
    tip: Number(tip) || 0,
    numPeople: Number(numPeople) || 1,
    claims: {}, // itemId -> [array of name strings]
    createdAt: new Date().toISOString()
  };

  db.saveSession(session);
  console.log(`[API] Created receipt session: ${sessionId}`);


  res.status(201).json({
    success: true,
    sessionId
  });
});

// GET /api/receipt/:sessionId - Fetch receipt session details
app.get('/api/receipt/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = db.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  res.json({
    success: true,
    session
  });
});

// POST /api/receipt/:sessionId/claim - Sync a claim update
app.post('/api/receipt/:sessionId/claim', (req, res) => {
  const { sessionId } = req.params;
  const { userName, claimedItemIds } = req.body;

  const session = db.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  if (!userName) {
    return res.status(400).json({ success: false, error: 'userName is required' });
  }

  // Update claim records
  // For each item in the session, add or remove this userName based on claimedItemIds
  session.items.forEach(item => {
    const itemClaimers = session.claims[item.id] || [];
    const isClaimedNow = claimedItemIds.includes(item.id);
    const hasClaimedBefore = itemClaimers.includes(userName);

    if (isClaimedNow && !hasClaimedBefore) {
      itemClaimers.push(userName);
    } else if (!isClaimedNow && hasClaimedBefore) {
      session.claims[item.id] = itemClaimers.filter(name => name !== userName);
      return;
    }
    
    session.claims[item.id] = itemClaimers;
  });

  db.saveSession(session);
  console.log(`[API] Updated claims for session: ${sessionId} by user: ${userName}`);


  res.json({
    success: true,
    claims: session.claims
  });
});

// Serve frontend static build assets in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Server] Express server running on port ${PORT}`);
});
