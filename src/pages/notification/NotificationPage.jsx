// src/pages/notification/NotificationPage.jsx (경로는 형님 프로젝트에 맞게)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../api/notificationApi";
import useNotificationStore from "../../stores/notificationStore";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import NotificationItem from "../../components/notification/NotificationItem";
import Button from "../../components/common/Button";

const NotificationPage = () => {
    const {
        notifications,
        setNotifications,
        setUnreadCount,
        removeNotification,
    } = useNotificationStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all"); // all, unread, read

    const navigate = useNavigate();

    // 알림 목록 불러오기
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await notificationApi.getNotifications();

            if (response.data.success) {
                const data = response.data.data;
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error("알림 조회 실패:", err);
            setError("알림을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 알림 클릭 시 거래 상세 페이지로 이동
    const handleNotificationClick = (notification) => {
        // 거래 관련 알림만 이동
        if (
            notification.type === "PURCHASE" ||
            notification.type === "TRANSACTION"
        ) {
            // ⚠️ 백엔드 필드명에 맞게 수정 가능
            const transactionId = notification.transactionId;

            if (!transactionId) {
                console.warn("거래 ID가 없습니다:", notification);
                return;
            }

            // 라우터: path "/transactions/:id" 를 사용한다고 가정
            navigate(`/transactions/${transactionId}`);
        }
    };

    // 모든 알림 읽음 처리
    const handleMarkAllAsRead = async () => {
        if (!window.confirm("모든 알림을 읽음 처리하시겠습니까?")) {
            return;
        }

        try {
            await notificationApi.markAllAsRead();

            const updatedNotifications = notifications.map((n) => ({
                ...n,
                isRead: true,
                readDate: new Date().toISOString(),
            }));
            setNotifications(updatedNotifications);
            setUnreadCount(0);
        } catch (err) {
            console.error("모든 알림 읽음 처리 실패:", err);
            alert("알림 읽음 처리에 실패했습니다.");
        }
    };

    // 모든 알림 삭제
    const handleDeleteAll = async () => {
        if (!window.confirm("모든 알림을 삭제하시겠습니까?")) {
            return;
        }

        try {
            await notificationApi.deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("모든 알림 삭제 실패:", err);
            alert("알림 삭제에 실패했습니다.");
        }
    };

    // 개별 알림 삭제
    const handleDeleteNotification = (notificationId) => {
        removeNotification(notificationId);
    };

    // 필터링된 알림
    const filteredNotifications = notifications.filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.isRead;
        if (filter === "read") return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const readCount = notifications.filter((n) => n.isRead).length;

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">
                            <i className="bi bi-bell text-primary mr-2"></i>
                            알림
                        </h1>
                        <div className="flex gap-3">
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={unreadCount === 0}
                                className="text-primary hover:text-secondary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="bi bi-check-all mr-1"></i>모두 읽음 처리
                            </button>
                            <button
                                onClick={handleDeleteAll}
                                disabled={notifications.length === 0}
                                className="text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="bi bi-trash mr-1"></i>전체 삭제
                            </button>
                        </div>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6">
                            <ErrorMessage
                                message={error}
                                type="error"
                                onClose={() => setError("")}
                            />
                        </div>
                    )}

                    {/* 필터 탭 */}
                    <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                filter === "all"
                                    ? "bg-primary text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            전체 {notifications.length}
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                filter === "unread"
                                    ? "bg-primary text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            읽지 않음 {unreadCount}
                        </button>
                        <button
                            onClick={() => setFilter("read")}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                filter === "read"
                                    ? "bg-primary text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            읽음 {readCount}
                        </button>
                    </div>

                    {/* 알림 목록 */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="bg-white rounded-xl shadow-md p-16">
                                <Loading text="알림을 불러오는 중..." />
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-16 text-center">
                                <i className="bi bi-bell-slash text-6xl text-gray-300 mb-4"></i>
                                <p className="text-gray-500 text-lg">
                                    {filter === "all"
                                        ? "알림이 없습니다"
                                        : filter === "unread"
                                            ? "읽지 않은 알림이 없습니다"
                                            : "읽은 알림이 없습니다"}
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    새로운 알림이 오면 여기에 표시됩니다
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <NotificationItem
                                    key={notification.notificationId}
                                    notification={notification}
                                    onDelete={handleDeleteNotification}
                                    onClick={() => handleNotificationClick(notification)} // ✅ 클릭 시 거래 상세 이동
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default NotificationPage;



// import { useState, useEffect } from "react";
// import { notificationApi } from "../../api/notificationApi";
// import useNotificationStore from "../../stores/notificationStore";
// import Navbar from "../../components/common/Navbar";
// import Footer from "../../components/common/Footer";
// import Loading from "../../components/common/Loading";
// import ErrorMessage from "../../components/common/ErrorMessage";
// import NotificationItem from "../../components/notification/NotificationItem"; // ✅ 여기 수정!
// import Button from "../../components/common/Button";
//
// const NotificationPage = () => {
//   const {
//     notifications,
//     setNotifications,
//     setUnreadCount,
//     removeNotification,
//   } = useNotificationStore();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [filter, setFilter] = useState("all"); // all, unread, read
//
//   // 알림 목록 불러오기
//   useEffect(() => {
//     fetchNotifications();
//   }, []);
//
//   const fetchNotifications = async () => {
//     try {
//       setLoading(true);
//       setError("");
//
//       const response = await notificationApi.getNotifications();
//
//       if (response.data.success) {
//         const data = response.data.data;
//         setNotifications(data.notifications);
//         setUnreadCount(data.unreadCount);
//       }
//     } catch (err) {
//       console.error("알림 조회 실패:", err);
//       setError("알림을 불러오는데 실패했습니다.");
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // 모든 알림 읽음 처리
//   const handleMarkAllAsRead = async () => {
//     if (!window.confirm("모든 알림을 읽음 처리하시겠습니까?")) {
//       return;
//     }
//
//     try {
//       await notificationApi.markAllAsRead();
//
//       // 로컬 상태 업데이트
//       const updatedNotifications = notifications.map((n) => ({
//         ...n,
//         isRead: true,
//         readDate: new Date().toISOString(),
//       }));
//       setNotifications(updatedNotifications);
//       setUnreadCount(0);
//     } catch (err) {
//       console.error("모든 알림 읽음 처리 실패:", err);
//       alert("알림 읽음 처리에 실패했습니다.");
//     }
//   };
//
//   // 모든 알림 삭제
//   const handleDeleteAll = async () => {
//     if (!window.confirm("모든 알림을 삭제하시겠습니까?")) {
//       return;
//     }
//
//     try {
//       await notificationApi.deleteAllNotifications();
//       setNotifications([]);
//       setUnreadCount(0);
//     } catch (err) {
//       console.error("모든 알림 삭제 실패:", err);
//       alert("알림 삭제에 실패했습니다.");
//     }
//   };
//
//   // 알림 삭제 핸들러
//   const handleDeleteNotification = (notificationId) => {
//     removeNotification(notificationId);
//   };
//
//   // 필터링된 알림
//   const filteredNotifications = notifications.filter((n) => {
//     if (filter === "all") return true;
//     if (filter === "unread") return !n.isRead;
//     if (filter === "read") return n.isRead;
//     return true;
//   });
//
//   const unreadCount = notifications.filter((n) => !n.isRead).length;
//   const readCount = notifications.filter((n) => n.isRead).length;
//
//   return (
//     <>
//       <Navbar />
//
//       <div className="min-h-screen bg-gray-50 py-12">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* 헤더 */}
//           <div className="flex items-center justify-between mb-8">
//             <h1 className="text-3xl font-bold text-gray-800">
//               <i className="bi bi-bell text-primary mr-2"></i>
//               알림
//             </h1>
//             <div className="flex gap-3">
//               <button
//                 onClick={handleMarkAllAsRead}
//                 disabled={unreadCount === 0}
//                 className="text-primary hover:text-secondary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <i className="bi bi-check-all mr-1"></i>모두 읽음 처리
//               </button>
//               <button
//                 onClick={handleDeleteAll}
//                 disabled={notifications.length === 0}
//                 className="text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <i className="bi bi-trash mr-1"></i>전체 삭제
//               </button>
//             </div>
//           </div>
//
//           {/* 에러 메시지 */}
//           {error && (
//             <div className="mb-6">
//               <ErrorMessage
//                 message={error}
//                 type="error"
//                 onClose={() => setError("")}
//               />
//             </div>
//           )}
//
//           {/* 필터 탭 - 기존 HTML 스타일 복원 */}
//           <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2">
//             <button
//               onClick={() => setFilter("all")}
//               className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
//                 filter === "all"
//                   ? "bg-primary text-white"
//                   : "text-gray-700 hover:bg-gray-100"
//               }`}
//             >
//               전체 {notifications.length}
//             </button>
//             <button
//               onClick={() => setFilter("unread")}
//               className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
//                 filter === "unread"
//                   ? "bg-primary text-white"
//                   : "text-gray-700 hover:bg-gray-100"
//               }`}
//             >
//               읽지 않음 {unreadCount}
//             </button>
//             <button
//               onClick={() => setFilter("read")}
//               className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
//                 filter === "read"
//                   ? "bg-primary text-white"
//                   : "text-gray-700 hover:bg-gray-100"
//               }`}
//             >
//               읽음 {readCount}
//             </button>
//           </div>
//
//           {/* 알림 목록 */}
//           <div className="space-y-3">
//             {loading ? (
//               <div className="bg-white rounded-xl shadow-md p-16">
//                 <Loading text="알림을 불러오는 중..." />
//               </div>
//             ) : filteredNotifications.length === 0 ? (
//               <div className="bg-white rounded-xl shadow-md p-16 text-center">
//                 <i className="bi bi-bell-slash text-6xl text-gray-300 mb-4"></i>
//                 <p className="text-gray-500 text-lg">
//                   {filter === "all"
//                     ? "알림이 없습니다"
//                     : filter === "unread"
//                     ? "읽지 않은 알림이 없습니다"
//                     : "읽은 알림이 없습니다"}
//                 </p>
//                 <p className="text-gray-400 text-sm mt-2">
//                   새로운 알림이 오면 여기에 표시됩니다
//                 </p>
//               </div>
//             ) : (
//               filteredNotifications.map((notification) => (
//                 <NotificationItem
//                   key={notification.notificationId}
//                   notification={notification}
//                   onDelete={handleDeleteNotification}
//                 />
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//
//       <Footer />
//     </>
//   );
// };
//
// export default NotificationPage;
