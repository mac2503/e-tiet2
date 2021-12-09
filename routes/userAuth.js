const express = require('express');
const upload = require("../utils/multer");
const { 
  register, 
  login, 
  verifyOtp,
  regenerateOtp,
  getMe, 
  forgotPassword,  
  updateDetails,
  updatePassword,
  updateProfilePicture,
  removeProfilePicture,
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
router.put('/update-profile-picture', protect, upload.single('image'), updateProfilePicture);
router.delete('/remove-profile-picture', protect, removeProfilePicture);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router;