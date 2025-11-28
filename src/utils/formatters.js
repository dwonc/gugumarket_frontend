/**
 * 📦 공통 포맷 유틸리티 함수
 * 날짜, 가격, 이미지 URL 등 반복 사용되는 포맷 함수 모음
 */

// ============================================
// 📅 날짜 포맷 함수들
// ============================================

/**
 * 날짜만 포맷 (YYYY. MM. DD 또는 YYYY-MM-DD)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @param {string} separator - 구분자 (기본: ".")
 * @returns {string} 포맷된 날짜 문자열
 *
 * @example
 * formatDate("2024-01-15T10:30:00") // "2024. 01. 15"
 * formatDate("2024-01-15", "-")      // "2024-01-15"
 */
export const formatDate = (dateString, separator = ".") => {
    // 날짜가 없으면 "-" 반환
    if (!dateString) return "-";

    try {
        // 문자열을 Date 객체로 변환
        const date = new Date(dateString);
        // 유효하지 않은 날짜인 경우 "-" 반환
        if (isNaN(date.getTime())) return "-";

        // 년, 월, 일 추출 (월은 0부터 시작하므로 +1 필요)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // 01, 02 형식으로 패딩
        const day = String(date.getDate()).padStart(2, "0");

        // 구분자에 따라 다른 형식으로 반환
        if (separator === ".") {
            return `${year}. ${month}. ${day}`; // 한국식 표기
        }
        return `${year}${separator}${month}${separator}${day}`;
    } catch {
        return "-";
    }
};

/**
 * 날짜 + 시간 포맷 (YYYY. MM. DD HH:mm)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜+시간 문자열
 *
 * @example
 * formatDateTime("2024-01-15T10:30:00") // "2024. 01. 15 10:30"
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";

        // 날짜 정보 추출
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        // 시간 정보 추출 (24시간 형식)
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}. ${month}. ${day} ${hours}:${minutes}`;
    } catch {
        return "-";
    }
};

/**
 * 상대적 시간 표시 (몇 분 전, 몇 시간 전 등)
 * SNS나 댓글에서 자주 사용되는 "3분 전", "2시간 전" 형식
 *
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 상대적 시간 문자열
 *
 * @example
 * formatRelativeTime("2024-01-15T10:30:00") // "3시간 전"
 */
export const formatRelativeTime = (dateString) => {
    if (!dateString) return "-";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";

        // 현재 시간과의 차이 계산
        const now = new Date();
        const diffMs = now - date; // 밀리초 단위 차이

        // 각 시간 단위로 변환
        const diffSec = Math.floor(diffMs / 1000);      // 초
        const diffMin = Math.floor(diffSec / 60);       // 분
        const diffHour = Math.floor(diffMin / 60);      // 시간
        const diffDay = Math.floor(diffHour / 24);      // 일
        const diffWeek = Math.floor(diffDay / 7);       // 주
        const diffMonth = Math.floor(diffDay / 30);     // 월 (대략)

        // 시간 차이에 따라 적절한 표현 반환
        if (diffSec < 60) return "방금 전";
        if (diffMin < 60) return `${diffMin}분 전`;
        if (diffHour < 24) return `${diffHour}시간 전`;
        if (diffDay < 7) return `${diffDay}일 전`;
        if (diffWeek < 4) return `${diffWeek}주 전`;
        if (diffMonth < 12) return `${diffMonth}개월 전`;

        // 1년 이상 지난 경우 날짜 형식으로 표시
        return formatDate(dateString);
    } catch {
        return "-";
    }
};

/**
 * ISO 형식에서 T 제거하고 보기 좋게 포맷
 * ISO 8601 형식(2024-01-15T10:30:00)을 읽기 쉬운 형식으로 변환
 *
 * @param {string} dateString - ISO 형식 날짜 문자열
 * @returns {string} 포맷된 문자열
 *
 * @example
 * formatISOtoReadable("2024-01-15T10:30:00") // "2024-01-15 10:30"
 */
