// netlify.js - Helper script for Netlify deployment
// This file helps debug Netlify build issues

console.log('Netlify build environment:');
console.log('Node version:', process.version);
console.log('Environment variables:', Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('TOKEN')));
console.log('Working directory:', process.cwd());

// List build directories
const fs = require('fs');
const path = require('path');

const listDir = (dir) => {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    console.log(`\nContents of ${dir}:`);
    items.forEach(item => {
      console.log(`  ${item.isDirectory() ? '[DIR]' : '[FILE]'} ${item.name}`);
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
};

// List key directories
listDir('.');
listDir('./out');

console.log('\nNetlify build script completed');
