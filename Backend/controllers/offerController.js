const Offer = require('../models/Offer');

// GET /api/offers?category=Men&type=offer
const getOffers = async (req, res) => {
  try {
    const { category, type } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;

    // If a specific category requested, return that category + 'All'
    if (category && category !== 'All') {
      filter.category = { $in: [category, 'All'] };
    }

    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch offers', error: err.message });
  }
};

// GET /api/offers/admin  (all, including inactive)
const getAllOffersAdmin = async (req, res) => {
  try {
    const { category, type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category && category !== 'All') filter.category = category;

    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch offers', error: err.message });
  }
};

// POST /api/offers
const createOffer = async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json({ message: 'Offer created', offer });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create offer', error: err.message });
  }
};

// PUT /api/offers/:id
const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ message: 'Offer updated', offer });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update offer', error: err.message });
  }
};

// DELETE /api/offers/:id
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete offer', error: err.message });
  }
};

module.exports = { getOffers, getAllOffersAdmin, createOffer, updateOffer, deleteOffer };
