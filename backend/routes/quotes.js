const express = require('express');
const { Quote, Customer, Business } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all quotes
router.get('/', async (req, res) => {
  try {
    const business = await Business.findOne({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const quotes = await Quote.findAll({
      where: { businessId: business.id },
      include: [{ model: Customer, as: 'customer' }],
      order: [['createdAt', 'DESC']]
    });

    res.json(quotes);
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ message: 'Failed to get quotes' });
  }
});

// Get single quote
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findOne({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const quote = await Quote.findOne({
      where: { id: req.params.id, businessId: business.id },
      include: [{ model: Customer, as: 'customer' }]
    });

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    res.json(quote);
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({ message: 'Failed to get quote' });
  }
});

// Create new quote
router.post('/', async (req, res) => {
  try {
    const business = await Business.findOne({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const {
      customerId,
      items,
      notes,
      terms,
      expiryDate
    } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const vatAmount = subtotal * (business.defaultVatRate / 100);
    const total = subtotal + vatAmount;

    // Generate quote number
    const quoteCount = await Quote.count({ where: { businessId: business.id } });
    const quoteNumber = `Q-${String(quoteCount + 1).padStart(4, '0')}`;

    const quote = await Quote.create({
      businessId: business.id,
      customerId,
      userId: req.user.id,
      quoteNumber,
      issueDate: new Date(),
      expiryDate,
      items,
      subtotal,
      vatAmount,
      total,
      notes,
      terms
    });

    const quoteWithCustomer = await Quote.findByPk(quote.id, {
      include: [{ model: Customer, as: 'customer' }]
    });

    res.status(201).json(quoteWithCustomer);
  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({ message: 'Failed to create quote' });
  }
});

// Update quote
router.put('/:id', async (req, res) => {
  try {
    const business = await Business.findOne({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const quote = await Quote.findOne({
      where: { id: req.params.id, businessId: business.id }
    });

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const {
      customerId,
      items,
      notes,
      terms,
      expiryDate,
      status
    } = req.body;

    // Recalculate totals if items changed
    let subtotal = quote.subtotal;
    let vatAmount = quote.vatAmount;
    let total = quote.total;

    if (items) {
      subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      vatAmount = subtotal * (business.defaultVatRate / 100);
      total = subtotal + vatAmount;
    }

    await quote.update({
      customerId: customerId || quote.customerId,
      items: items || quote.items,
      notes: notes || quote.notes,
      terms: terms || quote.terms,
      expiryDate: expiryDate || quote.expiryDate,
      status: status || quote.status,
      subtotal,
      vatAmount,
      total
    });

    const updatedQuote = await Quote.findByPk(quote.id, {
      include: [{ model: Customer, as: 'customer' }]
    });

    res.json(updatedQuote);
  } catch (error) {
    console.error('Update quote error:', error);
    res.status(500).json({ message: 'Failed to update quote' });
  }
});

// Delete quote
router.delete('/:id', async (req, res) => {
  try {
    const business = await Business.findOne({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const quote = await Quote.findOne({
      where: { id: req.params.id, businessId: business.id }
    });

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    await quote.destroy();
    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({ message: 'Failed to delete quote' });
  }
});

module.exports = router;
