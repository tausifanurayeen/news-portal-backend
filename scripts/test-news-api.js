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
        console.log('--- Testing News API ---\n');

        // Setup: Need a user to be the author
        console.log('Setup: Registering/Finding User...');
        const userRes = await makeRequest('POST', '/api/users', {
            name: 'News Author',
            email: 'author@news.com',
            password: 'authorpass'
        });

        let authorId;
        if (userRes.status === 201) {
            authorId = userRes.body._id;
        } else if (userRes.status === 400 && userRes.body.message === 'User already exists') {
            // Need to login to get ID if exists logic prevents returning ID, 
            // but for now let's hope we can get it or just Login.
            // Actually, let's just Login to be safe and get ID from token or response
            const loginRes = await makeRequest('POST', '/api/auth/login', {
                email: 'author@news.com',
                password: 'authorpass'
            });
            if (loginRes.status === 200) authorId = loginRes.body._id;
        }

        if (!authorId) {
            console.error('Failed to get author ID. Aborting.');
            return;
        }
        console.log('Author ID:', authorId);

        // 1. Create News
        console.log('\n1. Creating News...');
        const newsData = {
            title: 'Breaking News',
            body: 'This is a breaking news story.',
            author_id: authorId
        };
        const createRes = await makeRequest('POST', '/api/news', newsData);
        console.log('Status:', createRes.status);
        console.log('Response:', createRes.body);

        if (createRes.status !== 201) return;
        const newsId = createRes.body._id;

        // 2. Get All News
        console.log('\n2. Getting All News...');
        const getAllRes = await makeRequest('GET', '/api/news');
        console.log('Status:', getAllRes.status);
        console.log('Count:', getAllRes.body.length);
        if (getAllRes.body.length > 0 && getAllRes.body[0].author_id) {
            console.log('Author populated:', getAllRes.body[0].author_id.name);
        }

        // 3. Get News By ID
        console.log(`\n3. Getting News by ID (${newsId})...`);
        const getByIdRes = await makeRequest('GET', `/api/news/${newsId}`);
        console.log('Status:', getByIdRes.status);

        // 4. Update News
        console.log(`\n4. Updating News (${newsId})...`);
        const updateRes = await makeRequest('PUT', `/api/news/${newsId}`, { title: 'Updated News Title' });
        console.log('Status:', updateRes.status);
        console.log('Response Title:', updateRes.body.title);

        // 5. Delete News
        console.log(`\n5. Deleting News (${newsId})...`);
        const deleteRes = await makeRequest('DELETE', `/api/news/${newsId}`);
        console.log('Status:', deleteRes.status);

        // 6. Verify Delete
        console.log('\n6. Verifying Delete...');
        const getDeletedRes = await makeRequest('GET', `/api/news/${newsId}`);
        console.log('Status:', getDeletedRes.status); // Should be 404

    } catch (error) {
        console.error('Test failed:', error);
    }
};

setTimeout(runTests, 2000);
