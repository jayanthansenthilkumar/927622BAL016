const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const NumberService = require('./numberService');

const app = express();
const PORT = process.env.PORT || 3000;
const WINDOW_SIZE = parseInt(process.env.WINDOW_SIZE) || 10;
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS) || 500;
const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:3001';
const API_BASE_URL = process.env.API_BASE_URL || 'http://20.244.56.144/evaluation-service';
const AUTH_URL = process.env.AUTH_URL || 'http://20.244.56.144/evaluation-service/auth';

// Initialize number service with both test server and API endpoints
const numberService = new NumberService(
  TEST_SERVER_URL, 
  TIMEOUT_MS, 
  WINDOW_SIZE,
  API_BASE_URL,
  AUTH_URL
);
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.get('/js/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`window.APP_CONFIG = {
    WINDOW_SIZE: ${WINDOW_SIZE}
  };`);
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  if (!['p', 'f', 'e', 'r'].includes(numberid)) {
    return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
  }
  try {
    const result = await numberService.fetchNumbers(numberid);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error processing request:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running properly' });
});
app.listen(PORT, () => {
  console.log(`Average Calculator service is running on port ${PORT}`);
  console.log(`Window size is set to ${WINDOW_SIZE}`);
  console.log(`Request timeout is set to ${TIMEOUT_MS}ms`);
});