/**
 * 소셜 미디어 공유 유틸리티
 * 페이스북, 트위터, 카카오톡 등 다양한 플랫폼 지원
 */

// 상품 URL 생성
const getProductUrl = (productId) => {
    return `${window.location.origin}/products/${productId}`;
};

// 상품 이미지 URL 생성 (절대 경로)
const getAbsoluteImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`;
};

// 공유 텍스트 생성
const getShareText = (product) => {
    const price = product.price?.toLocaleString() || '0';
    return `${product.title}\n💰 ${price}원\n\n${product.content?.substring(0, 100) || ''}${product.content?.length > 100 ? '...' : ''}`;
};

// 페이스북 공유
export const shareToFacebook = (product) => {
    const url = getProductUrl(product.productId);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    window.open(
        shareUrl,
        'facebook-share',
        'width=600,height=400,scrollbars=yes'
    );
};

// 트위터(X) 공유
export const shareToTwitter = (product) => {
    const url = getProductUrl(product.productId);
    const text = `${product.title}\n💰 ${product.price?.toLocaleString()}원`;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    window.open(
        shareUrl,
        'twitter-share',
        'width=600,height=400,scrollbars=yes'
    );
};

// 카카오톡 공유 (Kakao SDK 필요)
export const shareToKakao = (product) => {
    if (!window.Kakao) {
        alert('카카오톡 공유 기능을 사용할 수 없습니다.');
        return;
    }

    if (!window.Kakao.isInitialized()) {
        const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
        if (kakaoKey) {
            window.Kakao.init(kakaoKey);
        } else {
            alert('카카오톡 API 키가 설정되지 않았습니다.');
            return;
        }
    }

    const url = getProductUrl(product.productId);
    const imageUrl = getAbsoluteImageUrl(product.mainImage);
    const description = product.content?.substring(0, 100) || '';

    window.Kakao.Share.sendDefault({
        objectType: 'commerce',
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
        buttons: [
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

// 라인 공유
export const shareToLine = (product) => {
    const url = getProductUrl(product.productId);
    const text = `${product.title}\n💰 ${product.price?.toLocaleString()}원`;
    const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    window.open(
        shareUrl,
        'line-share',
        'width=600,height=400,scrollbars=yes'
    );
};

// URL 복사
export const copyToClipboard = async (product) => {
    const url = getProductUrl(product.productId);

    try {
        await navigator.clipboard.writeText(url);
        return { success: true, message: '링크가 복사되었습니다!' };
    } catch {
        // 구형 브라우저 대응
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
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
    if (!navigator.share) {
        return { success: false, message: '이 브라우저는 공유 기능을 지원하지 않습니다.' };
    }

    const url = getProductUrl(product.productId);
    const text = getShareText(product);

    try {
        await navigator.share({
            title: product.title,
            text: text,
            url: url,
        });
        return { success: true, message: '공유되었습니다!' };
    } catch (err) {
        if (err.name === 'AbortError') {
            return { success: false, message: '' };
        }
        return { success: false, message: '공유에 실패했습니다.' };
    }
};

// 인스타그램 안내 (직접 게시 불가)
export const shareToInstagram = (product) => {

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        alert(
            '인스타그램 공유 안내:\n\n' +
            '1. 상품 링크가 복사되었습니다\n' +
            '2. 인스타그램 앱을 열어주세요\n' +
            '3. 스토리나 게시물 작성 시 링크를 붙여넣어주세요'
        );

        copyToClipboard(product);

        setTimeout(() => {
            window.location.href = 'instagram://';
        }, 1000);
    } else {
        alert(
            '인스타그램 공유는 모바일에서만 가능합니다.\n\n' +
            '웹에서는 다음 방법을 이용해주세요:\n' +
            '1. 상품 링크를 복사합니다\n' +
            '2. 모바일 인스타그램에서 링크를 붙여넣습니다'
        );
        copyToClipboard(product);
    }
};

// 통합 공유 함수
export const shareProduct = {
    facebook: shareToFacebook,
    twitter: shareToTwitter,
    kakao: shareToKakao,
    line: shareToLine,
    instagram: shareToInstagram,
    clipboard: copyToClipboard,
    native: shareNative,
};