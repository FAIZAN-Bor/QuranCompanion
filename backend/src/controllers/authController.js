const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists (verified or pending)
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    let user;
    if (existingUser && !existingUser.isEmailVerified) {
      // User exists but not verified, update their data
      user = existingUser;
      user.name = name;
      user.password = password;
      user.role = role;
    } else {
      // Create new pending user
      user = await User.create({
        name,
        email,
        password,
        role,
        isEmailVerified: false
      });
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      data: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Send welcome email (optional, don't wait for it)
    sendWelcomeEmail(email, user.name).catch(err => console.error(err));

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          coins: user.coins,
          proficiencyLevel: user.proficiencyLevel,
          currentLevel: user.currentLevel
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // TEMPORARILY DISABLED: Email verification check for testing
    // if (!user.isEmailVerified) {
    //   // Generate new OTP
    //   const otp = user.generateOTP();
    //   await user.save();
    //   
    //   // Send OTP
    //   await sendOTPEmail(email, otp, user.name);
    //
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Email not verified. A new OTP has been sent to your email.',
    //     requiresVerification: true
    //   });
    // }

    // Update streak and clear any OTP fields
    user.updateStreak();
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          coins: user.coins,
          proficiencyLevel: user.proficiencyLevel,
          currentLevel: user.currentLevel,
          streakDays: user.streakDays,
          accuracy: user.accuracy,
          totalLessonsCompleted: user.totalLessonsCompleted
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          coins: user.coins,
          proficiencyLevel: user.proficiencyLevel,
          currentLevel: user.currentLevel,
          totalLessonsCompleted: user.totalLessonsCompleted,
          totalQuizzesCompleted: user.totalQuizzesCompleted,
          accuracy: user.accuracy,
          streakDays: user.streakDays,
          lastActiveDate: user.lastActiveDate,
          notificationSettings: user.notificationSettings
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // Since we're using JWT, logout is handled client-side by removing token
    // We can optionally add token to blacklist here if needed
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire time (10 minutes)
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    
    await user.save({ validateBeforeSave: false });

    // Send email with reset token
    try {
      await sendPasswordResetEmail(email, resetToken, user.name);
      
      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email',
        data: {
          resetToken // Only for testing - remove in production
        }
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Hash the token from params
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
};
