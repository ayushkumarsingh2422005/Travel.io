const db = require('./config/db');

const addResetFieldsToUsers = async () => {
    try {
        console.log('Adding reset password fields to users table...');
        
        // Check if the fields already exist
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME IN ('reset_password_token', 'reset_password_expiry')
        `);
        
        const existingColumns = columns.map(col => col.COLUMN_NAME);
        
        if (!existingColumns.includes('reset_password_token')) {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN reset_password_token VARCHAR(100) NULL
            `);
            console.log('✅ Added reset_password_token column');
        } else {
            console.log('✅ reset_password_token column already exists');
        }
        
        if (!existingColumns.includes('reset_password_expiry')) {
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN reset_password_expiry DATETIME NULL
            `);
            console.log('✅ Added reset_password_expiry column');
        } else {
            console.log('✅ reset_password_expiry column already exists');
        }
        
        console.log('✅ Users table migration completed successfully');
    } catch (error) {
        console.error('❌ Error adding reset fields to users table:', error);
        throw error;
    }
};

module.exports = addResetFieldsToUsers;
