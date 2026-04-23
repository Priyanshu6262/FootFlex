const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '24h'
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    const token = signToken(admin._id);
    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ error: 'No admin found with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    admin.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

    await admin.save({ validateBeforeSave: false });

    // In a real app, send email. For now, return token.
    res.status(200).json({
      message: 'Token generated (In production, this would be emailed)',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const admin = await Admin.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ error: 'Token is invalid or has expired' });
    }

    admin.password = req.body.password;
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;
    await admin.save();

    const token = signToken(admin._id);
    res.status(200).json({
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
