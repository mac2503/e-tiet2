const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Product = require('../models/Product');

// @desc      Add product
// @route     POST /api/v1/product/add
// @access    Private
exports.addProduct = asyncHandler(async (req, res, next) => {

  const {title, desc, img, categories, size, color, price, seller} = req.body;

  const product = await Product.create({
    title, 
    desc, 
    img, 
    categories, 
    size, 
    color, 
    price, 
    seller: req.user._id
  });

  res.status(200).json({success: true, data: product});
});

// @desc      Update product details
// @route     PUT /api/v1/product/update/:id
// @access    Private
exports.updateProduct = asyncHandler (async (req, res, next) => {
  const fieldsToUpdate = {
    title: req.body.title,
    desc: req.body.desc,
    img: req.body.img, 
    categories: req.body.categories, 
    size: req.body.size, 
    color: req.body.color, 
    price: req.body.price
  }
  let product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product doesn't exist" });
    }
  // Check if the person updating is the seller of the product
  if (product.seller != (req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "Not authorised to perform this action",
    });
  }
  product = await Product.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc     Delete product
// @route    DELETE /api/v1/product/delete/:id
// @access   Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product doesn't exist" });
    }

    // Check if the person deleting is the seller of the product
    if (!product.seller.equals(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Not authorised to perform this action",
      });
    }

    await product.remove();

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

// @desc      Get product by id
// @route     GET /api/v1/product/get-by-id/:id
// @access    Public
exports.getProductById = asyncHandler (async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res
      .status(400)
      .json({ success: false, message: "Product doesn't exist" });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc      Get all products
// @route     GET /api/v1/product/get-all
// @access    Public
exports.getAllProducts = asyncHandler (async (req, res, next) => {
  const products = await Product.find({});

  if (!products) {
    return res
      .status(400)
      .json({ success: false, message: "Products doesn't exist" });
  }

  res.status(200).json({
    success: true,
    data: products
  });
});