const express = require('express');
const { 
  addOrder,
  deleteOrder,
  getOrderById,
  getAllOrders
} = require('../controllers/order');

const router = express.Router();

const {protect} = require('../middleware/userAuth');

router.post('/add/:id', protect, addOrder);
router.delete('/delete/:id', protect, deleteOrder);
router.get('/get-by-id/:id', protect, getOrderById);
router.get('/get-all', protect, getAllOrders);

module.exports = router;