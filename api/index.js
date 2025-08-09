import('../dist/index.js').then(mod => {
  module.exports = mod.default || mod;
}).catch(err => {
  console.error('Failed to load server:', err);
  module.exports = (req, res) => {
    res.status(500).json({ error: 'Server initialization failed', details: err.message });
  };
});