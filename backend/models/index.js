const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./User');
const Business = require('./Business');
const Customer = require('./Customer');
const Product = require('./Product');
const Quote = require('./Quote');
const Invoice = require('./Invoice');
const Appointment = require('./Appointment');
const InventoryItem = require('./InventoryItem');
const Expense = require('./Expense');

// Initialize models
const models = {
  User: User(sequelize, DataTypes),
  Business: Business(sequelize, DataTypes),
  Customer: Customer(sequelize, DataTypes),
  Product: Product(sequelize, DataTypes),
  Quote: Quote(sequelize, DataTypes),
  Invoice: Invoice(sequelize, DataTypes),
  Appointment: Appointment(sequelize, DataTypes),
  InventoryItem: InventoryItem(sequelize, DataTypes),
  Expense: Expense(sequelize, DataTypes)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  ...models
};
