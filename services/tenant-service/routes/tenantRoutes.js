const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

router.post('/register', tenantController.registerTenant);
router.get('/lookup/:apiKey', tenantController.getTenantByApiKey);

module.exports = router;
