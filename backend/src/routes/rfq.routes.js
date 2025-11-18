const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfq.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorizeRoles('customer'), rfqController.createRFQ);
router.get('/', authenticate, rfqController.getAllRFQs);
router.get('/open', authenticate, rfqController.getOpenRFQs);
router.get('/my-rfqs', authenticate, authorizeRoles('customer'), rfqController.getMyRFQs);
router.get('/:id', authenticate, rfqController.getRFQById);
router.put('/:id', authenticate, authorizeRoles('customer'), rfqController.updateRFQ);
router.delete('/:id', authenticate, authorizeRoles('customer'), rfqController.deleteRFQ);
router.patch('/:id/close', authenticate, authorizeRoles('customer'), rfqController.closeRFQ);

module.exports = router;