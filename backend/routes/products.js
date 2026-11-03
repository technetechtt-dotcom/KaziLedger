const express = require('express');
const { Product, Business } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all products
router.get('/', async (req, res) => {
  try {
    const business = await Business.findOne({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const products = await Product.findAll({
      where: { businessId: business.id },
      order: [['name', 'ASC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to get products' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const business = await Business.findOne({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const product = await Product.create({
      businessId: business.id,
      ...req.body
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

module.exports = router;
