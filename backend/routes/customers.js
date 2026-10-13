const express = require('express');
const { Customer, Business } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all customers
router.get('/', async (req, res) => {
  try {
    const business = await Business.findOne({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const customers = await Customer.findAll({
      where: { businessId: business.id },
      order: [['name', 'ASC']]
    });

    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Failed to get customers' });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const business = await Business.findOne({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const customer = await Customer.create({
      businessId: business.id,
      ...req.body
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

module.exports = router;