export const formatISOtoReadable = (dateString) => {
    if (!dateString) return "-";
    // T를 공백으로 치환하고 초 단위 이하는 제거 (16자리까지만)
    return dateString.replace("T", " ").slice(0, 16);
};

// ============================================
// 💰 가격/숫자 포맷 함수들
// ============================================

/**
 * 가격 포맷 (천 단위 콤마)
 * 숫자를 한국식 가격 표기로 변환 (예: 15000 → 15,000)
 *
 * @param {number|string} price - 가격
 * @param {string} suffix - 접미사 (기본: "")
 * @returns {string} 포맷된 가격 문자열
 *
 * @example
 * formatPrice(15000)        // "15,000"
 * formatPrice(15000, "원")  // "15,000원"
 * formatPrice(null)         // "0"
 */
export const formatPrice = (price, suffix = "") => {
    // null이나 undefined인 경우 0 반환
    if (price === null || price === undefined) return `0${suffix}`;

    // 문자열인 경우 숫자로 변환
    const num = typeof price === "string" ? parseInt(price, 10) : price;
    // 숫자가 아닌 경우 0 반환
    if (isNaN(num)) return `0${suffix}`;

    // 한국 로케일로 천 단위 콤마 추가
    return `${num.toLocaleString("ko-KR")}${suffix}`;
};

/**
 * 만원 단위로 축약
 * 큰 금액을 간단하게 표시할 때 사용 (예: 목록 화면)
 *
 * @param {number} price - 가격
 * @returns {string} 축약된 가격
 *
 * @example
 * formatPriceShort(15000)   // "1.5만원"
 * formatPriceShort(150000)  // "15만원"
 */
export const formatPriceShort = (price) => {
    if (!price) return "0원";

    // 1만원 이상이면 만원 단위로 표시
    if (price >= 10000) {
        const man = price / 10000;
        // 정수면 소수점 없이, 아니면 소수점 첫째자리까지 표시
        return `${man % 1 === 0 ? man : man.toFixed(1)}만원`;
    }
    // 1만원 미만이면 그대로 표시
    return `${price.toLocaleString()}원`;
};

/**
 * 숫자에 천 단위 콤마 추가
 * 가격이 아닌 일반 숫자에 사용 (조회수, 좋아요 수 등)
 *
 * @param {number|string} num - 숫자
 * @returns {string} 포맷된 숫자
 *
 * @example
 * formatNumber(12345) // "12,345"
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return Number(num).toLocaleString("ko-KR");
};

// ============================================
// 🖼️ 이미지 URL 처리 함수들
// ============================================

// 환경변수 또는 기본 로컬 서버 주소
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * No Image 플레이스홀더 SVG (Base64)
 * 이미지가 없거나 로드 실패 시 표시할 기본 이미지
 */
export const NO_IMAGE_PLACEHOLDER =
    "data:image/svg+xml;base64," +
    btoa(
        '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="100%" height="100%" fill="#6B4F4F"/>' +
        '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
        'font-family="sans-serif" font-size="16" fill="#FFFFFF">No Image</text>' +
        "</svg>"
    );

/**
 * 상품 이미지 URL 처리 (상대경로 → 절대경로 변환)
 * 서버에서 받은 상대 경로를 완전한 URL로 변환
 *
 * @param {string} imagePath - 이미지 경로
 * @returns {string} 완전한 이미지 URL
 *
 * @example
 * getImageUrl("/uploads/product/abc.jpg")
 * // "http://localhost:8080/uploads/product/abc.jpg"
 *
 * getImageUrl("https://cloudinary.com/abc.jpg")
 * // "https://cloudinary.com/abc.jpg" (이미 절대 URL이면 그대로 반환)
 */
