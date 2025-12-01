// const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateTokens, verifyRefreshToken, revokeRefreshToken } = require('../services/tokenService');
const { createOrUpdateSession } = require('../services/sessionService');
const AuthService = require('../services/authService');
const { generateOTP, storeEmailVerificationOTP, verifyEmailVerificationOTP } = require('../services/otpService');
const sendEmail = require('../utils/sendEmail');
const apiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = catchAsync(async (req, res, next) => {
  const { email, phone, password, firstName, lastName, referralCode } = req.body;
  const deviceInfo = req.headers['user-agent'];
  const ip = req.ip;

  // Start a session for transaction
  const session = await mongoose.startSession();
  
  try {
    // Start transaction
    await session.startTransaction();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    }).session(session);

    if (existingUser) {
      throw apiError(existingUser.email === email 
        ? 'Email already registered' 
        : 'Phone number already registered', 400);
    }

    // Check referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode }).session(session);
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Generate unique referral code
    const newReferralCode = `REF${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create new user
    const user = new User({
      email,
      phone,
      password,
      firstName,
      lastName,
      referralCode: newReferralCode,
      referredBy
    });

    await user.save({ session });
    
    // Create session
    const userSession = await createOrUpdateSession({ userId: user._id, deviceInfo, ip }, session);
    
    // Generate tokens
    const token = await generateTokens(user, deviceInfo);

    // Construct full name for email
    const fullName = `${user.firstName} ${user.lastName}`;

    // Send welcome email (outside transaction - non-critical)
    // We'll send this after commit to avoid rolling back for email failures
    
    // Commit the transaction
    await session.commitTransaction();

    // Now send the email after successful commit
    // If email fails, user is still created (which is usually desired)
    try {
      await sendEmail(
        user.email,
        'Welcome to Gin by Ginoid ✨',
        null,
        `
        <div style="font-family: Arial, sans-serif; color:#222; padding:20px; background:#fafafa;">
          <table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:30px;">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0; font-size:22px; font-weight:700; color:#000;">
                  Welcome to Gin by Ginoid, ${fullName.toUpperCase()}!
                </h2>
              </td>
            </tr>

            <tr>
              <td style="font-size:15px; line-height:1.6; color:#444;">
                <p>We're thrilled to welcome you to the Gin by Ginoid family!</p>
                <p>Beauty isn't just a look — it's a lifestyle, and you're now part of a community that believes in elegance, confidence, and premium hair care experiences tailored for you.</p>
              </td>
            </tr>

            <tr>
              <td style="padding-top:20px;">
                <p style="font-size:15px; font-weight:600; margin-bottom:10px; color:#2d3748;">
                  What comes next:
                </p>

                <p style="font-size:14px; line-height:1.6; color:#666;">
                  • Early access to premium hair products <br/>
                  • Styling tips & beauty inspiration <br/>
                  • VIP alerts for special offers and events <br/>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding-top:25px; font-size:14px; color:#666;">
                <p>We can't wait to bring out your finest look yet.</p>
                <p>Welcome once again — stay classy, stay beautiful.</p>
              </td>
            </tr>

            <tr>
              <td style="font-size:13px; line-height:1.6; color:#888; padding-top:25px; border-top:1px solid #eee;">
                <p style="margin:0;">With grace & glamour,<br/><strong>Gin by Ginoid Team</strong></p>
              </td>
            </tr>
          </table>
        </div>
        `
      );
    } catch (emailError) {
      // Log email error but don't fail the registration
      console.error('Failed to send welcome email:', emailError);
      // Optionally, queue email for retry
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token: token.accessToken,
      }
    });

  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const deviceInfo = req.headers['user-agent'];
  const ip = req.ip;
  console.log('Login attempt:', { email,password, deviceInfo, ip });

  // Find user by credentials
  const user = await User.findByCredentials(email, password);
  const session = await createOrUpdateSession({ userId: user._id, deviceInfo, ip });

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = await generateTokens(user, deviceInfo);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.cookie('refreshToken', token.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token: token.accessToken,
    }
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw apiError('Refresh token is required', 401);
  }

  const decoded = await verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    throw apiError('Invalid refresh token', 401);
  }

  const tokens = await generateTokens(user, decoded.deviceId);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token: tokens.accessToken
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('-password');
  res.json({
    success: true,
    data: { user }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// const updateProfile = catchAsync(async (req, res, next) => {
//   const { phone, address,  } = req.body;
//   const updateData = {};

//   // Only update provided fields
//   if (firstName) updateData.firstName = firstName;
//   if (lastName) updateData.lastName = lastName;
//   if (phone) updateData.phone = phone;
//   if (address) updateData.address = address;
//   // if (bankDetails) updateData.bankDetails = bankDetails;

//   // Check if phone number is already taken by another user
//   if (phone) {
//     const existingUser = await User.findOne({ 
//       phone, 
//       _id: { $ne: req.user._id } 
//     });
    
//     if (existingUser) {
//       throw apiError('Phone number already registered by another user', 400);
//     }
//   }

//   const user = await User.findByIdAndUpdate(
//     req.user._id,
//     updateData,
//     { new: true, runValidators: true }
//   ).select('-password');

//   res.json({
//     success: true,
//     message: 'Profile updated successfully',
//     data: { user }
//   });
// });

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw apiError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword= catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);    
  res.json({
    success: true,
    message: result.message
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = catchAsync(async (req, res, next) => {
  const { otp, newPassword, email } = req.body;
  if (!email) {
    throw apiError('Email is required', 400);
  }

  const result = await AuthService.resetPassword(otp, newPassword, email);

  res.json({
    success: true,
    message: result.message
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  try {
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Private
const verifyEmail = catchAsync(async (req, res, next) => {
  const { otp,email:emailBody } = req.body;
  const { token, email:emailQuery } = req.query;
  if(!token && !otp){
    throw apiError('Verification token or OTP is required', 400);
  }

  const user = await User.findOne({ email:emailQuery || emailBody }) 
  if(!user){
    throw apiError('User not found', 404);
  }
  const isValidOTP = await verifyEmailVerificationOTP(otp,token,user.email);
  if(!isValidOTP){
    throw apiError('Invalid OTP or Token', 400);
  }

  user.isVerified = true;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerificationEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if(!user){
    throw apiError('User not found', 404);
  }

  if (user.isVerified) {
    throw apiError('Email is already verified', 400);
  }

  // Generate new verification token
  const verificationToken = uuidv4();
  const otp = await generateOTP();
  await storeEmailVerificationOTP(otp,verificationToken,user.email);

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
  await sendEmail(user.email, 'Verify Your Email',null, `
      <h2>Hello ${user.firstName} ${user.lastName},</h2>
      <p>Use the OTP below to verify your email:</p>
      <h3>${otp}</h3>
      <p>Or simply click the link below:</p>
      <a href="${verificationLink}"><strong>Verify My Email</strong></a>
      <p>This link and code expire in 10 minutes.</p>
    `);
  console.log(verificationLink);

  res.json({
    success: true,
    message: 'Verification email sent',
    data: {
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
    }
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  // updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  verifyEmail,
  resendVerificationEmail
}; 