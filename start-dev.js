// Script to start Next.js dev server
const { spawn } = require('child_process');
const path = require('path');

console.log('Attempting to start Next.js development server...');

// Path to the next binary in node_modules
const nextBinPath = path.join(process.cwd(), 'node_modules', '.bin', 'next');

console.log('Next.js binary path:', nextBinPath);
console.log('Checking if Next.js binary exists:');

const fs = require('fs');
try {
  if (fs.existsSync(nextBinPath)) {
    console.log('Next.js binary found!');
  } else {
    console.log('Next.js binary not found!');
    // List .bin directory contents
    console.log('Contents of .bin directory:');
    const binDir = path.join(process.cwd(), 'node_modules', '.bin');
    if (fs.existsSync(binDir)) {
      fs.readdirSync(binDir).forEach(file => {
        console.log('- ' + file);
      });
    } else {
      console.log('No .bin directory found.');
    }
  }
} catch(err) {
  console.error('Error checking for Next.js binary:', err);
}

// Try running the next dev command
try {
  const nextProcess = spawn(nextBinPath, ['dev'], {
    stdio: 'inherit',
    shell: true
  });

  nextProcess.on('close', (code) => {
    console.log(`Next.js process exited with code ${code}`);
  });
} catch (error) {
  console.error('Failed to start Next.js development server:', error);
}
