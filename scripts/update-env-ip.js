#!/usr/bin/env node
// Script to update .env with the current local IP address
const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const ip = getLocalIp();
const jsonPath = path.resolve(process.cwd(), './backend-ip.json');
const jsonContent = JSON.stringify({ ip }, null, 2) + '\n';
fs.writeFileSync(jsonPath, jsonContent, 'utf-8');
console.log(`BACKEND_IP (${ip}) written to ${jsonPath}`);
