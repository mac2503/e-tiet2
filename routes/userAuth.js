const express = require('express');
const { 
  register, 
  login, 
  verifyOtp,
  regenerateOtp,
  getMe, 
  forgotPassword,  
  updateDetails,
  updatePassword,
  resetPassword
} = require('../controllers/userAuth');

const router = express.Router();

const {protect} = require('../middleware/userAuth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', protect, verifyOtp);
router.put('/regenerate-otp', protect, regenerateOtp);
router.get('/me', protect, getMe);
router.put('/update-details', protect, updateDetails);
router.put('/update-password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router;