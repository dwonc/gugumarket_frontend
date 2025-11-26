export default async function handler(req, res) {
    const { path, ...queryParams } = req.query;

    // path 배열 처리
    const pathArray = Array.isArray(path) ? path : [path];

    // ⚠️ 'api'가 배열의 첫 번째 요소면 제거
    const cleanPathArray = pathArray[0] === 'api' ? pathArray.slice(1) : pathArray;
    const apiPath = cleanPathArray.join('/');

    // 백엔드 URL 구성
    const backendUrl = `${process.env.BACKEND_URL}/api/${apiPath}`;

    // 쿼리 파라미터 재구성
    const queryString = new URLSearchParams(queryParams).toString();
    const finalUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;

    console.log('📍 Proxy Request:', {
        originalPath: pathArray,
        cleanedPath: cleanPathArray,
        apiPath,
        finalUrl
    });

    try {
        const response = await fetch(finalUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization || '',
            },
            body: req.method !== 'GET' && req.method !== 'HEAD'
                ? JSON.stringify(req.body)
                : undefined,
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('❌ Proxy Error:', {
            message: error.message,
            finalUrl,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Proxy failed',
            details: error.message,
            url: finalUrl
        });
    }
}