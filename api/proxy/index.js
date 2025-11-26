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

    const backendUrl = process.env.BACKEND_URL || 'http://ggserver-env.eba-xtmi9xja.ap-southeast-2.elasticbeanstalk.com';
    const path = req.url.replace('/api/proxy', '');
    const targetUrl = `${backendUrl}`+path;

    try {
        console.log('🔄 Target URL:', targetUrl);

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        console.log('✅ Response status:', response.status);

        const data = await response.text();

        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
        res.status(response.status).send(data);

    } catch (error) {
        console.error('❌ Error:', error.message);

        res.status(500).json({
            error: 'Proxy failed',
            message: error.message,
            targetUrl: targetUrl
        });
    }
}