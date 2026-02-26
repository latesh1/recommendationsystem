const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const auth = require('../middleware/auth');

router.post('/track', interactionController.trackInteraction);
router.post('/search', interactionController.trackSearch);

module.exports = router;
