const express = require('express');
const upload = require("../utils/multer");
const { 
  addProduct,
  updateProduct,
  updateProductImage,
  deleteProduct,
  getProductById,
  getProductByIdSeller,
  getAllProducts,
  getAllProductsSeller
} = require('../controllers/product');

const router = express.Router();

const {protect} = require('../middleware/userAuth');

router.post('/add', protect, upload.single('img'), addProduct);
router.put('/update/:id', protect, updateProduct);
router.put('/update-image/:id', protect, upload.single('img'), updateProductImage);
router.delete('/delete/:id', protect, deleteProduct);
router.get('/get-by-id/:id', getProductById);
router.get('/get-by-id-seller/:id', protect, getProductByIdSeller);
router.get('/get-all', getAllProducts);
router.get('/get-all-seller', protect, getAllProductsSeller);

module.exports = router;