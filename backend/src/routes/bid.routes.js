const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bid.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorizeRoles('vendor'), bidController.createBid);
router.get('/rfq/:rfqId', authenticate, bidController.getBidsByRFQ);
router.get('/my-bids', authenticate, authorizeRoles('vendor'), bidController.getMyBids);
router.get('/:id', authenticate, bidController.getBidById);
router.put('/:id', authenticate, authorizeRoles('vendor'), bidController.updateBid);
router.patch('/:id/status', authenticate, authorizeRoles('customer'), bidController.updateBidStatus);
router.patch('/:id/withdraw', authenticate, authorizeRoles('vendor'), bidController.withdrawBid);

module.exports = router;