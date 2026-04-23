const Address = require('../models/Address');

exports.addAddress = async (req, res) => {
  try {
    const { userId, name, phone, street, landmark, city, state, pincode, type, isDefault } = req.body;

    // If this is the first address or set as default, update others
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = new Address({
      userId,
      name,
      phone,
      street,
      landmark,
      city,
      state,
      pincode,
      type,
      isDefault
    });

    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add address' });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const { userId } = req.query;
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDefault, ...updateData } = req.body;

    if (isDefault) {
      const address = await Address.findById(id);
      await Address.updateMany({ userId: address.userId }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(id, { ...updateData, isDefault }, { new: true });
    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update address' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
};
