import { useEffect } from 'react'; // Side Effect를 처리하기 위한 useEffect 훅 import

/**
 * 상품 상세 페이지의 메타 태그를 동적으로 설정하는 컴포넌트
 * 소셜 미디어 공유 시 썸네일과 설명이 표시되도록 함
 */
const ProductMetaTags = ({ product }) => { // product 객체를 prop으로 받음
    useEffect(() => { // 컴포넌트가 마운트되거나 product prop이 변경될 때 실행
        if (!product) return; // product 데이터가 없으면 실행 중단

        // 환경 변수에서 API 기본 URL을 가져오거나 로컬 기본값 설정
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

        // 이미지 URL 생성 헬퍼 함수
        const getImageUrl = (imagePath) => {
            if (!imagePath) return `${window.location.origin}/placeholder.png`; // 경로 없으면 기본 이미지
            if (imagePath.startsWith('http')) return imagePath; // 이미 절대 경로면 그대로 반환
            // API 기본 URL과 이미지 경로를 조합하여 절대 경로 생성
            return `${API_BASE_URL.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`;
        };

        const imageUrl = getImageUrl(product.mainImage); // 상품 메인 이미지 URL
        const url = window.location.href; // 현재 페이지의 전체 URL
        const title = product.title; // 상품 제목
        // 상품 내용을 200자까지 자르거나, 가격 정보를 포함한 기본 설명 사용
        const description = product.content?.substring(0, 200) || `${product.price?.toLocaleString()}원에 판매중인 상품입니다.`;

        // 메타 태그 설정/추가 함수
        const setMetaTag = (property, content) => {
            // property 방식 (og:, twitter: 등)으로 기존 태그를 찾음
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
                // name 방식 (description 등)으로도 확인
                element = document.querySelector(`meta[name="${property}"]`);
            }

            if (element) {
                // 기존 태그가 있으면 content 속성만 업데이트
                element.setAttribute('content', content);
            } else {
                // 기존 태그가 없으면 새로운 meta 태그 생성
                element = document.createElement('meta');

                // 태그 속성 설정 (og: 또는 twitter:로 시작하면 property, 아니면 name 사용)
                if (property.startsWith('og:') || property.startsWith('twitter:')) {
                    element.setAttribute('property', property);
                } else {
                    element.setAttribute('name', property);
                }
                element.setAttribute('content', content);
                document.head.appendChild(element); // <head>에 추가
            }
        };

        // --- 메타 태그 설정 시작 ---

        // 페이지 타이틀 설정
        document.title = `${title} - GuguMarket`;

        // Open Graph 태그 (소셜 미디어 공유 미리보기의 핵심)
        setMetaTag('og:type', 'product'); // 컨텐츠 유형 (상품)
        setMetaTag('og:url', url); // 페이지 URL
        setMetaTag('og:title', title); // 공유 제목
        setMetaTag('og:description', description); // 공유 설명
        setMetaTag('og:image', imageUrl); // 공유 썸네일 이미지
        setMetaTag('og:image:width', '800'); // 이미지 가로 크기
        setMetaTag('og:image:height', '600'); // 이미지 세로 크기
        setMetaTag('og:site_name', 'GuguMarket'); // 사이트 이름

        // 상품 정보 (Open Graph Product Schema)
        setMetaTag('product:price:amount', product.price); // 상품 가격
        setMetaTag('product:price:currency', 'KRW'); // 통화 단위

        // Twitter Card 태그 (Twitter 공유 미리보기)
        setMetaTag('twitter:card', 'summary_large_image'); // 카드 유형 (큰 이미지 포함)
        setMetaTag('twitter:url', url);
        setMetaTag('twitter:title', title);
        setMetaTag('twitter:description', description);
        setMetaTag('twitter:image', imageUrl);

        // 일반 메타 태그 (SEO 설명)
        setMetaTag('description', description);

        // 카카오톡 전용 (언어/지역 설정)
        setMetaTag('og:locale', 'ko_KR');

        // cleanup 함수: 컴포넌트 언마운트 시 실행되어 기본값으로 복원
        return () => {
            document.title = 'GuguMarket'; // 페이지 타이틀을 기본값으로 복원
            // (참고: 동적으로 추가된 meta 태그를 제거하는 로직은 포함되어 있지 않음)
        };
    }, [product]); // product 객체가 변경될 때마다 이 Effect를 재실행

    return null; // UI를 렌더링하지 않음 (메타 태그 설정만 담당)
};

export default ProductMetaTags;