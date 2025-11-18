const Contract = require('../models/Contract');
const RFQ = require('../models/RFQ');
const Bid = require('../models/Bid');

exports.createContract = async (req, res) => {
  try {
    const { rfqId, bidId } = req.body;

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.customerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create contract for this RFQ'
      });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    if (bid.rfqId.toString() !== rfqId) {
      return res.status(400).json({
        success: false,
        message: 'Bid does not belong to this RFQ'
      });
    }

    const existingContract = await Contract.findOne({ rfqId, bidId });
    if (existingContract) {
      return res.status(400).json({
        success: false,
        message: 'Contract already exists for this bid'
      });
    }

    const contract = await Contract.create({
      ...req.body,
      customerId: req.userId,
      vendorId: bid.vendorId
    });

    rfq.status = 'awarded';
    await rfq.save();

    bid.status = 'accepted';
    await bid.save();

    await Bid.updateMany(
      { rfqId, _id: { $ne: bidId } },
      { status: 'rejected' }
    );

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllContracts = async (req, res) => {
  try {
    let filter = {};

    if (req.userRole === 'customer') {
      filter.customerId = req.userId;
    } else if (req.userRole === 'vendor') {
      filter.vendorId = req.userId;
    }

    const contracts = await Contract.find(filter)
      .populate('rfqId', 'title rfqNumber')
      .populate('bidId', 'quotedPrice')
      .populate('customerId', 'name company')
      .populate('vendorId', 'name company')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: contracts.length,
      data: contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('rfqId')
      .populate('bidId')
      .populate('customerId', 'name company email phone')
      .populate('vendorId', 'name company email phone');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (
      contract.customerId._id.toString() !== req.userId.toString() &&
      contract.vendorId._id.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this contract'
      });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateContract = async (req, res) => {
  try {
    let contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (contract.customerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this contract'
      });
    }

    contract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Contract updated successfully',
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateContractStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (contract.customerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update contract status'
      });
    }

    contract.status = status;
    await contract.save();

    res.json({
      success: true,
      message: 'Contract status updated successfully',
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (contract.customerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this contract'
      });
    }

    await contract.deleteOne();

    res.json({
      success: true,
      message: 'Contract deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};