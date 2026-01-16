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
        console.log('--- Testing User API ---');

        // 1. Create User
        console.log('\n1. Creating User...');
        const newUser = { name: 'API Test API', email: 'apitest@test.com', password: 'password123' };
        const createRes = await makeRequest('POST', '/api/users', newUser);
        console.log('Status:', createRes.status);
        console.log('Response:', createRes.body);

        if (createRes.body.password) {
            console.error('FAILED: Password returned in Create response!');
        } else {
            console.log('SUCCESS: Password excluded from Create response.');
        }

        if (createRes.status !== 201) return;
        const userId = createRes.body._id;

        // 2. Get All Users
        console.log('\n2. Getting All Users...');
        const getAllRes = await makeRequest('GET', '/api/users');
        console.log('Status:', getAllRes.status);
        console.log('Count:', getAllRes.body.length);
        if (getAllRes.body.length > 0 && getAllRes.body[0].password) {
            console.error('FAILED: Password returned in Get All response!');
        } else {
            console.log('SUCCESS: Password excluded from Get All response.');
        }

        // 3. Get User By ID
        console.log(`\n3. Getting User by ID (${userId})...`);
        const getByIdRes = await makeRequest('GET', `/api/users/${userId}`);
        console.log('Status:', getByIdRes.status);
        console.log('Response:', getByIdRes.body);
        if (getByIdRes.body.password) {
            console.error('FAILED: Password returned in Get By ID response!');
        } else {
            console.log('SUCCESS: Password excluded from Get By ID response.');
        }

        // 4. Update User
        console.log(`\n4. Updating User (${userId})...`);
        const updateRes = await makeRequest('PUT', `/api/users/${userId}`, { name: 'API Test UPDATED' });
        console.log('Status:', updateRes.status);
        console.log('Response:', updateRes.body);

        // 5. Delete User
        console.log(`\n5. Deleting User (${userId})...`);
        const deleteRes = await makeRequest('DELETE', `/api/users/${userId}`);
        console.log('Status:', deleteRes.status);
        console.log('Response:', deleteRes.body);

        // 6. Verify Delete
        console.log('\n6. Verifying Delete...');
        const getDeletedRes = await makeRequest('GET', `/api/users/${userId}`);
        console.log('Status:', getDeletedRes.status); // Should be 404

    } catch (error) {
        console.error('Test failed:', error);
    }
};

// Wait for server to start roughly
setTimeout(runTests, 2000);
