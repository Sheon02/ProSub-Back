import app from './server.js'; // Import from server.js instead of index.js
import { createServer } from 'http';

export default (req, res) => {
  // Enhanced CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token'
  );
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    return res.status(200).end();
  }
  
  return createServer(app).listen(req, res);
};