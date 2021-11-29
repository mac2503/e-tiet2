const express = require('express');
const { 
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts
} = require('../controllers/product');

const router = express.Router();

const {protect} = require('../middleware/userAuth');

router.post('/add', protect, addProduct);
router.put('/update/:id', protect, updateProduct);
router.delete('/delete/:id', protect, deleteProduct);
router.get('/get-by-id/:id', getProductById);
router.get('/get-all', getAllProducts);

module.exports = router;