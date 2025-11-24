import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../api/notificationApi";
import useNotificationStore from "../../stores/notificationStore";

const NotificationItem = ({ notification, onDelete }) => {
    const navigate = useNavigate();
    const { markAsRead } = useNotificationStore();

    // 알림 타입별 아이콘 및 색상
    const getIconStyle = (type, isRead) => {
        const styles = {
            LIKE: {
                icon: "bi-heart-fill",
                color: isRead ? "text-gray-400" : "text-red-500",
            },
            PURCHASE: {
                icon: "bi-cart-fill",
                color: isRead ? "text-gray-400" : "text-green-600",
            },
            COMMENT: {
                icon: "bi-chat-dots",
                color: isRead ? "text-gray-400" : "text-primary",
            },
            QNA_ANSWER: {
                icon: "bi-question-circle-fill",
                color: isRead ? "text-gray-400" : "text-blue-600",
            },
            TRANSACTION: {
                icon: "bi-check-circle-fill",
                color: isRead ? "text-gray-400" : "text-primary",
            },
        };
        return styles[type] || { icon: "bi-bell-fill", color: "text-gray-500" };
    };

    // ✅ 알림 클릭 (읽음 처리 + 페이지 이동)
    const handleClick = async () => {
        try {
            if (!notification.isRead) {
                await notificationApi.markAsRead(notification.notificationId);
                markAsRead(notification.notificationId);
            }

            // ✅ PURCHASE / TRANSACTION 은 거래 상세로 강제 이동
            if (
                notification.type === "PURCHASE" ||
                notification.type === "TRANSACTION"
            ) {
                // 트랜잭션 ID 추출 (필드명에 맞게 조정 가능)
                const transactionId =
                    notification.transaction?.transactionId ?? notification.transactionId;

                if (transactionId) {
                    navigate(`/transactions/${transactionId}`);
                    return;
                }
            }

            // 그 외 알림은 서버에서 내려준 url 사용
            if (notification.url) {
                navigate(notification.url);
            }
        } catch (error) {
            console.error("알림 읽음 처리 실패:", error);
        }
    };

    // 읽음 처리만
    const handleMarkAsRead = async (e) => {
        e.stopPropagation();

        try {
            await notificationApi.markAsRead(notification.notificationId);
            markAsRead(notification.notificationId);
        } catch (error) {
            console.error("알림 읽음 처리 실패:", error);
            alert("알림 읽음 처리에 실패했습니다.");
        }
    };

    // 알림 삭제
    const handleDelete = async (e) => {
        e.stopPropagation();

        if (window.confirm("이 알림을 삭제하시겠습니까?")) {
            try {
                await notificationApi.deleteNotification(notification.notificationId);
                onDelete(notification.notificationId);
            } catch (error) {
                console.error("알림 삭제 실패:", error);
                alert("알림 삭제에 실패했습니다.");
            }
        }
    };

    // 시간 포맷팅
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "방금 전";
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return date.toLocaleDateString("ko-KR");
    };

    const iconStyle = getIconStyle(notification.type, notification.isRead);

    return (
        <div
            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer ${
                !notification.isRead ? "notification-unread" : "notification-read"
            }`}
        >
            <div className="p-6">
                <div className="flex items-start gap-4">
                    {/* 아이콘 */}
                    <div className="flex-shrink-0">
                        <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center ${
                                notification.isRead ? "bg-gray-100" : "bg-primary bg-opacity-10"
                            }`}
                        >
                            <i
                                className={`${iconStyle.icon} ${iconStyle.color} text-2xl`}
                            ></i>
                        </div>
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0" onClick={handleClick}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <p
                                className={`text-base ${
                                    notification.isRead
                                        ? "text-gray-600"
                                        : "text-gray-800 font-semibold"
                                }`}
                            >
                                {notification.message}
                            </p>
                            {!notification.isRead && (
                                <span className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full"></span>
                            )}
                        </div>

                        {/* 구매 알림 상세 */}
                        {notification.type === "PURCHASE" && notification.transaction && (
                            <div className="mt-4 bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                                        <i className="bi bi-person-fill text-green-700 text-xl"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            <span>{notification.senderNickname}</span>
                                            <span className="text-sm text-gray-500">
                        님이 구매했습니다
                      </span>
                                        </p>
                                        {notification.transaction.depositorName && (
                                            <p className="text-xs text-gray-500">
                                                입금자명:{" "}
                                                <span className="font-medium">
                          {notification.transaction.depositorName}
                        </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        {notification.transaction.productImage && (
                                            <img
                                                src={notification.transaction.productImage}
                                                alt={notification.transaction.productTitle}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">
                                                {notification.transaction.productTitle}
                                            </p>
                                            <p className="text-lg font-bold text-green-600 mt-1">
                                                {notification.transaction.amount?.toLocaleString()}원
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {notification.transaction.status && (
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">입금 상태</span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                notification.transaction.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                      {notification.transaction.status === "COMPLETED"
                          ? "입금 완료"
                          : "입금 대기"}
                    </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 거래 완료 알림 */}
                        {notification.type === "TRANSACTION" &&
                            notification.transaction && (
                                <div className="mt-4 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                    <div className="flex items-center gap-3">
                                        {notification.transaction.productImage && (
                                            <img
                                                src={notification.transaction.productImage}
                                                alt={notification.transaction.productTitle}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {notification.transaction.productTitle}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                구매자:{" "}
                                                <span className="font-semibold">
                          {notification.senderNickname}
                        </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        <p className="text-sm text-gray-500 mt-3">
                            <i className="bi bi-clock mr-1"></i>
                            {formatTime(notification.createdDate)}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                        {!notification.isRead && (
                            <button
                                onClick={handleMarkAsRead}
                                className="text-primary hover:text-secondary text-sm p-2 rounded hover:bg-gray-100"
                                title="읽음 처리"
                            >
                                <i className="bi bi-check2"></i>
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="text-gray-400 hover:text-red-600 text-sm p-2 rounded hover:bg-gray-100"
                            title="삭제"
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;

// import { useNavigate } from "react-router-dom";
// import { notificationApi } from "../../api/notificationApi";
// import useNotificationStore from "../../stores/notificationStore";
//
// const NotificationItem = ({ notification, onDelete }) => {
//   const navigate = useNavigate();
//   const { markAsRead } = useNotificationStore();
//
//   // 알림 타입별 아이콘 및 색상
//   const getIconStyle = (type, isRead) => {
//     const styles = {
//       LIKE: {
//         icon: "bi-heart-fill",
//         color: isRead ? "text-gray-400" : "text-red-500",
//       },
//       PURCHASE: {
//         icon: "bi-cart-fill",
//         color: isRead ? "text-gray-400" : "text-green-600",
//       },
//       COMMENT: {
//         icon: "bi-chat-dots",
//         color: isRead ? "text-gray-400" : "text-primary",
//       },
//       QNA_ANSWER: {
//         icon: "bi-question-circle-fill",
//         color: isRead ? "text-gray-400" : "text-blue-600",
//       },
//       TRANSACTION: {
//         icon: "bi-check-circle-fill",
//         color: isRead ? "text-gray-400" : "text-primary",
//       },
//     };
//     return styles[type] || { icon: "bi-bell-fill", color: "text-gray-500" };
//   };
//
//   // 알림 클릭 (읽음 처리 + 페이지 이동)
//   const handleClick = async () => {
//     try {
//       if (!notification.isRead) {
//         await notificationApi.markAsRead(notification.notificationId);
//         markAsRead(notification.notificationId);
//       }
//
//       if (notification.url) {
//         navigate(notification.url);
//       }
//     } catch (error) {
//       console.error("알림 읽음 처리 실패:", error);
//     }
//   };
//
//   // 읽음 처리만
//   const handleMarkAsRead = async (e) => {
//     e.stopPropagation();
//
//     try {
//       await notificationApi.markAsRead(notification.notificationId);
//       markAsRead(notification.notificationId);
//     } catch (error) {
//       console.error("알림 읽음 처리 실패:", error);
//       alert("알림 읽음 처리에 실패했습니다.");
//     }
//   };
//
//   // 알림 삭제
//   const handleDelete = async (e) => {
//     e.stopPropagation();
//
//     if (window.confirm("이 알림을 삭제하시겠습니까?")) {
//       try {
//         await notificationApi.deleteNotification(notification.notificationId);
//         onDelete(notification.notificationId);
//       } catch (error) {
//         console.error("알림 삭제 실패:", error);
//         alert("알림 삭제에 실패했습니다.");
//       }
//     }
//   };
//
//   // 시간 포맷팅
//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diff = now - date;
//
//     const minutes = Math.floor(diff / 60000);
//     const hours = Math.floor(diff / 3600000);
//     const days = Math.floor(diff / 86400000);
//
//     if (minutes < 1) return "방금 전";
//     if (minutes < 60) return `${minutes}분 전`;
//     if (hours < 24) return `${hours}시간 전`;
//     if (days < 7) return `${days}일 전`;
//
//     return date.toLocaleDateString("ko-KR");
//   };
//
//   const iconStyle = getIconStyle(notification.type, notification.isRead);
//
//   return (
//     <div
//       className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer ${
//         !notification.isRead ? "notification-unread" : "notification-read"
//       }`}
//     >
//       <div className="p-6">
//         <div className="flex items-start gap-4">
//           {/* 아이콘 - 기존 HTML 스타일 복원 */}
//           <div className="flex-shrink-0">
//             <div
//               className={`w-14 h-14 rounded-full flex items-center justify-center ${
//                 notification.isRead ? "bg-gray-100" : "bg-primary bg-opacity-10"
//               }`}
//             >
//               <i
//                 className={`${iconStyle.icon} ${iconStyle.color} text-2xl`}
//               ></i>
//             </div>
//           </div>
//
//           {/* 내용 */}
//           <div className="flex-1 min-w-0" onClick={handleClick}>
//             <div className="flex items-start justify-between gap-4 mb-2">
//               <p
//                 className={`text-base ${
//                   notification.isRead
//                     ? "text-gray-600"
//                     : "text-gray-800 font-semibold"
//                 }`}
//               >
//                 {notification.message}
//               </p>
//               {/* 읽지 않음 뱃지 */}
//               {!notification.isRead && (
//                 <span className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full"></span>
//               )}
//             </div>
//
//             {/* 구매 알림 - 상세 정보 표시 */}
//             {notification.type === "PURCHASE" && notification.transaction && (
//               <div className="mt-4 bg-green-50 rounded-lg p-4 border-2 border-green-200">
//                 {/* 구매자 정보 */}
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
//                     <i className="bi bi-person-fill text-green-700 text-xl"></i>
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-800">
//                       <span>{notification.senderNickname}</span>
//                       <span className="text-sm text-gray-500">
//                         님이 구매했습니다
//                       </span>
//                     </p>
//                     {notification.transaction.depositorName && (
//                       <p className="text-xs text-gray-500">
//                         입금자명:{" "}
//                         <span className="font-medium">
//                           {notification.transaction.depositorName}
//                         </span>
//                       </p>
//                     )}
//                   </div>
//                 </div>
//
//                 {/* 상품 정보 */}
//                 <div className="bg-white rounded-lg p-3">
//                   <div className="flex items-center gap-3">
//                     {notification.transaction.productImage && (
//                       <img
//                         src={notification.transaction.productImage}
//                         alt={notification.transaction.productTitle}
//                         className="w-16 h-16 object-cover rounded-lg"
//                       />
//                     )}
//                     <div className="flex-1">
//                       <p className="font-semibold text-gray-800">
//                         {notification.transaction.productTitle}
//                       </p>
//                       <p className="text-lg font-bold text-green-600 mt-1">
//                         {notification.transaction.amount?.toLocaleString()}원
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//
//                 {/* 입금 상태 */}
//                 {notification.transaction.status && (
//                   <div className="mt-3 flex items-center justify-between">
//                     <span className="text-sm text-gray-600">입금 상태</span>
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${
//                         notification.transaction.status === "COMPLETED"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-yellow-100 text-yellow-700"
//                       }`}
//                     >
//                       {notification.transaction.status === "COMPLETED"
//                         ? "입금 완료"
//                         : "입금 대기"}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             )}
//
//             {/* 거래 완료 알림 */}
//             {notification.type === "TRANSACTION" &&
//               notification.transaction && (
//                 <div className="mt-4 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
//                   <div className="flex items-center gap-3">
//                     {notification.transaction.productImage && (
//                       <img
//                         src={notification.transaction.productImage}
//                         alt={notification.transaction.productTitle}
//                         className="w-16 h-16 object-cover rounded-lg"
//                       />
//                     )}
//                     <div>
//                       <p className="font-semibold text-gray-800">
//                         {notification.transaction.productTitle}
//                       </p>
//                       <p className="text-sm text-gray-600 mt-1">
//                         구매자:{" "}
//                         <span className="font-semibold">
//                           {notification.senderNickname}
//                         </span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//
//             {/* 타임스탬프 */}
//             <p className="text-sm text-gray-500 mt-3">
//               <i className="bi bi-clock mr-1"></i>
//               {formatTime(notification.createdDate)}
//             </p>
//           </div>
//
//           {/* Actions - 기존 HTML 스타일 복원 */}
//           <div className="flex-shrink-0 flex flex-col gap-2">
//             {!notification.isRead && (
//               <button
//                 onClick={handleMarkAsRead}
//                 className="text-primary hover:text-secondary text-sm p-2 rounded hover:bg-gray-100"
//                 title="읽음 처리"
//               >
//                 <i className="bi bi-check2"></i>
//               </button>
//             )}
//             <button
//               onClick={handleDelete}
//               className="text-gray-400 hover:text-red-600 text-sm p-2 rounded hover:bg-gray-100"
//               title="삭제"
//             >
//               <i className="bi bi-trash"></i>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default NotificationItem;
