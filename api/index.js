// Vercel serverless function entry point
const app = require('../dist/index').default;

module.exports = (req, res) => {
  // Forward the request to the Express app
  return app(req, res);
}; 