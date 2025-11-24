import { useEffect } from 'react';

/**
 * 상품 상세 페이지의 메타 태그를 동적으로 설정하는 컴포넌트
 * 소셜 미디어 공유 시 썸네일과 설명이 표시되도록 함
 */
const ProductMetaTags = ({ product }) => {
    useEffect(() => {
        if (!product) return;

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

        // 이미지 URL 생성
        const getImageUrl = (imagePath) => {
            if (!imagePath) return `${window.location.origin}/placeholder.png`;
            if (imagePath.startsWith('http')) return imagePath;
            return `${API_BASE_URL.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`;
        };

        const imageUrl = getImageUrl(product.mainImage);
        const url = window.location.href;
        const title = product.title;
        const description = product.content?.substring(0, 200) || `${product.price?.toLocaleString()}원에 판매중인 상품입니다.`;

        // 기존 메타 태그 제거 및 새로 추가
        const setMetaTag = (property, content) => {
            // property 방식 (og:, twitter:)
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
                // name 방식도 확인
                element = document.querySelector(`meta[name="${property}"]`);
            }

            if (element) {
                element.setAttribute('content', content);
            } else {
                element = document.createElement('meta');
                if (property.startsWith('og:') || property.startsWith('twitter:')) {
                    element.setAttribute('property', property);
                } else {
                    element.setAttribute('name', property);
                }
                element.setAttribute('content', content);
                document.head.appendChild(element);
            }
        };

        // 페이지 타이틀
        document.title = `${title} - GuguMarket`;

        // Open Graph 태그 (Facebook, KakaoTalk 등)
        setMetaTag('og:type', 'product');
        setMetaTag('og:url', url);
        setMetaTag('og:title', title);
        setMetaTag('og:description', description);
        setMetaTag('og:image', imageUrl);
        setMetaTag('og:image:width', '800');
        setMetaTag('og:image:height', '600');
        setMetaTag('og:site_name', 'GuguMarket');

        // 상품 정보 (Open Graph Product)
        setMetaTag('product:price:amount', product.price);
        setMetaTag('product:price:currency', 'KRW');

        // Twitter Card 태그
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:url', url);
        setMetaTag('twitter:title', title);
        setMetaTag('twitter:description', description);
        setMetaTag('twitter:image', imageUrl);

        // 일반 메타 태그
        setMetaTag('description', description);

        // 카카오톡 전용 (선택사항)
        setMetaTag('og:locale', 'ko_KR');

        // cleanup 함수: 컴포넌트 언마운트 시 기본값으로 복원
        return () => {
            document.title = 'GuguMarket';
        };
    }, [product]);

    return null; // UI를 렌더링하지 않음
};

export default ProductMetaTags;