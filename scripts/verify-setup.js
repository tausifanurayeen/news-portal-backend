require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const News = require('../models/News');

const verifySetup = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await connectDB();
        console.log('Connection successful!');

        console.log('Verifying models...');
        const user = new User({ name: 'Test', email: 'test@test.com', password: '123' });
        console.log('User model loaded:', user);

        const news = new News({ title: 'Test', body: 'Body', author_id: user._id });
        console.log('News model loaded:', news);

        console.log('Setup verification complete. Press Ctrl+C to exit if it hangs.');
        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
};

verifySetup();
