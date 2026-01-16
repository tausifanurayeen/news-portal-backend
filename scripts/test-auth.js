const http = require('http');

const makeRequest = (method, path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

const runTests = async () => {
    try {
        console.log('--- Testing Auth API ---');

        const email = 'authTest1@example.com';
        const password = 'authPassword123';

        // 1. Register User
        console.log('\n1. Registering User...');
        // Cleanup first
        // Note: For a real test script I'd connect to DB to cleanup, but here I'll just change email or assume it works
        // Let's create a new unique user each time or rely on duplicate check
        const registerRes = await makeRequest('POST', '/api/users', { name: 'Auth Test', email, password });
        console.log('Register Status:', registerRes.status);
        if (registerRes.status === 201) {
            console.log('User registered.');
        } else if (registerRes.status === 400 && registerRes.body.message === 'User already exists') {
            console.log('User already exists, proceeding to login.');
        } else {
            console.error('Registration failed:', registerRes.body);
            // process.exit(1); 
            // Don't exit, might check login if user exists
        }

        // 2. Login Success
        console.log('\n2. Testing Login Success...');
        const loginRes = await makeRequest('POST', '/api/auth/login', { email, password });
        console.log('Login Status:', loginRes.status);

        if (loginRes.status === 200 && loginRes.body.token) {
            console.log('SUCCESS: Token received:', loginRes.body.token.substring(0, 20) + '...');

            // Verify Payload
            try {
                const parts = loginRes.body.token.split('.');
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                console.log('Token Payload:', payload);

                if (payload.name && payload.email) {
                    console.log('SUCCESS: Name and Email present in token.');
                } else {
                    console.error('FAILED: Name or Email missing from token payload.');
                }
            } catch (e) {
                console.error('FAILED: Could not decode token.', e);
            }

        } else {
            console.error('FAILED: No token received or login failed.', loginRes.body);
        }

        // 3. Login Failure
        console.log('\n3. Testing Login Failure (Wrong Password)...');
        const failRes = await makeRequest('POST', '/api/auth/login', { email, password: 'wrongpassword' });
        console.log('Login Fail Status:', failRes.status);
        if (failRes.status === 401) {
            console.log('SUCCESS: Login failed as expected with 401.');
        } else {
            console.error('FAILED: Expected 401, got', failRes.status);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
};

setTimeout(runTests, 2000);
