// netlify/functions/map-proxy.js
// Serverless function to proxy map tile requests

const https = require('https');
const url = require('url');

exports.handler = async function(event) {
  // Get the requested map URL from the query parameter
  const mapUrl = event.queryStringParameters.url;
  
  if (!mapUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No URL provided' })
    };
  }
  
  // Parse the URL
  const parsedUrl = url.parse(mapUrl);
  
  // Verify it's a map resource we want to proxy
  const allowedDomains = [
    'openstreetmap.org',
    'openfreemap.org',
    'tiles.openfreemap.org'
  ];
  
  const isAllowed = allowedDomains.some(domain => parsedUrl.hostname.includes(domain));
  
  if (!isAllowed) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Domain not allowed' })
    };
  }
  
  try {
    // Fetch the remote resource
    const response = await new Promise((resolve, reject) => {
      const req = https.get(mapUrl, (res) => {
        let body = [];
        res.on('data', (chunk) => body.push(chunk));
        res.on('end', () => {
          const responseBody = Buffer.concat(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseBody
          });
        });
      });
      
      req.on('error', (e) => reject(e));
      req.end();
    });
    
    // Return the proxied response with CORS headers
    return {
      statusCode: response.statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers['content-type'] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400'
      },
      body: response.body.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy request failed' })
    };
  }
};
