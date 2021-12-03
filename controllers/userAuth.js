const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const otpGenerator = require("otp-generator");
const User = require('../models/User');

// @desc      Register User
// @route     POST /api/v1/user/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, phone, rollno, email, password, hostel } = req.body;

  let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json('user already exists');
    }
    
    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
    });
    const newValue = { name, phone, rollno, email, password, hostel, otp: { code: otp } }

    user = await User.create(newValue);

    const message = `Thanks for registering! We need you to verify your email first. You can do so by entering ${user.otp.code}. This code is valid for only next 15 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verification OTP',
      message
    });
    sendTokenResponse(user, 200, res);

  } catch (err) {
    console.log(err);
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc      Login User
// @route     POST /api/v1/user/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc     Verify Otp
// @route    POST /api/v1/user/verify-otp
// @access   Private
exports.verifyOtp = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id);
    const { otp } = req.body;

    if (user.verified === true) {
      return next(new ErrorResponse('Already verified', 400));
    }

    // Check if otp matches
    const isMatch = await user.matchOtp(otp);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid otp', 401));
    }

    const currentTime = new Date(Date.now());
    if (user.otp.validity < currentTime) {
      return next(new ErrorResponse('OTP has expired', 400));
    }

    user.verified = true;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ message: "Sucessfully Verified" });
});

// @desc     Regenerate Otp
// @route    PUT /api/v1/user/regenerate-otp
// @access   Private
exports.regenerateOtp = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'User does not exist' }] });
    }

    // if user is already verified
    if (user.verified === true) {
      return res.status(400).json({ errors: [{ msg: 'User already verified' }] });
    }

    user.otp.code = undefined;
    user.otp.validity = undefined;
    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
    });

    const validity = new Date(Date.now() + 15 * 60 * 1000);
    user.otp.code = otp;
    user.otp.validity = validity;
    await user.save({ validateBeforeSave: false });

    const message = `Thanks for registering! We need you to verify your email first. You can do so by entering ${user.otp.code}. This code is valid for only next 15 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verification OTP',
        message
      });

      sendTokenResponse(user, 200, res);
      
    } catch (err) {
      console.log(err);
      return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc      Get current logged in user
// @route     GET /api/v1/user/me
// @access    Private
exports.getMe = asyncHandler (async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update user details
// @route     PUT /api/v1/user/update-details
// @access    Private
exports.updateDetails = asyncHandler (async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    rollno: req.body.rollno,
    email: req.body.email,
    hostel: req.body.hostel
  }
  
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update password
// @route     GET /api/v1/user/update-password
// @access    Private
exports.updatePassword = asyncHandler (async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if(!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Forgot password
// @route     POST /api/v1/user/forgot-password
// @access    Public
exports.forgotPassword = asyncHandler (async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({validateBeforeSave: false});

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/user/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of 
  a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }

});

// @desc      Reset password
// @route     PUT /api/v1/user/reset-password/:resetToken
// @access    Public
exports.resetPassword = asyncHandler (async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
  .createHash('sha256')
  .update(req.params.resetToken)
  .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next (new ErrorResponse ('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie & send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
  .status(statusCode)
  .cookie('token', token, options)
  .json({
    success: true,
    token
  });
}