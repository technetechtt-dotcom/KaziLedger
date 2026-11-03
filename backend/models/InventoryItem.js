module.exports = (sequelize, DataTypes) => {
  const InventoryItem = sequelize.define('InventoryItem', {
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reservedQuantity: {
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
    lastRestocked: {
      type: DataTypes.DATE,
      allowNull: true
    },
    costPerUnit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'inventory_items'
  });

  InventoryItem.associate = function(models) {
    InventoryItem.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
    InventoryItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
  };

  return InventoryItem;
};
