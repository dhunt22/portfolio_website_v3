// Simple HTTP server to serve the build output
const http = require('http');
const fs = require('fs');
const path = require('path');

// Directory to serve files from
const buildDir = path.join(__dirname, '.next');
const publicDir = path.join(__dirname, 'public');

// Port to listen on
const PORT = 3000;

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('Build directory .next does not exist. Please run "npm run build" first.');
  process.exit(1);
}

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`);
  
  // Default to index.html for root path
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  // Determine content type based on file extension
  let contentType = 'text/html';
  const extname = path.extname(filePath);
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
  }
  
  // Try to find the file in build directory first, then in public
  const buildFilePath = path.join(buildDir, filePath);
  const publicFilePath = path.join(publicDir, filePath);
  
  // First check if file exists in build directory
  if (fs.existsSync(buildFilePath) && fs.statSync(buildFilePath).isFile()) {
    fs.readFile(buildFilePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end(`Error loading ${buildFilePath}: ${error.code}`);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
  // Then check if file exists in public directory
  else if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
    fs.readFile(publicFilePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end(`Error loading ${publicFilePath}: ${error.code}`);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
  // If file not found in either directory
  else {
    res.writeHead(404);
    res.end(`File not found: ${filePath}`);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server`);
});
