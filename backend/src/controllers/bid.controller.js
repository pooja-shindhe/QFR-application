const Bid = require('../models/Bid');
const RFQ = require('../models/RFQ');
const User = require('../models/User');

exports.createBid = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.body.rfqId);
    
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'RFQ is not open for bidding'
      });
    }

    if (new Date() > rfq.endDate) {
      return res.status(400).json({
        success: false,
        message: 'RFQ bidding period has ended'
      });
    }

    const existingBid = await Bid.findOne({
      rfqId: req.body.rfqId,
      vendorId: req.userId
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a bid for this RFQ'
      });
    }

    const vendor = await User.findById(req.userId);

    const bid = await Bid.create({
      ...req.body,
      vendorId: req.userId,
      vendorName: vendor.name,
      vendorCompany: vendor.company
    });

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBidsByRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.rfqId);
    
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.customerId.toString() !== req.userId.toString() && req.userRole !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bids'
      });
    }

    let filter = { rfqId: req.params.rfqId };
    
    if (req.userRole === 'vendor') {
      filter.vendorId = req.userId;
    }

    const bids = await Bid.find(filter)
      .populate('vendorId', 'name company email phone')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ vendorId: req.userId })
      .populate('rfqId', 'title rfqNumber status endDate')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBidById = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('rfqId', 'title rfqNumber description')
      .populate('vendorId', 'name company email phone');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    res.json({
      success: true,
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateBid = async (req, res) => {
  try {
    let bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    if (bid.vendorId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bid'
      });
    }

    if (bid.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update bid that is under review or processed'
      });
    }

    bid = await Bid.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Bid updated successfully',
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateBidStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const bid = await Bid.findById(req.params.id).populate('rfqId');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    if (bid.rfqId.customerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update bid status'
      });
    }

    bid.status = status;
    await bid.save();

    res.json({
      success: true,
      message: 'Bid status updated successfully',
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    if (bid.vendorId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this bid'
      });
    }

    bid.status = 'withdrawn';
    await bid.save();

    res.json({
      success: true,
      message: 'Bid withdrawn successfully',
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};