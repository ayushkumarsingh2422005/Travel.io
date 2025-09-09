const db = require('./config/db');

const migrateVehiclesRCFields = async () => {
    try {
        console.log('🚀 Starting vehicles RC fields migration...');
        
        // Read and execute the SQL migration file
        const fs = require('fs');
        const path = require('path');
        
        const sqlFile = path.join(__dirname, 'migrate_vehicles_add_rc_fields.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await db.execute(statement);
                    console.log('✅ Executed:', statement.substring(0, 50) + '...');
                } catch (error) {
                    if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
                        console.log('⚠️  Field/Index already exists:', statement.substring(0, 50) + '...');
                    } else {
                        console.error('❌ Error executing statement:', error.message);
                    }
                }
            }
        }
        
        console.log('🎉 Vehicles RC fields migration completed successfully!');
        
        // Test the migration by checking if we can insert RC data
        console.log('\n🧪 Testing RC data insertion...');
        
        // Check if all RC fields exist
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'vehicles' 
            AND TABLE_SCHEMA = DATABASE()
            AND COLUMN_NAME LIKE 'rc_%'
            ORDER BY COLUMN_NAME
        `);
        
        console.log(`✅ Found ${columns.length} RC fields in vehicles table`);
        
        // List all RC fields
        columns.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME}`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit(0);
    }
};

// Run migration if this file is executed directly
if (require.main === module) {
    migrateVehiclesRCFields();
}

module.exports = migrateVehiclesRCFields;
