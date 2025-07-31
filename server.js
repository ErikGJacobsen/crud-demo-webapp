// Disable SSL certificate validation globally for demos/development
// WARNING: This is not recommended for production use
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const moment = require('moment');
const https = require('https');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;
const IP = process.env.IP || '0.0.0.0';

// API URL - update this to point to your deployed API
const API_URL = process.env.API_URL || 'https://crud-demo-api-git-erikfirsttest.apps.dekradk.dekra.nu';

// Note: SSL certificate validation is already disabled globally at the top of the file
// This agent is kept for additional safety
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/plan', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'plan.html'));
});

// API proxy routes
app.get('/api/items', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/api/items`, { httpsAgent });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching items:', error.message);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/api/items/${req.params.id}`, { httpsAgent });
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching item ${req.params.id}:`, error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    // Validate date format
    if (!moment(req.body.date, 'DD-MM-YYYY', true).isValid()) {
      return res.status(400).json({ error: 'Date must be in dd-mm-yyyy format' });
    }
    
    const response = await axios.post(`${API_URL}/api/items`, req.body, { httpsAgent });
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating item:', error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    // Validate date format
    if (!moment(req.body.date, 'DD-MM-YYYY', true).isValid()) {
      return res.status(400).json({ error: 'Date must be in dd-mm-yyyy format' });
    }
    
    const response = await axios.put(`${API_URL}/api/items/${req.params.id}`, req.body, { httpsAgent });
    res.json(response.data);
  } catch (error) {
    console.error(`Error updating item ${req.params.id}:`, error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${API_URL}/api/items/${req.params.id}`, { httpsAgent });
    res.json(response.data);
  } catch (error) {
    console.error(`Error deleting item ${req.params.id}:`, error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Health check endpoint for OpenShift
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, IP, () => {
  console.log(`Web frontend is running on ${IP}:${PORT}`);
  console.log(`Connected to API at: ${API_URL}`);
  console.log('SSL certificate validation is disabled for development purposes');
});
