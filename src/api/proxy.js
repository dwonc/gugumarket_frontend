export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ⚡ 수정: HTTP → HTTPS 또는 환경변수 사용
    const backendUrl = process.env.BACKEND_URL || 'http://ggserver-env.eba-xtmi9xja.ap-southeast-2.elasticbeanstalk.com';
    const path = req.url.replace('/api/proxy', '');
    const targetUrl = `${backendUrl}${path}`;

    try {
        const headers = { ...req.headers };
        delete headers.host;
        delete headers.connection;

        const fetchOptions = {
            method: req.method,
            headers: headers,
        };

        // GET/HEAD가 아닐 때만 body 추가
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.status(response.status).json(data);
        } else {
            const text = await response.text();
            res.status(response.status).send(text);
        }
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed', message: error.message });
    }
}