// middleware/apiKeyAuth.js
require('dotenv').config();
const validApiKeys = process.env.VALID_API_KEYS?.split(',') || []; // e.g., "key1,key2"

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ success: false, message: 'Invalid or missing API key' });
  }
  next();
};

module.exports = apiKeyAuth;
