const express = require('express');
const { 
  addOrder,
  deleteOrderBuyer,
  deleteOrderSeller,
  getOrderByIdBuyer,
  getOrderByIdSeller,
  getAllOrdersBuyer,
  getAllOrdersSeller,
  updateOrder
} = require('../controllers/order');

const router = express.Router();

const {protect} = require('../middleware/userAuth');

router.post('/add/:id', protect, addOrder);
router.delete('/delete-buyer/:id', protect, deleteOrderBuyer);
router.delete('/delete-seller/:id', protect, deleteOrderSeller);
router.get('/get-by-id-buyer/:id', protect, getOrderByIdBuyer);
router.get('/get-by-id-seller/:id', protect, getOrderByIdSeller);
router.get('/get-all-buyer', protect, getAllOrdersBuyer);
router.get('/get-all-seller', protect, getAllOrdersSeller);
router.put('/update/:id', protect, updateOrder);

module.exports = router;