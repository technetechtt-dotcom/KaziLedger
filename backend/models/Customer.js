module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
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
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vatNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    creditLimit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    paymentTerms: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'customers'
  });

  Customer.associate = function(models) {
    Customer.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
    Customer.hasMany(models.Quote, { foreignKey: 'customerId', as: 'quotes' });
    Customer.hasMany(models.Invoice, { foreignKey: 'customerId', as: 'invoices' });
    Customer.hasMany(models.Appointment, { foreignKey: 'customerId', as: 'appointments' });
  };

  return Customer;
};
