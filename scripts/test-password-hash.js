require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const testHashing = async () => {
    try {
        await connectDB();

        const email = 'hashTest@example.com';
        const password = 'mysecretpassword';

        // Cleanup previous test
        await User.deleteOne({ email });

        console.log('Creating user with plain password:', password);
        const user = await User.create({
            name: 'Hash Test',
            email,
            password
        });

        console.log('User created:', user._id);
        console.log('Stored password hash:', user.password);

        if (user.password === password) {
            console.error('FAILED: Password was stored in plain text!');
        } else {
            console.log('SUCCESS: Password is hashed.');
        }

        console.log('Testing password match...');
        const isMatch = await user.matchPassword(password);
        console.log('Match result (true expected):', isMatch);

        const isNotMatch = await user.matchPassword('wrongpassword');
        console.log('Mismatch result (false expected):', isNotMatch);

        await User.deleteOne({ email });
        console.log('Cleanup complete.');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testHashing();
