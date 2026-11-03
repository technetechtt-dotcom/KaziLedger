const express = require('express');
const { Business } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get business details
router.get('/', async (req, res) => {
  try {
    const business = await Business.findOne({ 
      where: { userId: req.user.id }
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({ message: 'Failed to get business data' });
  }
});

// Update business details
router.put('/', async (req, res) => {
  try {
    const business = await Business.findOne({ 
      where: { userId: req.user.id }
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const {
      name,
      logo,
      vatEnabled,
      defaultVatRate,
      currency,
      language,
      address,
      phone,
      email,
      registrationNumber,
      vatNumber,
      bankDetails,
      settings
    } = req.body;

    await business.update({
      name: name || business.name,
      logo: logo !== undefined ? logo : business.logo,
      vatEnabled: vatEnabled !== undefined ? vatEnabled : business.vatEnabled,
      defaultVatRate: defaultVatRate || business.defaultVatRate,
      currency: currency || business.currency,
      language: language || business.language,
      address: address || business.address,
      phone: phone || business.phone,
      email: email || business.email,
      registrationNumber: registrationNumber || business.registrationNumber,
      vatNumber: vatNumber || business.vatNumber,
      bankDetails: bankDetails || business.bankDetails,
      settings: settings || business.settings
    });

    res.json({ message: 'Business updated successfully', business });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ message: 'Failed to update business' });
  }
});

module.exports = router;
