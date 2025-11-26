export default async function handler(req, res) {
    const { path, ...otherParams } = req.query;

    // path 배열 처리
    const pathArray = Array.isArray(path) ? path : [path];

    // 'api'가 첫 번째 요소면 제거
    const cleanPathArray = pathArray[0] === 'api' ? pathArray.slice(1) : pathArray;
    const apiPath = cleanPathArray.join('/');

    // 백엔드 URL 구성
    const backendUrl = `${process.env.BACKEND_URL}/api/${apiPath}`;

    // ⚠️ 중요: path 파라미터는 제외하고 나머지만 쿼리 스트링에 추가
    const queryString = new URLSearchParams(otherParams).toString();
    const finalUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;

    // 디버깅 로그
    console.log('📍 Proxy:', {
        original: pathArray,
        cleaned: cleanPathArray,
        apiPath,
        otherParams,
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
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('❌ Proxy Error:', {
            message: error.message,
            finalUrl,
            stack: error.stack
        });
        return res.status(500).json({
            error: 'Proxy failed',
            details: error.message,
            url: finalUrl
        });
    }
}