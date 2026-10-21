const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.js':   'application/javascript',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
};

// Only these files are public. The URL is never joined onto the filesystem path,
// so ../ tricks and files like server.js, package.json or .git/ can't be reached.
// Add new static assets here.
const PUBLIC = new Set(['/index.html', '/manifest.json', '/sw.js', '/icon-192.svg', '/icon-512.svg']);
// Revalidated on every load so new deploys (and new service workers) are picked up
const NO_CACHE = new Set(['/index.html', '/sw.js']);

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  if (!PUBLIC.has(url)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const file = path.join(__dirname, url);

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const ext = path.extname(file);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': NO_CACHE.has(url) ? 'no-cache' : 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') { res.end(); return; }
    res.end(data);
  });
}).listen(PORT, () => console.log(`PodcastStudio running on :${PORT}`));
