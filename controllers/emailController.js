import asyncHandler from 'express-async-handler';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/userModel.js';

// In-memory store for OTPs (replace with Redis in production)
const otpStore = new Map();

// @desc    Send welcome email
// @route   POST /api/email/welcome
// @access  Public
const sendWelcomeEmail = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    res.status(400);
    throw new Error('Please provide email and name');
  }

  const emailData = {
    sender: {
      name: process.env.EMAIL_SENDER_NAME || 'Your App Name',
      email: process.env.EMAIL_SENDER_ADDRESS || 'no-reply@yourapp.com',
    },
    to: [{ email, name }],
    subject: 'Welcome to Our App!',
    htmlContent: `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for registering with us.</p>
      <p>We're excited to have you on board.</p>
    `,
  };

  await sendBrevoEmail(emailData);

  res.json({ success: true, message: 'Welcome email sent successfully' });
});

// @desc    Send password reset OTP
// @route   POST /api/email/send-otp
// @access  Public
const sendPasswordResetOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide email');
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  const otpId = uuidv4();
  
  // Store OTP with 10-minute expiry
  otpStore.set(otpId, {
    email,
    otp,
    expiresAt: Date.now() + 600000 // 10 minutes
  });

  const emailData = {
    sender: {
      name: process.env.EMAIL_SENDER_NAME || 'Your App Name',
      email: process.env.EMAIL_SENDER_ADDRESS || 'no-reply@yourapp.com',
    },
    to: [{ email }],
    subject: 'Your Password Reset OTP',
    htmlContent: `
      <h1>Password Reset Request</h1>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await sendBrevoEmail(emailData);

  res.json({ 
    success: true, 
    otpId,
    message: 'OTP sent successfully' 
  });
});

// @desc    Verify OTP
// @route   POST /api/email/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { otpId, otp, email } = req.body;
  const storedOtp = otpStore.get(otpId);

  if (!storedOtp) {
    res.status(400);
    throw new Error('Invalid OTP request');
  }

  if (Date.now() > storedOtp.expiresAt) {
    otpStore.delete(otpId);
    res.status(400);
    throw new Error('OTP has expired');
  }

  if (storedOtp.otp !== parseInt(otp)) {
    res.status(400);
    throw new Error('Invalid OTP code');
  }

  if (storedOtp.email !== email) {
    res.status(400);
    throw new Error('Email does not match OTP request');
  }

  // Mark OTP as verified but don't delete it yet (needed for password reset)
  otpStore.set(otpId, {
    ...storedOtp,
    verified: true
  });
  
  res.json({ 
    success: true,
    message: 'OTP verified successfully' 
  });
});

// Helper function to send email via Brevo
const sendBrevoEmail = async (emailData) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email', 
      emailData, 
      {
        headers: { 
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Email error:', error.response?.data || error.message);
    throw new Error('Failed to send email');
  }
};

const resetPasswordWithOTP = asyncHandler(async (req, res) => {
  const { otpId, email, newPassword } = req.body;
  const storedOtp = otpStore.get(otpId);

  if (!storedOtp) {
    res.status(400);
    throw new Error('Invalid OTP request');
  }

  if (!storedOtp.verified) {
    res.status(400);
    throw new Error('OTP not verified');
  }

  if (storedOtp.email !== email) {
    res.status(400);
    throw new Error('Email does not match OTP request');
  }

  // Find user and update password
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.password = newPassword;
  await user.save();

  // Clear the OTP
  otpStore.delete(otpId);
  
  res.json({ 
    success: true,
    message: 'Password reset successfully' 
  });
});

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  otpStore.forEach((value, key) => {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  });
}, 3600000); // Run every hour

export {
  sendWelcomeEmail,
  sendPasswordResetOTP,
  verifyOTP,
  resetPasswordWithOTP
};