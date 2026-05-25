import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure the db directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ sessions: {} }, null, 2), 'utf-8');
}

// Read database data
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB file:', err);
    return { sessions: {} };
  }
};

// Write database data
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON DB file:', err);
  }
};

export const db = {
  // Get a receipt session by ID
  getSession: (id) => {
    const data = readDB();
    return data.sessions[id] || null;
  },

  // Save/Create a receipt session
  saveSession: (session) => {
    const data = readDB();
    data.sessions[session.id] = session;
    writeDB(data);
    return session;
  },

  // Delete a receipt session
  deleteSession: (id) => {
    const data = readDB();
    if (data.sessions[id]) {
      delete data.sessions[id];
      writeDB(data);
      return true;
    }
    return false;
  }
};
