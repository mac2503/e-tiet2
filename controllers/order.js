const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc      Add order - buyer
// @route     POST /api/v1/order/add/:id
// @access    Private
exports.addOrder = asyncHandler(async (req, res, next) => {

  const {paymentType} = req.body;
  let product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product doesn't exist" });
    }

    let buyer = await User.findById(req.user._id);

    if (buyer == product.seller) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

  const order = await Order.create({
    itemId: req.params.id,
    buyer: req.user._id,
    seller: product.seller,
    buyerPhone: buyer.phone,
    buyerAddress: buyer.hostel, 
    paymentType, 
    totalAmount: product.price
  });

  res.status(200).json({success: true, data: order});
});

// @desc     Delete order - buyer
// @route    DELETE /api/v1/order/delete-buyer/:id
// @access   Private
exports.deleteOrderBuyer = asyncHandler(async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order doesn't exist" });
    }

    // Check if the person deleting is the one who placed the order
    if (!order.buyer.equals(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Not authorised to perform this action",
      });
    }

    await order.remove();

    res.status(200).json({
      success: true,
      data: "Successfully deleted",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      data: err,
    });
  }
});

// @desc     Delete order - seller
// @route    DELETE /api/v1/order/delete-seller/:id
// @access   Private
exports.deleteOrderSeller = asyncHandler(async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order doesn't exist" });
    }

    // Check if the person deleting is the seller
    if (!order.seller.equals(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Not authorised to perform this action",
      });
    }

    await order.remove();

    res.status(200).json({
      success: true,
      data: "Successfully deleted",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      data: err,
    });
  }
});

// @desc      Get order by id - buyer
// @route     GET /api/v1/order/get-by-id-buyer/:id
// @access    Private
exports.getOrderByIdBuyer = asyncHandler (async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res
      .status(400)
      .json({ success: false, message: "Order doesn't exist" });
  }

  if (!order.buyer.equals(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "Not authorised to perform this action",
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc      Get order by id - seller
// @route     GET /api/v1/order/get-by-id-seller/:id
// @access    Private
exports.getOrderByIdSeller = asyncHandler (async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res
      .status(400)
      .json({ success: false, message: "Order doesn't exist" });
  }

  if (!order.seller.equals(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "Not authorised to perform this action",
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc      Get all orders - buyer
// @route     GET /api/v1/order/get-all-buyer
// @access    Private
exports.getAllOrdersBuyer = asyncHandler (async (req, res, next) => {
  const orders = await Order.find({buyer: req.user._id});

  if (!orders) {
    return res
      .status(400)
      .json({ success: false, message: "Orders doesn't exist" });
  }

  res.status(200).json({
    success: true,
    data: orders
  });
});

// @desc      Get all orders - seller
// @route     GET /api/v1/order/get-all-seller
// @access    Private
exports.getAllOrdersSeller = asyncHandler (async (req, res, next) => {
  const orders = await Order.find({seller: req.user._id});

  if (!orders) {
    return res
      .status(400)
      .json({ success: false, message: "Orders doesn't exist" });
  }

  res.status(200).json({
    success: true,
    data: orders
  });
});