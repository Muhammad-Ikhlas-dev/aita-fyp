const express = require('express');

const router = express.Router();

// GET /api/health — health check; returns { status: 'ok' }
router.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = router;
