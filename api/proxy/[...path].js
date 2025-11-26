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

    // 백엔드 URL (환경 변수 또는 기본값)
    const backendUrl = process.env.BACKEND_URL || 'http://ggserver-env.eba-xtmi9xja.ap-southeast-2.elasticbeanstalk.com';

    // 경로 추출 및 처리
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : (path || '');

    // /api 접두사 추가
    const targetUrl = `${backendUrl}/api/${apiPath}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

    try {
        console.log('🔄 Proxy Request:', {
            method: req.method,
            targetUrl: targetUrl,
            hasBody: !!req.body
        });

        // 요청 헤더 설정
        const requestHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        // 인증 헤더 전달
        if (req.headers['authorization']) {
            requestHeaders['Authorization'] = req.headers['authorization'];
        }

        // Fetch 옵션 구성
        const fetchOptions = {
            method: req.method,
            headers: requestHeaders,
        };

        // POST/PUT/PATCH 등 body가 있는 요청 처리
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string'
                ? req.body
                : JSON.stringify(req.body);
        }

        // 백엔드 요청
        const response = await fetch(targetUrl, fetchOptions);

        console.log('✅ Backend Response:', {
            status: response.status,
            statusText: response.statusText
        });

        // 응답 처리
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.status(response.status).json(data);
        } else {
            data = await response.text();
            res.setHeader('Content-Type', contentType || 'text/plain');
            res.status(response.status).send(data);
        }

    } catch (error) {
        console.error('❌ Proxy Error:', {
            message: error.message,
            targetUrl: targetUrl,
            stack: error.stack
        });

        res.status(500).json({
            error: 'Proxy connection failed',
            message: error.message,
            targetUrl: targetUrl
        });
    }
}