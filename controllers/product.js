const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

// @desc      Add product
// @route     POST /api/v1/product/add
// @access    Private
exports.addProduct = asyncHandler(async (req, res, next) => {

  // Upload image to cloudinary
  const result = await cloudinary.uploader.upload(req.file.path);

  const {title, desc, categories, size, color, price, seller} = req.body;

  const product = await Product.create({
    title, 
    desc, 
    img: result.secure_url, 
    cloudinary_id: result.public_id,
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
  let fieldsToUpdate = {
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

// @desc      Update product image
// @route     PUT /api/v1/product/update-image/:id
// @access    Private
exports.updateProductImage = asyncHandler (async (req, res, next) => {

  let product = await Product.findById(req.params.id);
  // Delete image from cloudinary
  await cloudinary.uploader.destroy(product.cloudinary_id);
  // Upload image to cloudinary
  let result = await cloudinary.uploader.upload(req.file.path);
  let fieldsToUpdate = {
    img: result.secure_url, 
    cloudinary_id: result.public_id
  }

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

    // Delete image from cloudinary
    await cloudinary.uploader.destroy(product.cloudinary_id);

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

// @desc      Get product by id - seller
// @route     GET /api/v1/product/get-by-id-seller/:id
// @access    Private
exports.getProductByIdSeller = asyncHandler (async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res
      .status(400)
      .json({ success: false, message: "Product doesn't exist" });
  }

  if (!product.seller.equals(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "Not authorised to perform this action",
    });
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

// @desc      Get all products - seller
// @route     GET /api/v1/product/get-all-seller
// @access    Private
exports.getAllProductsSeller = asyncHandler (async (req, res, next) => {
  const products = await Product.find({seller: req.user._id});

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