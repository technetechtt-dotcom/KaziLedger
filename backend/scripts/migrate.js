const { sequelize } = require('../config/database');
const { testConnection } = require('../config/database');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await testConnection();
    
    // Sync all models
    await sequelize.sync({ force: false }); // Set to true to drop and recreate tables
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 All tables created/updated');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;
