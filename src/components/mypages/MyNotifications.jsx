import React from 'react';
import { Link } from 'react-router-dom';

// 이 코드는 MyPage.jsx에서 사용되던 renderNotifications 함수를 컴포넌트화한 것입니다.
// Props: recentNotifications, formatDate, markAsRead
const MyNotifications = ({ recentNotifications, formatDate, markAsRead }) => {

    // 알림 타입에 따른 아이콘 및 색상 정의
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'COMMENT':
                return { class: 'bi-chat-dots', color: 'text-primary' };
            case 'LIKE':
                return { class: 'bi-heart-fill', color: 'text-red-500' };
            case 'PURCHASE':
                return { class: 'bi-cart-fill', color: 'text-green-600' };
            case 'TRANSACTION':
                return { class: 'bi-check-circle-fill', color: 'text-blue-600' };
            default:
                return { class: 'bi-bell', color: 'text-gray-500' };
        }
    };

    return (
        <div id="content-notifications" className="tab-content">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">알림</h2>
                <Link to="/mypage/notifications" className="text-primary hover:text-secondary font-medium">
                    전체 보기 <i className="bi bi-arrow-right"></i>
                </Link>
            </div>

            <div className="space-y-3">
                {recentNotifications && recentNotifications.length > 0 ? (
                    recentNotifications.map((notification) => {
                        const { class: iconClass, color: iconColor } = getNotificationIcon(notification.type);

                        return (
                            <div key={notification.notificationId} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                                {/* 경로 변환 로직 유지 */}
                                <Link
                                    to={notification.url.replace('/product/', '/products/').replace('/transaction/', '/transactions/')}
                                    onClick={() => markAsRead(notification.notificationId)}
                                    className="block"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-primary/10'}`}>
                                                <i className={`${iconClass} text-xl ${iconColor}`}></i>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <p className={`mb-1 ${notification.isRead ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(notification.createdDate)}
                                            </p>
                                        </div>
                                        {/* Badge */}
                                        {!notification.isRead && (
                                            <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })
                ) : (
                    /* Empty State */
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