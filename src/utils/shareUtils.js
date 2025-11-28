/**
 * 소셜 미디어 공유 유틸리티
 * 페이스북, 트위터, 카카오톡 등 다양한 플랫폼 지원
 */

// --- 1. 기본 유틸리티 함수 ---

// 상품 URL 생성 (현재 도메인과 상품 ID를 조합하여 절대 URL 생성)
const getProductUrl = (productId) => {
    return `${window.location.origin}/products/${productId}`; // 예: http://localhost:5173/products/123
};

// 상품 이미지 URL 생성 (절대 경로)
const getAbsoluteImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // 이미 http(s)로 시작하는 절대 경로인 경우 그대로 반환
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // 환경 변수에서 API 기본 URL을 가져오거나 기본값 설정
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    // 기본 URL과 이미지 경로를 조합하여 절대 경로 생성 (슬래시 중복 방지 처리 포함)
    return `${baseUrl.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`;
};

// 공유 텍스트 생성 (상품 제목, 가격, 내용 일부를 포함)
const getShareText = (product) => {
    const price = product.price?.toLocaleString() || '0';
    // 텍스트 길이 100자로 제한 후 ... 처리
    return `${product.title}\n💰 ${price}원\n\n${product.content?.substring(0, 100) || ''}${product.content?.length > 100 ? '...' : ''}`;
};


// --- 2. 플랫폼별 공유 함수 ---

// 페이스북 공유 (Facebook Sharer URL 사용)
export const shareToFacebook = (product) => {
    const url = getProductUrl(product.productId);
    // 인코딩된 상품 URL을 쿼리 파라미터로 포함하여 공유 URL 생성
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    // 새 창으로 페이스북 공유 팝업 열기
    window.open(
        shareUrl,
        'facebook-share',
        'width=600,height=400,scrollbars=yes'
    );
};

// 트위터(X) 공유 (Twitter Intent URL 사용)
export const shareToTwitter = (product) => {
    const url = getProductUrl(product.productId);
    const text = `${product.title}\n💰 ${product.price?.toLocaleString()}원`;
    // 인코딩된 URL과 텍스트를 쿼리 파라미터로 포함
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    // 새 창으로 트위터 공유 팝업 열기
    window.open(
        shareUrl,
        'twitter-share',
        'width=600,height=400,scrollbars=yes'
    );
};

// 카카오톡 공유 (Kakao SDK 필요)
export const shareToKakao = (product) => {
    // 카카오 SDK(window.Kakao)가 로드되었는지 확인
    if (!window.Kakao) {
        alert('카카오톡 공유 기능을 사용할 수 없습니다.');
        return;
    }

    // 카카오 SDK가 초기화되지 않은 경우 초기화 시도
    if (!window.Kakao.isInitialized()) {
        const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
        if (kakaoKey) {
            window.Kakao.init(kakaoKey); // API 키로 초기화
        } else {
            alert('카카오톡 API 키가 설정되지 않았습니다.');
            return;
        }
    }

    const url = getProductUrl(product.productId);
    const imageUrl = getAbsoluteImageUrl(product.mainImage);
    const description = product.content?.substring(0, 100) || '';

    // 카카오톡 기본 공유 템플릿 (Commerce Type) 전송
    window.Kakao.Share.sendDefault({
        objectType: 'commerce', // 상거래(상품) 유형 템플릿 사용
        content: {
            title: product.title,
            imageUrl: imageUrl || 'https://via.placeholder.com/400x400',
            description: description,
            link: {
                mobileWebUrl: url,
                webUrl: url,
            },
        },
        commerce: {
            productName: product.title,
            regularPrice: product.price,
        },
        buttons: [ // 상품 보기 버튼 추가
            {
                title: '상품 보기',
                link: {
                    mobileWebUrl: url,
                    webUrl: url,
                },
            },
        ],
    });
};

// 라인 공유 (Line Social Plugins URL 사용)
export const shareToLine = (product) => {
    const url = getProductUrl(product.productId);
    const text = `${product.title}\n💰 ${product.price?.toLocaleString()}원`;
    // 인코딩된 URL과 텍스트를 쿼리 파라미터로 포함
    const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    // 새 창으로 라인 공유 팝업 열기
    window.open(
        shareUrl,
        'line-share',
        'width=600,height=400,scrollbars=yes'
    );
};

// URL 복사 (Clipboard API 사용)
export const copyToClipboard = async (product) => {
    const url = getProductUrl(product.productId);

    try {
        await navigator.clipboard.writeText(url); // 최신 Clipboard API 사용 시도
        return { success: true, message: '링크가 복사되었습니다!' };
    } catch {
        // Clipboard API 실패 시 구형 브라우저 대응 로직
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed'; // 화면에서 보이지 않도록 위치 설정
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select(); // 텍스트 영역 선택

        try {
            document.execCommand('copy'); // 구형 복사 명령 실행
            document.body.removeChild(textArea);
            return { success: true, message: '링크가 복사되었습니다!' };
        } catch {
            document.body.removeChild(textArea);
            return { success: false, message: '링크 복사에 실패했습니다.' };
        }
    }
};

// Web Share API 사용 (모바일 네이티브 공유)
export const shareNative = async (product) => {
    // Web Share API 지원 여부 확인
    if (!navigator.share) {
        return { success: false, message: '이 브라우저는 공유 기능을 지원하지 않습니다.' };
    }

    const url = getProductUrl(product.productId);
    const text = getShareText(product);

    try {
        // 네이티브 공유 대화 상자 띄우기
        await navigator.share({
            title: product.title,
            text: text,
            url: url,
        });
        return { success: true, message: '공유되었습니다!' };
    } catch (err) {
        if (err.name === 'AbortError') {
            return { success: false, message: '' }; // 사용자가 공유를 취소한 경우
        }
        return { success: false, message: '공유에 실패했습니다.' };
    }
};

// 인스타그램 안내 (직접 게시 불가)
export const shareToInstagram = (product) => {

    // 모바일 환경 (iPhone, iPad, iPod, Android) 확인
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        alert(
            '인스타그램 공유 안내:\n\n' +
            '1. 상품 링크가 복사되었습니다\n' +
            '2. 인스타그램 앱을 열어주세요\n' +
            '3. 스토리나 게시물 작성 시 링크를 붙여넣어주세요'
        );

        copyToClipboard(product); // 상품 링크 클립보드에 복사

        // 1초 후 인스타그램 앱을 실행하도록 시도 (딥링크)
        setTimeout(() => {
            window.location.href = 'instagram://';
        }, 1000);
    } else {
        // 모바일 외 환경 (데스크톱) 알림
        alert(
            '인스타그램 공유는 모바일에서만 가능합니다.\n\n' +
            '웹에서는 다음 방법을 이용해주세요:\n' +
            '1. 상품 링크를 복사합니다\n' +
            '2. 모바일 인스타그램에서 링크를 붙여넣습니다'
        );
        copyToClipboard(product); // 상품 링크 클립보드에 복사
    }
};

// --- 3. 통합 공유 함수 객체 ---

// 모든 공유 함수를 하나의 객체로 통합하여 외부에서 쉽게 접근 가능하도록 export
export const shareProduct = {
    facebook: shareToFacebook,
    twitter: shareToTwitter,
    kakao: shareToKakao,
    line: shareToLine,
    instagram: shareToInstagram,
    clipboard: copyToClipboard,
    native: shareNative,
};