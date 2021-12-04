const stripe = require("stripe")(process.env.STRIPE_KEY);
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

    if (req.user._id.equals(product.seller)) {
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
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order doesn't exist" });
    }

    // Check if the person deleting is the one who placed the order
    if (!(order.buyer.equals(req.user.id))) {
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
});

// @desc     Delete order - seller
// @route    DELETE /api/v1/order/delete-seller/:id
// @access   Private
exports.deleteOrderSeller = asyncHandler(async (req, res, next) => {
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

// @desc      Update order - seller
// @route     PUT /api/v1/order/update/:id
// @access    Private
exports.updateOrder = asyncHandler (async (req, res, next) => {
  const fieldsToUpdate = {
    status: req.body.status
  }
  let order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order doesn't exist" });
    }

  // Check if the person updating is the seller
  if (order.seller != (req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "Not authorised to perform this action",
    });
  }
  order = await Order.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc      Make payment - buyer
// @route     POST /api/v1/order/make-payment/:id
// @access    Private
exports.addPayment = asyncHandler(async (req, res, next) => {

  let order = await Order.findById(req.params.id);

  if (!order.buyer.equals(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "Not authorised to perform this action",
    });
  }

  let user = await User.findById(req.user._id);
  let product = await Product.findById(order.itemId);

  stripe.customers.create({ 
    email: user.email, 
    source: 'tok_mastercard', 
    name: user.name, 
    address: { 
        line1: user.hostel, 
        postal_code: '147004', 
        city: 'Patiala', 
        state: 'Punjab', 
        country: 'India', 
    } 
}) 
.then((customer) => { 

    return stripe.charges.create({ 
        amount: (order.totalAmount)*100,
        description: product.title, 
        currency: 'INR', 
        customer: customer.id 
    }); 
}).then((charge) => { 
  return res
      .status(200)
      .json({ success: true, message: "Payment successful" });
}).catch((err) => { 
  return res
      .status(400)
      .json({ success: false, message: "Payment failed" });
});
})