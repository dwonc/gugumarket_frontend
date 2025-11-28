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
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (separator === ".") {
      return `${year}. ${month}. ${day}`;
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

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}. ${month}. ${day} ${hours}:${minutes}`;
  } catch {
    return "-";
  }
};

/**
 * 상대적 시간 표시 (몇 분 전, 몇 시간 전 등)
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

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffSec < 60) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    if (diffWeek < 4) return `${diffWeek}주 전`;
    if (diffMonth < 12) return `${diffMonth}개월 전`;

    return formatDate(dateString);
  } catch {
    return "-";
  }
};

/**
 * ISO 형식에서 T 제거하고 보기 좋게 포맷
 * @param {string} dateString - ISO 형식 날짜 문자열
 * @returns {string} 포맷된 문자열
 *
 * @example
 * formatISOtoReadable("2024-01-15T10:30:00") // "2024-01-15 10:30"
 */
export const formatISOtoReadable = (dateString) => {
  if (!dateString) return "-";
  return dateString.replace("T", " ").slice(0, 16);
};

// ============================================
// 💰 가격/숫자 포맷 함수들
// ============================================

/**
 * 가격 포맷 (천 단위 콤마)
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
  if (price === null || price === undefined) return `0${suffix}`;

  const num = typeof price === "string" ? parseInt(price, 10) : price;
  if (isNaN(num)) return `0${suffix}`;

  return `${num.toLocaleString("ko-KR")}${suffix}`;
};

/**
 * 만원 단위로 축약
 * @param {number} price - 가격
 * @returns {string} 축약된 가격
 *
 * @example
 * formatPriceShort(15000)   // "1.5만원"
 * formatPriceShort(150000)  // "15만원"
 */
export const formatPriceShort = (price) => {
  if (!price) return "0원";

  if (price >= 10000) {
    const man = price / 10000;
    return `${man % 1 === 0 ? man : man.toFixed(1)}만원`;
  }
  return `${price.toLocaleString()}원`;
};

/**
 * 숫자에 천 단위 콤마 추가
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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * No Image 플레이스홀더 SVG (Base64)
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
 * @param {string} imagePath - 이미지 경로
 * @returns {string} 완전한 이미지 URL
 *
 * @example
 * getImageUrl("/uploads/product/abc.jpg")
 * // "http://localhost:8080/uploads/product/abc.jpg"
 *
 * getImageUrl("https://cloudinary.com/abc.jpg")
 * // "https://cloudinary.com/abc.jpg" (그대로 반환)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath.trim() === "") {
    return NO_IMAGE_PLACEHOLDER;
  }

  // 이미 절대 URL이면 그대로 반환
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // 상대 경로면 API_BASE_URL 붙이기
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const cleanedPath = imagePath.replace(/^\//, "");

  return `${baseUrl}/${cleanedPath}`;
};

/**
 * 이미지 로드 에러 핸들러 (onError에 사용)
 * @param {Event} e - 이미지 에러 이벤트
 * @param {string} fallbackUrl - 대체 이미지 URL (기본: NO_IMAGE_PLACEHOLDER)
 *
 * @example
 * <img src={url} onError={(e) => handleImageError(e)} />
 */
export const handleImageError = (e, fallbackUrl = NO_IMAGE_PLACEHOLDER) => {
  if (!e.target.dataset.errorHandled) {
    e.target.dataset.errorHandled = "true";
    e.target.src = fallbackUrl;
  }
};

// ============================================
// 📱 전화번호 포맷 함수
// ============================================

/**
 * 전화번호 포맷 (010-1234-5678)
 * @param {string} phone - 전화번호
 * @returns {string} 포맷된 전화번호
 *
 * @example
 * formatPhone("01012345678") // "010-1234-5678"
 */
export const formatPhone = (phone) => {
  if (!phone) return "-";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
};

// ============================================
// 📝 텍스트 처리 함수들
// ============================================

/**
 * 텍스트 자르기 (말줄임표 추가)
 * @param {string} text - 원본 텍스트
 * @param {number} maxLength - 최대 길이 (기본: 50)
 * @returns {string} 잘린 텍스트
 *
 * @example
 * truncateText("아주 긴 텍스트입니다...", 10) // "아주 긴 텍스..."
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * 파일 크기 포맷
 * @param {number} bytes - 바이트 수
 * @returns {string} 포맷된 파일 크기
 *
 * @example
 * formatFileSize(1024)      // "1 KB"
 * formatFileSize(1048576)   // "1 MB"
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ============================================
// 🏷️ 상태 관련 함수들
// ============================================

/**
 * 거래 상태 정보 반환
 * @param {string} status - 상태 코드
 * @param {boolean} isSeller - 판매자 여부
 * @returns {object} { text, className }
 *
 * @example
 * getTransactionStatus("PENDING", false)
 * // { text: "입금 대기", className: "bg-yellow-100 text-yellow-700" }
 */
export const getTransactionStatus = (status, isSeller = false) => {
  const statusMap = {
    PENDING: {
      text: isSeller ? "입금 확인 대기" : "입금 대기",
      className: "bg-yellow-100 text-yellow-700",
    },
    COMPLETED: {
      text: isSeller ? "판매 완료" : "구매 확정",
      className: "bg-green-100 text-green-700",
    },
    CANCELLED: {
      text: "거래 취소",
      className: "bg-red-100 text-red-700",
    },
  };

  return (
    statusMap[status] || {
      text: status,
      className: "bg-gray-100 text-gray-700",
    }
  );
};

/**
 * 상품 상태 정보 반환
 * @param {string} status - 상태 코드
 * @returns {object} { text, className }
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
 * @param {boolean} isAnswered - 답변 완료 여부
 * @returns {object} { text, className }
 */
export const getQnaStatus = (isAnswered) => {
  return isAnswered
    ? { text: "답변완료", className: "bg-green-100 text-green-700" }
    : { text: "미답변", className: "bg-red-100 text-red-700" };
};

/**
 * 회원 상태 정보 반환
 * @param {boolean} isActive - 활성화 여부
 * @returns {object} { text, className, icon }
 */
export const getUserStatus = (isActive) => {
  return isActive
    ? {
        text: "활성",
        className: "bg-green-100 text-green-700",
        icon: "bi-check-circle",
      }
    : {
        text: "정지",
        className: "bg-red-100 text-red-700",
        icon: "bi-x-circle",
      };
};
