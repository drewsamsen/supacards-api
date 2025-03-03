// Simple test endpoint for Vercel
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
}; 