const http = require('http');

const makeRequest = (method, path, data, token) => {
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

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

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
        console.log('--- Testing Protected Routes ---\n');

        const email = 'protectTest@example.com';
        const password = 'protectPassword';

        // 1. Unprotected POST (Should Fail)
        console.log('1. Testing Unprotected POST to /api/news...');
        const failRes = await makeRequest('POST', '/api/news', { title: 'Fail News', body: 'Should fail' });
        console.log('Status:', failRes.status);

        if (failRes.status === 401) {
            console.log('SUCCESS: Request rejected with 401.');
        } else {
            console.error('FAILED: Expected 401, got', failRes.status);
        }

        // 2. Login to get Token
        console.log('\n2. Logging in...');
        // Ensure user exists first
        await makeRequest('POST', '/api/users', { name: 'Protect Test', email, password });

        const loginRes = await makeRequest('POST', '/api/auth/login', { email, password });
        if (loginRes.status !== 200 || !loginRes.body.token) {
            console.error('Login failed, cannot proceed.');
            return;
        }
        const token = loginRes.body.token;
        console.log('Token received.');

        // 3. Protected POST (Should Succeed)
        console.log('\n3. Testing Protected POST to /api/news...');
        const successRes = await makeRequest('POST', '/api/news', { title: 'Success News', body: 'Should succeed' }, token);
        console.log('Status:', successRes.status);
        console.log('Response:', successRes.body);

        if (successRes.status === 201) {
            console.log('SUCCESS: News created with token.');
            if (successRes.body.author_id) {
                console.log('Author ID correctly attached:', successRes.body.author_id);
            }
        } else {
            console.error('FAILED: Request failed with', successRes.status);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
};

setTimeout(runTests, 2000);
