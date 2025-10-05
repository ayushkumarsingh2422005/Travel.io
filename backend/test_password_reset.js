const db = require('./config/db');
const crypto = require('crypto');

// Helper: Generate random token
function generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
}

const testPasswordResetFlow = async () => {
    try {
        console.log('🧪 Testing Password Reset Flow...\n');
        
        // Step 1: Check if reset fields exist in users table
        console.log('1. Checking users table structure...');
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME IN ('reset_password_token', 'reset_password_expiry')
        `);
        
        console.log('Reset fields in users table:', columns.map(col => col.COLUMN_NAME));
        
        if (columns.length < 2) {
            console.log('❌ Reset fields missing from users table');
            return;
        }
        
        // Step 2: Find a test user
        console.log('\n2. Finding a test user...');
        const [users] = await db.execute('SELECT id, email FROM users LIMIT 1');
        
        if (users.length === 0) {
            console.log('❌ No users found in database');
            return;
        }
        
        const testUser = users[0];
        console.log(`✅ Found test user: ${testUser.email} (ID: ${testUser.id})`);
        
        // Step 3: Generate and save reset token
        console.log('\n3. Generating and saving reset token...');
        const reset_password_token = generateRandomToken();
        const reset_password_expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        console.log(`Generated token: ${reset_password_token}`);
        console.log(`Expiry: ${reset_password_expiry}`);
        
        const updateResult = await db.execute(
            'UPDATE users SET reset_password_token = ?, reset_password_expiry = ? WHERE id = ?',
            [reset_password_token, reset_password_expiry, testUser.id]
        );
        
        console.log(`Update result:`, updateResult);
        
        // Step 4: Verify token was saved
        console.log('\n4. Verifying token was saved...');
        const [verifyResult] = await db.execute(
            'SELECT reset_password_token, reset_password_expiry FROM users WHERE id = ?',
            [testUser.id]
        );
        
        console.log('Saved token data:', verifyResult[0]);
        
        if (verifyResult[0].reset_password_token === reset_password_token) {
            console.log('✅ Token saved successfully');
        } else {
            console.log('❌ Token not saved correctly');
            return;
        }
        
        // Step 5: Test token lookup
        console.log('\n5. Testing token lookup...');
        const [foundUsers] = await db.execute(
            'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expiry > NOW()',
            [reset_password_token]
        );
        
        console.log(`Found users with valid token: ${foundUsers.length}`);
        
        if (foundUsers.length > 0) {
            console.log('✅ Token lookup successful');
        } else {
            console.log('❌ Token lookup failed');
            
            // Check if token exists without expiry check
            const [allUsersWithToken] = await db.execute(
                'SELECT id, reset_password_token, reset_password_expiry FROM users WHERE reset_password_token = ?',
                [reset_password_token]
            );
            console.log('Users with token (including expired):', allUsersWithToken);
        }
        
        // Step 6: Clean up
        console.log('\n6. Cleaning up test data...');
        await db.execute(
            'UPDATE users SET reset_password_token = NULL, reset_password_expiry = NULL WHERE id = ?',
            [testUser.id]
        );
        console.log('✅ Test data cleaned up');
        
        console.log('\n🎉 Password reset flow test completed!');
        
    } catch (error) {
        console.error('❌ Error testing password reset flow:', error);
    } finally {
        process.exit(0);
    }
};

// Run the test
testPasswordResetFlow();
