module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 15.00
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'piece'
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    minStockLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    maxStockLevel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'products'
  });

  Product.associate = function(models) {
    Product.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
  };

  return Product;
};
