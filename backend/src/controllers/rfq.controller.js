const RFQ = require('../models/RFQ');
const User = require('../models/User');

exports.createRFQ = async (req, res) => {
  try {
    const customer = await User.findById(req.userId);
    
    const rfqData = {
      ...req.body,
      customerId: req.userId,
      customerName: customer.name
    };

    const rfq = await RFQ.create(rfqData);

    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllRFQs = async (req, res) => {
  try {
    const { status, category } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    const rfqs = await RFQ.find(filter)
      .populate('customerId', 'name company email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rfqs.length,
      data: rfqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getOpenRFQs = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const rfqs = await RFQ.find({
      status: 'open',
      endDate: { $gte: currentDate }
    })
    .populate('customerId', 'name company email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rfqs.length,
      data: rfqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyRFQs = async (req, res) => {
  try {
    const rfqs = await RFQ.find({ customerId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rfqs.length,
      data: rfqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('customerId', 'name company email phone');

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    res.json({
      success: true,
      data: rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateRFQ = async (req, res) => {
  try {
    let rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.customerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this RFQ'
      });
    }

    rfq = await RFQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'RFQ updated successfully',
      data: rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.customerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this RFQ'
      });
    }

    await rfq.deleteOne();

    res.json({
      success: true,
      message: 'RFQ deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.closeRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.customerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to close this RFQ'
      });
    }

    rfq.status = 'closed';
    await rfq.save();

    res.json({
      success: true,
      message: 'RFQ closed successfully',
      data: rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};