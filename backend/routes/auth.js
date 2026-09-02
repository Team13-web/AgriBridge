import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agribridge_super_secret_jwt_key_2026';

// Gmail SMTP Transporter Configuration (Using Environment Variables)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Verify SMTP Connection on Startup
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ [SMTP Verification] Gmail SMTP configuration warning:', error.message);
  } else {
    console.log('✅ [SMTP Verification] Gmail SMTP server is connected and ready to send emails.');
  }
});

// In-Memory Store for Password Reset OTPs: Map<cleanTarget, { otp, expiresAt, lastRequestedAt }>
const resetOtps = new Map();

// Helper to validate password policy
function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8 || password.length > 15) return 'Password must be between 8 and 15 characters long.';
  if (/\s/.test(password)) return 'Password cannot contain spaces.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter (A-Z).';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number (0-9).';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return 'Password must contain at least one symbol (e.g. @, #, $, %).';
  return null;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role, phone } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, full_name, email, password, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, full_name, email.toLowerCase().trim(), password_hash, password_hash, role, phone || '']
    );

    const userId = result.insertId;

    if (role === 'farmer') {
      await query('INSERT INTO farmer_profiles (user_id) VALUES (?)', [userId]);
    } else if (role === 'buyer') {
      await query('INSERT INTO buyer_profiles (user_id) VALUES (?)', [userId]);
    } else if (role === 'landowner') {
      await query('INSERT INTO landowner_profiles (user_id) VALUES (?)', [userId]);
    }

    const token = jwt.sign({ id: userId, email: email.toLowerCase().trim(), role, full_name }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: { id: userId, full_name, email: email.toLowerCase().trim(), role, phone }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server registration error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];
    const userHash = user.password_hash || user.password;
    const isMatch = await bcrypt.compare(password, userHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name || user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          full_name: user.full_name || user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar || user.avatar_url
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Login error' });
  }
});

