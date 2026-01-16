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
        console.log('--- Testing Comment API ---\n');

        const email = 'commentTest@example.com';
        const password = 'commentPassword';

        // 1. Login/Register
        console.log('1. Login/Register...');
        await makeRequest('POST', '/api/users', { name: 'Comment Test', email, password });

        const loginRes = await makeRequest('POST', '/api/auth/login', { email, password });
        if (loginRes.status !== 200) {
            console.error('Login failed.');
            return;
        }
        const token = loginRes.body.token;
        console.log('Token received.');

        // 2. Create News
        console.log('\n2. Creating News...');
        const newsRes = await makeRequest('POST', '/api/news', { title: 'Comment News', body: 'News for comments' }, token);
        if (newsRes.status !== 201) {
            console.error('News creation failed.');
            return;
        }
        const newsId = newsRes.body._id;
        console.log('News created:', newsId);

        // 3. Add Comment
        console.log('\n3. Adding Comment...');
        const commentText = 'This is a test comment.';
        const commentRes = await makeRequest('PATCH', `/api/news/${newsId}/comment`, { text: commentText }, token);
        console.log('Status:', commentRes.status);
        console.log('Comments count:', commentRes.body.comments.length);

        if (commentRes.status === 201 && commentRes.body.comments.length > 0) {
            const addedComment = commentRes.body.comments[commentRes.body.comments.length - 1];
            if (addedComment.text === commentText) {
                console.log('SUCCESS: Comment added correctly.');
            } else {
                console.error('FAILED: Comment text mismatch.');
            }
        } else {
            console.error('FAILED: Comment not added.', commentRes.body);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
};

setTimeout(runTests, 2000);
