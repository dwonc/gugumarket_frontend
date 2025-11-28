import React from "react";
import { Link } from "react-router-dom";

/**
 * 마이페이지 알림 탭 컴포넌트
 * 사용자의 최근 알림 목록을 표시하고 읽음 처리 기능 제공
 *
 * @param {Array} recentNotifications - 알림 목록
 * @param {Function} formatDate - 날짜 포맷 함수
 * @param {Function} markAsRead - 알림 읽음 처리 함수
 */
const MyNotifications = ({ recentNotifications, formatDate, markAsRead }) => {
    /**
     * 알림 타입에 따른 아이콘 및 색상 반환
     * 알림의 종류를 시각적으로 구분하기 위한 아이콘과 색상 정의
     *
     * @param {string} type - 알림 타입 (COMMENT, LIKE, PURCHASE, TRANSACTION 등)
     * @returns {object} { class: 아이콘 클래스, color: 색상 클래스 }
     *
     * 알림 타입 설명:
     * - COMMENT: 댓글 알림 (내 상품에 댓글이 달렸을 때)
     * - LIKE: 좋아요 알림 (내 상품이 찜되었을 때)
     * - PURCHASE: 구매 알림 (내 상품이 구매되었을 때)
     * - TRANSACTION: 거래 관련 알림 (거래 완료, 입금 확인 등)
     */
    const getNotificationIcon = (type) => {
        switch (type) {
            case "COMMENT":
                return { class: "bi-chat-dots", color: "text-primary" }; // 댓글 아이콘
            case "LIKE":
                return { class: "bi-heart-fill", color: "text-red-500" }; // 하트 아이콘
            case "PURCHASE":
                return { class: "bi-cart-fill", color: "text-green-600" }; // 장바구니 아이콘
            case "TRANSACTION":
                return { class: "bi-check-circle-fill", color: "text-blue-600" }; // 체크 아이콘
            default:
                return { class: "bi-bell", color: "text-gray-500" }; // 기본 벨 아이콘
        }
    };

    return (
        <div id="content-notifications" className="tab-content">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">알림</h2>
                {/* 전체 알림 페이지로 이동하는 링크 */}
                <Link
                    to="/notifications"
                    className="text-primary hover:text-secondary font-medium"
                >
                    전체 보기 <i className="bi bi-arrow-right"></i>
                </Link>
            </div>

            <div className="space-y-3">
                {/* 알림이 있는 경우 목록 렌더링 */}
                {recentNotifications && recentNotifications.length > 0 ? (
                    recentNotifications.map((notification) => {
                        // 알림 타입에 따른 아이콘과 색상 가져오기
                        const { class: iconClass, color: iconColor } = getNotificationIcon(
                            notification.type
                        );

                        return (
                            <div
                                key={notification.notificationId}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                            >
                                {/*
                  알림 클릭 시 해당 페이지로 이동
                  경로 변환: 백엔드 URL 형식을 프론트엔드 라우팅 형식으로 변환
                  예: /product/123 → /products/123
                      /transaction/456 → /transactions/456
                */}
                                <Link
                                    to={notification.url
                                        .replace("/product/", "/products/")
                                        .replace("/transaction/", "/transactions/")}
                                    // 알림 클릭 시 읽음 처리
                                    onClick={() => markAsRead(notification.notificationId)}
                                    className="block"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* 알림 아이콘 영역 */}
                                        <div className="flex-shrink-0">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    // 읽은 알림은 회색, 읽지 않은 알림은 강조 색상
                                                    notification.isRead ? "bg-gray-100" : "bg-primary/10"
                                                }`}
                                            >
                                                <i className={`${iconClass} text-xl ${iconColor}`}></i>
                                            </div>
                                        </div>

                                        {/* 알림 내용 영역 */}
                                        <div className="flex-1">
                                            {/*
                        알림 메시지
                        읽지 않은 알림은 굵은 글씨로 강조 표시
                      */}
                                            <p
                                                className={`mb-1 ${
                                                    notification.isRead
                                                        ? "text-gray-600"
                                                        : "text-gray-800 font-semibold"
                                                }`}
                                            >
                                                {notification.message}
                                            </p>
                                            {/* 알림 생성 시간 표시 */}
                                            <p className="text-sm text-gray-500">
                                                {formatDate(notification.createdDate)}
                                            </p>
                                        </div>

                                        {/* 읽지 않은 알림 표시 배지 (빨간 점) */}
                                        {!notification.isRead && (
                                            <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })
                ) : (
                    /* 알림이 없을 때 빈 상태 표시 */
                    <div className="text-center py-16">
                        <i className="bi bi-bell-slash text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">알림이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyNotifications;