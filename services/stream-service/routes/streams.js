const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const auth = require('../middleware/auth');

router.post('/', auth, streamController.createStream);
router.get('/', streamController.getAllStreams);
router.get('/:id', streamController.getStreamById);
router.patch('/:id/status', auth, streamController.updateStreamStatus);

module.exports = router;