// POST /api/auth/send-otp (Backend OTP Generation & Dispatch)
router.post('/send-otp', async (req, res) => {
  try {
    const { target, channel } = req.body;
    if (!target) {
      return res.status(400).json({ success: false, message: 'Target (email or phone) is required.' });
    }

    const isPhone = channel === 'phone';
    const cleanTarget = isPhone ? target.replace(/\D/g, '') : target.toLowerCase().trim();

    if (!cleanTarget) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email or phone number.' });
    }

    // 1. MySQL User Lookup (Handle Email & Phone Separately)
    let users = [];
    if (isPhone) {
      users = await query(
        "SELECT * FROM users WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), '(', '') LIKE ?",
        [`%${cleanTarget}%`]
      );
    } else {
      users = await query('SELECT * FROM users WHERE email = ?', [cleanTarget]);
    }

    if (!users || users.length === 0) {
      if (!isPhone && cleanTarget.includes('@')) {
        const defaultHash = await bcrypt.hash('AgriBridge@123', 10);
        try {
          await query(
            'INSERT INTO users (name, full_name, email, password, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [cleanTarget.split('@')[0], cleanTarget.split('@')[0], cleanTarget, defaultHash, defaultHash, 'farmer', '']
          );
          console.log(`[OTP Sync] Auto-synced ${cleanTarget} into MySQL database.`);
        } catch (e) {
          console.warn('[OTP Sync Note]:', e.message);
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'No registered user account was found.'
        });
      }
    }

    // 2. Handle Phone Channel Error if SMS Provider Not Configured
    if (isPhone) {
      console.log(`[OTP Request] Target: ${cleanTarget}, Channel: phone - SMS Provider Not Configured`);
      return res.status(501).json({
        success: false,
        message: 'SMS OTP service is not configured. Please configure an SMS provider.'
      });
    }

    // 3. Cooldown / Rate Limiting (60 Seconds)
    const existingRecord = resetOtps.get(cleanTarget);
    if (existingRecord && (Date.now() - existingRecord.lastRequestedAt < 60000)) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting another verification code.'
      });
    }

    // 4. Generate Cryptographically Strong 6-digit OTP
    const otp = String(crypto.randomInt(100000, 1000000));

    // 5. Store OTP with 10-Minute Expiration
    resetOtps.set(cleanTarget, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      lastRequestedAt: Date.now()
    });

    console.log(`[OTP Request] Target: ${cleanTarget}, Channel: email - Attempting email delivery`);

    // 6. Nodemailer Delivery via Gmail SMTP
    const senderEmail = process.env.EMAIL_USER || 'agribridge.pvt.ltd.com@gmail.com';
    const senderPass = process.env.EMAIL_APP_PASSWORD || 'AgriBridge@123';

    const activeTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: senderEmail,
        pass: senderPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    try {
      await activeTransporter.sendMail({
        from: `"AgriBridge Support" <${senderEmail}>`,
        to: cleanTarget,
        subject: '🔑 AgriBridge — Password Reset Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e1e7e2; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2E7D32;">
              <h2 style="color: #2E7D32; margin: 0; font-size: 24px;">🌿 AgriBridge Platform</h2>
              <p style="color: #68736A; margin: 6px 0 0; font-size: 14px;">Connecting Land, Farmers & Opportunities</p>
            </div>
            <div style="padding: 24px 0;">
              <p style="font-size: 16px; color: #172018; margin-bottom: 12px;">Hello,</p>
              <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">You requested a password reset for your AgriBridge account. Your 6-digit verification code is:</p>
              <div style="background-color: #E8F5E9; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px dashed #2E7D32;">
                <span style="font-size: 34px; font-weight: bold; letter-spacing: 10px; color: #2E7D32;">${otp}</span>
              </div>
              <p style="font-size: 13px; color: #e53e3e; margin-top: 12px;"><strong>⚠️ Note:</strong> This verification code is valid for <strong>10 minutes</strong> only.</p>
              <p style="font-size: 12px; color: #718096; margin-top: 16px;">If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #edf2f7; color: #a0aec0; font-size: 11px;">
              &copy; 2026 AgriBridge Platform. All rights reserved.
            </div>
          </div>
        `
      });

      console.log(`[OTP Request] Real Gmail delivery successful to ${cleanTarget}`);
      return res.json({
        success: true,
        message: 'Verification code sent successfully.'
      });
    } catch (mailErr) {
      console.error('[OTP Request] Email delivery warning:', mailErr.message);
      console.log(`🔑 [DEVELOPER CONSOLE OTP] Generated OTP for ${cleanTarget}: Code = ${otp}`);

      if (mailErr.message.includes('BadCredentials') || mailErr.message.includes('Username and Password not accepted')) {
        return res.status(400).json({
          success: false,
          message: 'Gmail authentication failed: Google requires a 16-character App Password (not your standard Gmail password). Please generate a 16-character App Password in Google Account > Security > App Passwords.'
        });
      }

      return res.status(500).json({
        success: false,
        message: `Failed to deliver email: ${mailErr.message}`
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/reset-password (Verifies Backend OTP & Updates Hashed Password in MySQL)
router.post('/reset-password', async (req, res) => {
  try {
    const { target, otp, newPassword } = req.body;

    if (!target || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Target, verification code, and new password are required.'
      });
    }

    const cleanTarget = target.toLowerCase().trim();
    const cleanDigits = cleanTarget.replace(/\D/g, '');

    // 1. Validate Password Policy
    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      return res.status(400).json({ success: false, message: pwdErr });
    }

    // 2. Retrieve OTP Record
    const record = resetOtps.get(cleanTarget) || (cleanDigits ? resetOtps.get(cleanDigits) : null);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.'
      });
    }

    // 3. Check Expiration (10 Minutes)
    if (Date.now() > record.expiresAt) {
      resetOtps.delete(cleanTarget);
      if (cleanDigits) resetOtps.delete(cleanDigits);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.'
      });
    }

    // 4. Verify Submitted OTP
    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.'
      });
    }

    // 5. Hash New Password with Bcrypt
    const password_hash = await bcrypt.hash(newPassword, 10);

    // 6. Update Password in MySQL Database (Separate Email & Phone)
    let updateRes;
    if (cleanTarget.includes('@')) {
      updateRes = await query('UPDATE users SET password = ?, password_hash = ? WHERE email = ?', [password_hash, password_hash, cleanTarget]);
    } else {
      updateRes = await query(
        "UPDATE users SET password = ?, password_hash = ? WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), '(', '') LIKE ?",
        [password_hash, password_hash, `%${cleanDigits}%`]
      );
    }

    if (updateRes.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered user account was found.'
      });
    }

    // 7. Delete OTP from Memory
    resetOtps.delete(cleanTarget);
    if (cleanDigits) resetOtps.delete(cleanDigits);

    return res.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await query('SELECT id, full_name, email, role, phone, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: users[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
