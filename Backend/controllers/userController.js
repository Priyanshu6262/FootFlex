const User = require('../models/User');

exports.syncUser = async (req, res) => {
  try {
    const { firebaseUid, name, email } = req.body;
    
    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUid is required' });
    }

    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({ firebaseUid, name, email });
      await user.save();
    } else {
      // Update name and email if they changed
      if (name && user.name !== name) user.name = name;
      if (email && user.email !== email) user.email = email;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
};

exports.checkStatus = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ isBlocked: user.isBlocked });
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ firebaseUid: uid }).populate('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { uid } = req.params;
    const { productId } = req.body;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.wishlist.map(id => id.toString()).includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { uid, productId } = req.params;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
