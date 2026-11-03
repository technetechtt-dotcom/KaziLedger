module.exports = (sequelize, DataTypes) => {
  const Business = sequelize.define('Business', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vatEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    defaultVatRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 15.00
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'ZAR'
    },
    language: {
      type: DataTypes.STRING(5),
      defaultValue: 'en'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vatNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankDetails: {
      type: DataTypes.JSON,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'businesses'
  });

  Business.associate = function(models) {
    Business.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Business.hasMany(models.Quote, { foreignKey: 'businessId', as: 'quotes' });
    Business.hasMany(models.Invoice, { foreignKey: 'businessId', as: 'invoices' });
    Business.hasMany(models.Customer, { foreignKey: 'businessId', as: 'customers' });
    Business.hasMany(models.Product, { foreignKey: 'businessId', as: 'products' });
  };

  return Business;
};