export const getImageUrl = (imagePath) => {
    // 이미지 경로가 없거나 빈 문자열이면 플레이스홀더 반환
    if (!imagePath || imagePath.trim() === "") {
        return NO_IMAGE_PLACEHOLDER;
    }

    // 이미 완전한 URL이면 (http:// 또는 https://) 그대로 반환
    // 외부 CDN이나 클라우드 스토리지 URL인 경우
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    // 상대 경로인 경우 API_BASE_URL을 앞에 붙여서 절대 경로로 변환
    const baseUrl = API_BASE_URL.replace(/\/$/, ""); // 마지막 슬래시 제거
    const cleanedPath = imagePath.replace(/^\//, ""); // 앞의 슬래시 제거

    return `${baseUrl}/${cleanedPath}`;
};

/**
 * 이미지 로드 에러 핸들러 (onError에 사용)
 * 이미지 로드 실패 시 플레이스홀더로 대체
 * 무한 루프 방지를 위해 한 번만 실행되도록 처리
 *
 * @param {Event} e - 이미지 에러 이벤트
 * @param {string} fallbackUrl - 대체 이미지 URL (기본: NO_IMAGE_PLACEHOLDER)
 *
 * @example
 * <img src={url} onError={(e) => handleImageError(e)} />
 */
export const handleImageError = (e, fallbackUrl = NO_IMAGE_PLACEHOLDER) => {
    // 이미 에러 처리가 된 경우 무한 루프 방지
    if (!e.target.dataset.errorHandled) {
        // 에러 처리 완료 플래그 설정
        e.target.dataset.errorHandled = "true";
        // 대체 이미지로 변경
        e.target.src = fallbackUrl;
    }
};

// ============================================
// 📱 전화번호 포맷 함수
// ============================================

/**
 * 전화번호 포맷 (010-1234-5678)
 * 숫자만 있는 전화번호를 하이픈이 포함된 형식으로 변환
 *
 * @param {string} phone - 전화번호
 * @returns {string} 포맷된 전화번호
 *
 * @example
 * formatPhone("01012345678") // "010-1234-5678"
 */
export const formatPhone = (phone) => {
    if (!phone) return "-";

    // 숫자가 아닌 모든 문자 제거 (\D는 숫자가 아닌 것을 의미)
    const cleaned = phone.replace(/\D/g, "");

    // 11자리 전화번호 (010-1234-5678)
    if (cleaned.length === 11) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    // 10자리 전화번호 (02-123-4567 등 지역번호)
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // 포맷할 수 없으면 원본 반환
    return phone;
};

// ============================================
// 📝 텍스트 처리 함수들
// ============================================

/**
 * 텍스트 자르기 (말줄임표 추가)
 * 긴 텍스트를 일정 길이로 자르고 "..." 추가
 * 목록 화면에서 제목이나 설명을 짧게 표시할 때 사용
 *
 * @param {string} text - 원본 텍스트
 * @param {number} maxLength - 최대 길이 (기본: 50)
 * @returns {string} 잘린 텍스트
 *
 * @example
 * truncateText("아주 긴 텍스트입니다...", 10) // "아주 긴 텍스..."
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    // 최대 길이보다 짧으면 그대로 반환
    if (text.length <= maxLength) return text;
    // 최대 길이만큼 자르고 "..." 추가
    return text.slice(0, maxLength) + "...";
};

/**
 * 파일 크기 포맷
 * 바이트를 읽기 쉬운 단위(KB, MB, GB)로 변환
 * 파일 업로드나 다운로드 화면에서 사용
 *
 * @param {number} bytes - 바이트 수
 * @returns {string} 포맷된 파일 크기
 *
 * @example
 * formatFileSize(1024)      // "1 KB"
 * formatFileSize(1048576)   // "1 MB"
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";

    const k = 1024; // 1KB = 1024 Bytes
    const sizes = ["Bytes", "KB", "MB", "GB"];

    // 몇 번째 단위인지 계산 (0: Bytes, 1: KB, 2: MB, 3: GB)
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // 해당 단위로 나누고 소수점 둘째자리까지 표시
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ============================================
// 🏷️ 상태 관련 함수들
// ============================================

/**
 * 거래 상태 정보 반환
 * 거래 상태 코드를 사용자에게 보여줄 텍스트와 스타일로 변환
 * 구매자와 판매자가 보는 텍스트가 다름
 *
 * @param {string} status - 상태 코드 (PENDING, COMPLETED, CANCELLED)
 * @param {boolean} isSeller - 판매자 여부
 * @returns {object} { text, className }
 *
 * @example
 * getTransactionStatus("PENDING", false)
 * // { text: "입금 대기", className: "bg-yellow-100 text-yellow-700" }
 *
 * getTransactionStatus("PENDING", true)
 * // { text: "입금 확인 대기", className: "bg-yellow-100 text-yellow-700" }
 */
export const getTransactionStatus = (status, isSeller = false) => {
    const statusMap = {
        PENDING: {
            // 구매자는 "입금 대기", 판매자는 "입금 확인 대기"
            text: isSeller ? "입금 확인 대기" : "입금 대기",
            className: "bg-yellow-100 text-yellow-700", // 노란색 배지
        },
        COMPLETED: {
            // 구매자는 "구매 확정", 판매자는 "판매 완료"
            text: isSeller ? "판매 완료" : "구매 확정",
            className: "bg-green-100 text-green-700", // 초록색 배지
        },
        CANCELLED: {
            text: "거래 취소",
            className: "bg-red-100 text-red-700", // 빨간색 배지
        },
    };

    // 매핑된 상태가 없으면 기본값 반환
    return (
        statusMap[status] || {
            text: status,
            className: "bg-gray-100 text-gray-700",
        }
    );
};

/**
 * 상품 상태 정보 반환
 * 상품의 판매 상태를 표시하는 배지 정보
 *
 * @param {string} status - 상태 코드 (AVAILABLE, RESERVED, SOLD)
 * @returns {object} { text, className }
 *
 * @example
 * getProductStatus("AVAILABLE")
 * // { text: "판매중", className: "bg-green-100 text-green-700" }
 */
export const getProductStatus = (status) => {
    const statusMap = {
        AVAILABLE: { text: "판매중", className: "bg-green-100 text-green-700" },
        RESERVED: { text: "예약중", className: "bg-orange-100 text-orange-700" },
        SOLD: { text: "판매완료", className: "bg-gray-100 text-gray-700" },
    };

    return (
        statusMap[status] || {
            text: status,
            className: "bg-gray-100 text-gray-700",
        }
    );
};

/**
 * Q&A 답변 상태 정보 반환
 * 문의 게시판에서 답변 완료 여부 표시
 *
 * @param {boolean} isAnswered - 답변 완료 여부
 * @returns {object} { text, className }
 *
 * @example
 * getQnaStatus(true)  // { text: "답변완료", className: "bg-green-100..." }
 * getQnaStatus(false) // { text: "미답변", className: "bg-red-100..." }
 */
export const getQnaStatus = (isAnswered) => {
    return isAnswered
        ? { text: "답변완료", className: "bg-green-100 text-green-700" }
        : { text: "미답변", className: "bg-red-100 text-red-700" };
};

/**
 * 회원 상태 정보 반환
 * 관리자 페이지에서 회원 활성화/정지 상태 표시
 *
 * @param {boolean} isActive - 활성화 여부
 * @returns {object} { text, className, icon }
 *
 * @example
 * getUserStatus(true)  // { text: "활성", className: "bg-green-100...", icon: "bi-check-circle" }
 * getUserStatus(false) // { text: "정지", className: "bg-red-100...", icon: "bi-x-circle" }
 */
export const getUserStatus = (isActive) => {
    return isActive
        ? {
            text: "활성",
            className: "bg-green-100 text-green-700",
            icon: "bi-check-circle", // 체크 아이콘
        }
        : {
            text: "정지",
            className: "bg-red-100 text-red-700",
            icon: "bi-x-circle", // X 아이콘
        };
};