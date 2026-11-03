const express = require('express');
const router = express.Router();

// Placeholder for inventory routes
router.get('/', (req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'This API endpoint is not available. Use the supported Firebase data service.' });
});

module.exports = router;
