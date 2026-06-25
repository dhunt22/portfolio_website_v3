// Serves the static export (out/) at root — production-faithful preview.
//   node style-explorations/serve-out.js   →  http://localhost:4180/
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'out');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.geojson': 'application/geo+json',
  '.pdf': 'application/pdf',
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.normalize(path.join(root, urlPath));
    if (!filePath.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      // Next static export emits route.html beside same-named directories
      const indexPath = path.join(filePath, 'index.html');
      const htmlSibling = filePath.replace(/[\\/]+$/, '') + '.html';
      filePath = fs.existsSync(indexPath) ? indexPath : htmlSibling;
    }
    if (!fs.existsSync(filePath)) {
      const htmlPath = filePath + '.html';
      const notFoundPath = path.join(root, '404.html');
      if (fs.existsSync(htmlPath)) filePath = htmlPath;
      else if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return fs.createReadStream(notFoundPath).pipe(res);
      } else { res.writeHead(404); return res.end('not found'); }
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  })
  .listen(4180, () => console.log('http://localhost:4180/'));
