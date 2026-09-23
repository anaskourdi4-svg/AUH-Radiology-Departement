import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const BUILD_ID = 'b_' + Date.now().toString(36);

// Prevent stale caching on all routes
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Handler for HTML entry point to dynamically replace __BUILD_ID__
function serveIndex(req, res) {
  const filePath = path.join(__dirname, 'index.html');
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replaceAll('__BUILD_ID__', BUILD_ID);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
  } catch (err) {
    res.status(500).send('Error loading dashboard');
  }
}

app.get(['/', '/index.html'], serveIndex);

// Serve static assets from project root
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Fallback for root or direct navigation
app.use(serveIndex);

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT} (build: ${BUILD_ID})`);
});
