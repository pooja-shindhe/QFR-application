const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorizeRoles('customer'), contractController.createContract);
router.get('/', authenticate, contractController.getAllContracts);
router.get('/:id', authenticate, contractController.getContractById);
router.put('/:id', authenticate, authorizeRoles('customer'), contractController.updateContract);
router.patch('/:id/status', authenticate, authorizeRoles('customer'), contractController.updateContractStatus);
router.delete('/:id', authenticate, authorizeRoles('customer'), contractController.deleteContract);

module.exports = router;