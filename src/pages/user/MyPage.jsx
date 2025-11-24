// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate, Link, useLocation } from "react-router-dom";
// import api from "../../api/axios";
// import useAuthStore from "../../stores/authStore";
// import Navbar from "../../components/common/Navbar";
// import Footer from "../../components/common/Footer";
// import Loading from "../../components/common/Loading";
// import ErrorMessage from "../../components/common/ErrorMessage";
// import Button from "../../components/common/Button";
// import UserProfile from "../../components/user/UserProfile";
//
// const MyPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { isAuthenticated, user, logout } = useAuthStore();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState("purchases");
//
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate("/login");
//     }
//   }, [isAuthenticated, navigate]);
//
//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await api.get("/mypage");
//       if (response.data.success) {
//         setData(response.data);
//       } else {
//         setError(
//           response.data.message || "마이페이지 정보를 불러오는데 실패했습니다."
//         );
//       }
//     } catch (err) {
//       console.error("마이페이지 데이터 로드 오류:", err);
//       if (err.response?.status === 401) {
//         logout();
//         navigate("/login");
//         setError("세션이 만료되었습니다. 다시 로그인해주세요.");
//       } else {
//         setError("서버와 통신 중 오류가 발생했습니다.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//
//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchData();
//     } else if (user === null && !isAuthenticated && !loading) {
//       navigate("/login");
//     }
//   }, [isAuthenticated, fetchData, navigate, location.state]);
//
//   useEffect(() => {
//     if (isAuthenticated && user) {
//       fetchData();
//     }
//   }, [user]);
//
//   const showTab = (tabName) => {
//     setActiveTab(tabName);
//   };
//
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat("ko-KR").format(price);
//   };
//
//   const formatDate = (dateTimeString) => {
//     if (!dateTimeString) return "N/A";
//     const date = new Date(dateTimeString);
//     return date
//       .toLocaleString("ko-KR", {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })
//       .replace(". ", "-")
//       .replace(". ", "-")
//       .replace(".", "")
//       .replace(" ", " ");
//   };
//
//   const getStatusBadge = (statusName, isSeller) => {
//     const statusMap = {
//       PENDING: { text: "입금 대기", class: "bg-yellow-100 text-yellow-700" },
//       COMPLETED: { text: "구매 확정", class: "bg-green-100 text-green-700" },
//       CANCELLED: { text: "거래 취소", class: "bg-red-100 text-red-700" },
//       SELLER_PENDING: {
//         text: "입금 확인 대기",
//         class: "bg-orange-100 text-orange-700",
//       },
//       SELLER_COMPLETED: {
//         text: "판매 완료",
//         class: "bg-blue-100 text-blue-700",
//       },
//     };
//
//     const key = isSeller ? `SELLER_${statusName}` : statusName;
//     const defaultStatus = {
//       text: statusName,
//       class: "bg-gray-100 text-gray-700",
//     };
//
//     return statusMap[key] || statusMap[statusName] || defaultStatus;
//   };
//
//   const handleUnlike = async (productId) => {
//     if (!window.confirm("찜 목록에서 제거하시겠습니까?")) return;
//
//     try {
//       const res = await api.post(`/like/toggle/${productId}`);
//
//       if (res.status === 200) {
//         const updatedLikes = data.likes.filter(
//           (like) => like.productId !== productId
//         );
//         setData({ ...data, likes: updatedLikes });
//         alert("찜 목록에서 상품을 제거했습니다.");
//       }
//     } catch (err) {
//       console.error("찜 해제 오류:", err);
//       alert("찜 해제 중 오류가 발생했습니다. 로그인을 확인해주세요.");
//     }
//   };
//
//   const confirmPayment = async (transactionId) => {
//     if (!window.confirm("입금을 확인하셨습니까? 거래를 완료 처리합니다."))
//       return;
//
//     try {
//       const response = await api.post(`/transaction/${transactionId}/complete`);
//
//       if (response.status === 200) {
//         alert("거래가 완료되었습니다.");
//         fetchData();
//       } else {
//         alert("처리 중 오류가 발생했습니다.");
//       }
//     } catch (error) {
//       console.error("입금 확인 오류:", error);
//       alert("처리 중 오류가 발생했습니다.");
//     }
//   };
//
//   const markAsRead = async (notificationId) => {
//     try {
//       await api.post(`/mypage/notifications/${notificationId}/read`);
//
//       setData((prevData) => {
//         const updatedNotifications = prevData.recentNotifications.map((notif) =>
//           notif.notificationId === notificationId
//             ? { ...notif, isRead: true }
//             : notif
//         );
//         return {
//           ...prevData,
//           recentNotifications: updatedNotifications,
//           unreadCount: prevData.unreadCount > 0 ? prevData.unreadCount - 1 : 0,
//         };
//       });
//     } catch (error) {
//       console.error("알림 읽음 처리 오류:", error);
//     }
//   };
//
//   if (loading || !data) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Navbar />
//         <main className="flex-grow flex items-center justify-center">
//           <Loading size="lg" text="마이페이지 정보를 불러오는 중..." />
//         </main>
//         <Footer />
//       </div>
//     );
//   }
//
//   if (error) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Navbar />
//         <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <ErrorMessage message={error} type="error" />
//           <Button onClick={fetchData} className="mt-4">
//             다시 시도
//           </Button>
//         </main>
//         <Footer />
//       </div>
//     );
//   }
//
//   const {
//     user: apiUser,
//     purchases,
//     sales,
//     likes,
//     recentNotifications,
//     unreadCount,
//   } = data;
//
//   // 구매내역 탭
//   const renderPurchases = () => (
//     <div id="content-purchases" className="tab-content">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">구매내역</h2>
//       <div className="space-y-4">
//         {purchases && purchases.length > 0 ? (
//           purchases.map((transaction) => {
//             const badge = getStatusBadge(transaction.status, false);
//             return (
//               <div
//                 key={transaction.transactionId}
//                 className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
//               >
//                 <div className="flex gap-4 items-center">
//                   {/* ✅ 이미지 수정 */}
//                   <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
//                     {transaction.productImage ? (
//                       <img
//                         src={transaction.productImage}
//                         alt={transaction.productTitle}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src =
//                             "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%236B4F4F'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='white'%3ENo Image%3C/text%3E%3C/svg%3E";
//                         }}
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center bg-primary">
//                         <i className="bi bi-image text-white text-3xl"></i>
//                       </div>
//                     )}
//                   </div>
//
//                   <div className="flex-1">
//                     <h3 className="text-lg font-bold text-gray-800 mb-2">
//                       {transaction.productTitle}
//                     </h3>
//                     <p className="text-2xl font-bold text-primary mb-2">
//                       {formatPrice(transaction.productPrice)}원
//                     </p>
//                     <p className="text-gray-600 text-sm mb-1">
//                       판매자:{" "}
//                       <span className="font-medium">
//                         {transaction.sellerName}
//                       </span>
//                     </p>
//                     <p className="text-gray-500 text-sm">
//                       구매일: {formatDate(transaction.transactionDate)}
//                     </p>
//                   </div>
//
//                   <div className="flex flex-col justify-between items-end h-full">
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
//                     >
//                       {badge.text}
//                     </span>
//
//                     <div className="mt-3 space-y-2">
//                       {transaction.status === "COMPLETED" && (
//                         <button className="text-gray-600 hover:text-primary text-sm w-full text-right">
//                           <i className="bi bi-chat-dots mr-1"></i>문의하기
//                         </button>
//                       )}
//                       {transaction.status === "PENDING" && (
//                         <button className="text-blue-600 hover:text-blue-800 text-sm w-full text-right font-medium">
//                           <i className="bi bi-credit-card mr-1"></i>입금 정보
//                           보기
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="text-center py-16">
//             <i className="bi bi-bag-x text-6xl text-gray-300 mb-4"></i>
//             <p className="text-gray-500 text-lg">구매내역이 없습니다.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
//
//   // 판매내역 탭
//   const renderSales = () => (
//     <div id="content-sales" className="tab-content">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">판매내역</h2>
//       <div className="space-y-4">
//         {sales && sales.length > 0 ? (
//           sales.map((transaction) => {
//             const badge = getStatusBadge(transaction.status, true);
//             return (
//               <div
//                 key={transaction.transactionId}
//                 className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
//               >
//                 <div className="flex gap-4 items-center">
//                   {/* ✅ 이미지 수정 */}
//                   <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
//                     {transaction.productImage ? (
//                       <img
//                         src={transaction.productImage}
//                         alt={transaction.productTitle}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src =
//                             "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%236B4F4F'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='white'%3ENo Image%3C/text%3E%3C/svg%3E";
//                         }}
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center bg-primary">
//                         <i className="bi bi-image text-white text-3xl"></i>
//                       </div>
//                     )}
//                   </div>
//
//                   <div className="flex-1">
//                     <h3 className="text-lg font-bold text-gray-800 mb-2">
//                       {transaction.productTitle}
//                     </h3>
//                     <p className="text-2xl font-bold text-primary mb-2">
//                       {formatPrice(transaction.productPrice)}원
//                     </p>
//                     <p className="text-gray-600 text-sm mb-1">
//                       구매자:{" "}
//                       <span className="font-medium">
//                         {transaction.buyerName}
//                       </span>
//                     </p>
//                     <p className="text-gray-500 text-sm">
//                       판매일: {formatDate(transaction.transactionDate)}
//                     </p>
//                   </div>
//
//                   <div className="flex flex-col justify-between items-end h-full">
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
//                     >
//                       {badge.text}
//                     </span>
//
//                     <div className="mt-3 space-y-2">
//                       {transaction.status === "COMPLETED" && (
//                         <button className="text-gray-600 hover:text-primary text-sm w-full text-right">
//                           <i className="bi bi-chat-dots mr-1"></i>문의하기
//                         </button>
//                       )}
//                       {transaction.status === "PENDING" && (
//                         <button
//                           onClick={() =>
//                             confirmPayment(transaction.transactionId)
//                           }
//                           className="bg-primary hover:bg-secondary text-white text-sm px-4 py-2 rounded-lg w-full font-medium transition-all"
//                         >
//                           <i className="bi bi-check-circle mr-1"></i>입금
//                           확인하기
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="text-center py-16">
//             <i className="bi bi-receipt text-6xl text-gray-300 mb-4"></i>
//             <p className="text-gray-500 text-lg">판매내역이 없습니다.</p>
//             <Button
//               onClick={() => navigate("/product/write")}
//               variant="primary"
//               size="md"
//               className="mt-4"
//             >
//               상품 등록하기
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
//
//   // 찜한 목록 탭
//   const renderLikes = () => (
//     <div id="content-likes" className="tab-content">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">찜한 목록</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {likes && likes.length > 0 ? (
//           likes.map((like) => (
//             <div
//               key={like.likeId}
//               className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
//             >
//               <div className="relative">
//                 <Link to={`/product/${like.productId}`}>
//                   {/* ✅ 이미지 수정 */}
//                   <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
//                     {like.productImage ? (
//                       <img
//                         src={like.productImage}
//                         alt={like.productTitle}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src =
//                             "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%236B4F4F'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='white'%3ENo Image%3C/text%3E%3C/svg%3E";
//                         }}
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center bg-primary">
//                         <i className="bi bi-image text-white text-4xl"></i>
//                       </div>
//                     )}
//                   </div>
//                 </Link>
//                 {/* 찜 해제 버튼 */}
//                 <button
//                   type="button"
//                   onClick={() => handleUnlike(like.productId)}
//                   className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white z-10"
//                 >
//                   <i className="bi bi-heart-fill text-red-500 text-xl"></i>
//                 </button>
//               </div>
//               <div className="p-4">
//                 <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">
//                   {like.productTitle}
//                 </h3>
//                 <p className="text-xl font-bold text-primary mb-2">
//                   {formatPrice(like.productPrice)}원
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   <i className="bi bi-geo-alt"></i>
//                   <span className="ml-1">위치 정보 없음</span>
//                 </p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="col-span-4 text-center py-16">
//             <i className="bi bi-heart text-6xl text-gray-300 mb-4"></i>
//             <p className="text-gray-500 text-lg">찜한 상품이 없습니다.</p>
//             <Button
//               onClick={() => navigate("/")}
//               variant="primary"
//               size="md"
//               className="mt-4"
//             >
//               상품 둘러보기
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
//
//   // 알림 탭
//   const renderNotifications = () => (
//     <div id="content-notifications" className="tab-content">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">알림</h2>
//         <Link
//           to="/mypage/notifications"
//           className="text-primary hover:text-secondary font-medium"
//         >
//           전체 보기 <i className="bi bi-arrow-right"></i>
//         </Link>
//       </div>
//
//       <div className="space-y-3">
//         {recentNotifications && recentNotifications.length > 0 ? (
//           recentNotifications.map((notification) => {
//             let iconClass;
//             let iconColor;
//
//             switch (notification.type) {
//               case "COMMENT":
//                 iconClass = "bi-chat-dots";
//                 iconColor = "text-primary";
//                 break;
//               case "LIKE":
//                 iconClass = "bi-heart-fill";
//                 iconColor = "text-red-500";
//                 break;
//               case "PURCHASE":
//                 iconClass = "bi-cart-fill";
//                 iconColor = "text-green-600";
//                 break;
//               case "TRANSACTION":
//                 iconClass = "bi-check-circle-fill";
//                 iconColor = "text-blue-600";
//                 break;
//               default:
//                 iconClass = "bi-bell";
//                 iconColor = "text-gray-500";
//             }
//
//             return (
//               <div
//                 key={notification.notificationId}
//                 className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
//               >
//                 <Link
//                   to={notification.url}
//                   onClick={() => markAsRead(notification.notificationId)}
//                   className="block"
//                 >
//                   <div className="flex items-start gap-3">
//                     <div className="flex-shrink-0">
//                       <div
//                         className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                           notification.isRead ? "bg-gray-100" : "bg-primary/10"
//                         }`}
//                       >
//                         <i className={`${iconClass} text-xl ${iconColor}`}></i>
//                       </div>
//                     </div>
//
//                     <div className="flex-1">
//                       <p
//                         className={`mb-1 ${
//                           notification.isRead
//                             ? "text-gray-600"
//                             : "text-gray-800 font-semibold"
//                         }`}
//                       >
//                         {notification.message}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         {formatDate(notification.createdDate)}
//                       </p>
//                     </div>
//                     {!notification.isRead && (
//                       <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
//                     )}
//                   </div>
//                 </Link>
//               </div>
//             );
//           })
//         ) : (
//           <div className="text-center py-16">
//             <i className="bi bi-bell-slash text-6xl text-gray-300 mb-4"></i>
//             <p className="text-gray-500 text-lg">알림이 없습니다.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
//
//   return (
//     <>
//       <Navbar />
//
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <UserProfile user={apiUser} />
//
//         <div className="bg-white rounded-t-2xl shadow-lg">
//           <div className="flex border-b border-gray-200">
//             {[
//               { name: "purchases", icon: "bi-bag", label: "구매내역" },
//               { name: "sales", icon: "bi-receipt", label: "판매내역" },
//               { name: "likes", icon: "bi-heart", label: "찜한 목록" },
//               {
//                 name: "notifications",
//                 icon: "bi-bell",
//                 label: "알림",
//                 count: unreadCount,
//               },
//             ].map((tab) => (
//               <button
//                 key={tab.name}
//                 onClick={() => showTab(tab.name)}
//                 className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
//                   activeTab === tab.name
//                     ? "active-tab bg-primary text-white"
//                     : "text-gray-600 hover:text-primary hover:bg-gray-50"
//                 }`}
//               >
//                 <i className={`${tab.icon} mr-2`}></i>
//                 {tab.label}
//                 {tab.count > 0 && (
//                   <span
//                     className={`absolute top-2 right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
//                       activeTab === tab.name
//                         ? "bg-white text-red-500"
//                         : "bg-red-500"
//                     }`}
//                     style={{ right: "1rem" }}
//                   >
//                     {tab.count}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>
//
//         <div className="bg-white rounded-b-2xl shadow-lg p-8">
//           {activeTab === "purchases" && renderPurchases()}
//           {activeTab === "sales" && renderSales()}
//           {activeTab === "likes" && renderLikes()}
//           {activeTab === "notifications" && renderNotifications()}
//         </div>
//       </div>
//
//       <Footer />
//     </>
//   );
// };
//
// export default MyPage;


//-----------------------------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../../api/axios";
import useAuthStore from "../../stores/authStore";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import UserProfile from "../../components/user/UserProfile";
import reportApi from "@/api/reportApi.js";

const MyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("purchases");
    const [reports, setReports] = useState([]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/mypage");
            if (response.data.success) {
                setData(response.data);
            } else {
                setError(
                    response.data.message || "마이페이지 정보를 불러오는데 실패했습니다."
                );
            }
        } catch (err) {
            console.error("마이페이지 데이터 로드 오류:", err);
            if (err.response?.status === 401) {
                logout();
                navigate("/login");
                setError("세션이 만료되었습니다. 다시 로그인해주세요.");
            } else {
                setError("서버와 통신 중 오류가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        console.log('🔍 fetchReports 호출!');
        console.log('🔍 user:', user);
        console.log('🔍 user?.role:', user?.role);

        if (user?.role !== 'ADMIN') {
            console.log('❌ Admin 아님 - 종료');
            return;
        }

        console.log('✅ API 호출 시작!');
        try {
            const response = await api.get('/report/admin/list');  // 👈 변경!
            console.log('📦 응답:', response.data);
            if (response.data.success) {
                setReports(response.data.reports || []);
            }
        } catch (err) {
            console.error('❌ 신고 내역 조회 실패:', err);
        }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        } else if (user === null && !isAuthenticated && !loading) {
            navigate("/login");
        }
    }, [isAuthenticated, fetchData, navigate, location.state]);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN' && activeTab === 'reports') {
            fetchReports();
        }
    }, [isAuthenticated, user, activeTab, fetchReports]);

    const showTab = (tabName) => {
        setActiveTab(tabName);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("ko-KR").format(price);
    };

    const formatDate = (dateTimeString) => {
        if (!dateTimeString) return "N/A";
        const date = new Date(dateTimeString);
        return date
            .toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })
            .replace(". ", "-")
            .replace(". ", "-")
            .replace(".", "")
            .replace(" ", " ");
    };

    const getStatusBadge = (statusName, isSeller) => {
        const statusMap = {
            PENDING: { text: "입금 대기", class: "bg-yellow-100 text-yellow-700" },
            COMPLETED: { text: "구매 확정", class: "bg-green-100 text-green-700" },
            CANCELLED: { text: "거래 취소", class: "bg-red-100 text-red-700" },
            SELLER_PENDING: {
                text: "입금 확인 대기",
                class: "bg-orange-100 text-orange-700",
            },
            SELLER_COMPLETED: {
                text: "판매 완료",
                class: "bg-blue-100 text-blue-700",
            },
        };

        const key = isSeller ? `SELLER_${statusName}` : statusName;
        const defaultStatus = {
            text: statusName,
            class: "bg-gray-100 text-gray-700",
        };

        return statusMap[key] || statusMap[statusName] || defaultStatus;
    };

    const handleUnlike = async (productId) => {
        if (!window.confirm("찜 목록에서 제거하시겠습니까?")) return;

        try {
            const res = await api.post(`/like/toggle/${productId}`);

            if (res.status === 200) {
                const updatedLikes = data.likes.filter(
                    (like) => like.productId !== productId
                );
                setData({ ...data, likes: updatedLikes });
                alert("찜 목록에서 상품을 제거했습니다.");
            }
        } catch (err) {
            console.error("찜 해제 오류:", err);
            alert("찜 해제 중 오류가 발생했습니다. 로그인을 확인해주세요.");
        }
    };

    const confirmPayment = async (transactionId) => {
        if (!window.confirm("입금을 확인하셨습니까? 거래를 완료 처리합니다."))
            return;

        try {
            const response = await api.post(`/transaction/${transactionId}/complete`);

            if (response.status === 200) {
                alert("거래가 완료되었습니다.");
                fetchData();
            } else {
                alert("처리 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("입금 확인 오류:", error);
            alert("처리 중 오류가 발생했습니다.");
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.post(`/mypage/notifications/${notificationId}/read`);

            setData((prevData) => {
                const updatedNotifications = prevData.recentNotifications.map((notif) =>
                    notif.notificationId === notificationId
                        ? { ...notif, isRead: true }
                        : notif
                );
                return {
                    ...prevData,
                    recentNotifications: updatedNotifications,
                    unreadCount: prevData.unreadCount > 0 ? prevData.unreadCount - 1 : 0,
                };
            });
        } catch (error) {
            console.error("알림 읽음 처리 오류:", error);
        }
    };

    if (loading || !data) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <Loading size="lg" text="마이페이지 정보를 불러오는 중..." />
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ErrorMessage message={error} type="error" />
                    <Button onClick={fetchData} className="mt-4">
                        다시 시도
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    const {
        user: apiUser,
        purchases,
        sales,
        likes,
        recentNotifications,
        unreadCount,
    } = data;

    // 구매내역 탭
    const renderPurchases = () => (
        <div id="content-purchases" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">구매내역</h2>
            <div className="space-y-4">
                {purchases && purchases.length > 0 ? (
                    purchases.map((transaction) => {
                        const badge = getStatusBadge(transaction.status, false);
                        return (
                            <div
                                key={transaction.transactionId}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        {transaction.productImage ? (
                                            <img
                                                src={transaction.productImage}
                                                alt={transaction.productTitle}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%236B4F4F'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='white'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary">
                                                <i className="bi bi-image text-white text-3xl"></i>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                                            {transaction.productTitle}
                                        </h3>
                                        <p className="text-2xl font-bold text-primary mb-2">
                                            {formatPrice(transaction.productPrice)}원
                                        </p>
                                        <p className="text-gray-600 text-sm mb-1">
                                            판매자:{" "}
                                            <span className="font-medium">
                        {transaction.sellerName}
                      </span>
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            구매일: {formatDate(transaction.transactionDate)}
                                        </p>
                                    </div>

                                    <div className="flex flex-col justify-between items-end h-full">
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
                    >
                      {badge.text}
                    </span>

                                        <div className="mt-3 space-y-2">
                                            {transaction.status === "COMPLETED" && (
                                                <button className="text-gray-600 hover:text-primary text-sm w-full text-right">
                                                    <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                </button>
                                            )}
                                            {transaction.status === "PENDING" && (
                                                <button className="text-blue-600 hover:text-blue-800 text-sm w-full text-right font-medium">
                                                    <i className="bi bi-credit-card mr-1"></i>입금 정보
                                                    보기
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16">
                        <i className="bi bi-bag-x text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">구매내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );

    // 판매내역 탭
    const renderSales = () => (
        <div id="content-sales" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">판매내역</h2>
            <div className="space-y-4">
                {sales && sales.length > 0 ? (
                    sales.map((transaction) => {
                        const badge = getStatusBadge(transaction.status, true);
                        return (
                            <div
                                key={transaction.transactionId}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        {transaction.productImage ? (
                                            <img
                                                src={transaction.productImage}
                                                alt={transaction.productTitle}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%236B4F4F'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='white'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary">
                                                <i className="bi bi-image text-white text-3xl"></i>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                                            {transaction.productTitle}
                                        </h3>
                                        <p className="text-2xl font-bold text-primary mb-2">
                                            {formatPrice(transaction.productPrice)}원
                                        </p>
                                        <p className="text-gray-600 text-sm mb-1">
                                            구매자:{" "}
                                            <span className="font-medium">
                        {transaction.buyerName}
                      </span>
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            판매일: {formatDate(transaction.transactionDate)}
                                        </p>
                                    </div>

                                    <div className="flex flex-col justify-between items-end h-full">
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
                    >
                      {badge.text}
                    </span>

                                        <div className="mt-3 space-y-2">
                                            {transaction.status === "COMPLETED" && (
                                                <button className="text-gray-600 hover:text-primary text-sm w-full text-right">
                                                    <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                </button>
                                            )}
                                            {transaction.status === "PENDING" && (
                                                <button
                                                    onClick={() =>
                                                        confirmPayment(transaction.transactionId)
                                                    }
                                                    className="bg-primary hover:bg-secondary text-white text-sm px-4 py-2 rounded-lg w-full font-medium transition-all"
                                                >
                                                    <i className="bi bi-check-circle mr-1"></i>입금
                                                    확인하기
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16">
                        <i className="bi bi-receipt text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">판매내역이 없습니다.</p>
                        <Button
                            onClick={() => navigate("/product/write")}
                            variant="primary"
                            size="md"
                            className="mt-4"
                        >
                            상품 등록하기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    // 찜한 목록 탭
    const renderLikes = () => (
        <div id="content-likes" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">찜한 목록</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {likes && likes.length > 0 ? (
                    likes.map((like) => (
                        <div
                            key={like.likeId}
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                        >
                            <div className="relative">
                                <Link to={`/product/${like.productId}`}>
                                    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                                        {like.productImage ? (
                                            <img
                                                src={like.productImage}
                                                alt={like.productTitle}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%236B4F4F'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='white'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary">
                                                <i className="bi bi-image text-white text-4xl"></i>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleUnlike(like.productId)}
                                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white z-10"
                                >
                                    <i className="bi bi-heart-fill text-red-500 text-xl"></i>
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">
                                    {like.productTitle}
                                </h3>
                                <p className="text-xl font-bold text-primary mb-2">
                                    {formatPrice(like.productPrice)}원
                                </p>
                                <p className="text-sm text-gray-500">
                                    <i className="bi bi-geo-alt"></i>
                                    <span className="ml-1">위치 정보 없음</span>
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-4 text-center py-16">
                        <i className="bi bi-heart text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">찜한 상품이 없습니다.</p>
                        <Button
                            onClick={() => navigate("/")}
                            variant="primary"
                            size="md"
                            className="mt-4"
                        >
                            상품 둘러보기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    // 알림 탭
    const renderNotifications = () => (
        <div id="content-notifications" className="tab-content">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">알림</h2>
                <Link
                    to="/mypage/notifications"
                    className="text-primary hover:text-secondary font-medium"
                >
                    전체 보기 <i className="bi bi-arrow-right"></i>
                </Link>
            </div>

            <div className="space-y-3">
                {recentNotifications && recentNotifications.length > 0 ? (
                    recentNotifications.map((notification) => {
                        let iconClass;
                        let iconColor;

                        switch (notification.type) {
                            case "COMMENT":
                                iconClass = "bi-chat-dots";
                                iconColor = "text-primary";
                                break;
                            case "LIKE":
                                iconClass = "bi-heart-fill";
                                iconColor = "text-red-500";
                                break;
                            case "PURCHASE":
                                iconClass = "bi-cart-fill";
                                iconColor = "text-green-600";
                                break;
                            case "TRANSACTION":
                                iconClass = "bi-check-circle-fill";
                                iconColor = "text-blue-600";
                                break;
                            default:
                                iconClass = "bi-bell";
                                iconColor = "text-gray-500";
                        }

                        return (
                            <div
                                key={notification.notificationId}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                            >
                                <Link
                                    to={notification.url}
                                    onClick={() => markAsRead(notification.notificationId)}
                                    className="block"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    notification.isRead ? "bg-gray-100" : "bg-primary/10"
                                                }`}
                                            >
                                                <i className={`${iconClass} text-xl ${iconColor}`}></i>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <p
                                                className={`mb-1 ${
                                                    notification.isRead
                                                        ? "text-gray-600"
                                                        : "text-gray-800 font-semibold"
                                                }`}
                                            >
                                                {notification.message}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(notification.createdDate)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16">
                        <i className="bi bi-bell-slash text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">알림이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );

    // 신고 내역 탭 (Admin 전용)
    // const renderReports = () => (
    //     <div id="content-reports" className="tab-content">
    //         <h2 className="text-2xl font-bold text-gray-800 mb-6">신고 내역</h2>
    //         <div className="space-y-4">
    //             {reports && reports.length > 0 ? (
    //                 reports.map((report) => (
    //                     <div
    //                         key={report.reportId}
    //                         className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
    //                     >
    //                         <div className="flex gap-4">
    //                             <div className="flex-1">
    //                                 <div className="flex items-center gap-3 mb-3">
    //                 <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
    //                   <i className="bi bi-flag-fill mr-1"></i>신고
    //                 </span>
    //                                     <span className="text-sm text-gray-500">
    //                   신고 ID: {report.reportId}
    //                 </span>
    //                                 </div>
    //
    //                                 <h3 className="text-lg font-bold text-gray-800 mb-2">
    //                                     상품 ID: {report.product?.productId || 'N/A'}
    //                                 </h3>
    //
    //                                 <div className="space-y-2 text-sm text-gray-600">
    //                                     <p>
    //                                         <i className="bi bi-person mr-2"></i>
    //                                         <span className="font-medium">신고자:</span> {report.reporter?.nickname || report.reporter?.userName || 'N/A'}
    //                                     </p>
    //                                     <p>
    //                                         <i className="bi bi-chat-square-text mr-2"></i>
    //                                         <span className="font-medium">사유:</span> {report.reason || '부적절한 게시물'}
    //                                     </p>
    //                                     <p>
    //                                         <i className="bi bi-calendar3 mr-2"></i>
    //                                         <span className="font-medium">신고일:</span> {formatDate(report.createdDate)}
    //                                     </p>
    //                                 </div>
    //                             </div>
    //
    //                             <div className="flex flex-col gap-2">
    //                                 <Button
    //                                     onClick={() => {
    //                                         if (report.productId) {  // 👈 변경!
    //                                             navigate(`/products/${report.productId}`);  // 👈 변경!
    //                                         } else {
    //                                             alert('상품 정보를 찾을 수 없습니다.');
    //                                         }
    //                                     }}
    //                                     variant="outline"
    //                                     size="sm"
    //                                 >
    //                                     <i className="bi bi-eye mr-1"></i>상품 보기
    //                                 </Button>
    //                             </div>
    //                         </div>
    //                     </div>
    //                 ))
    //             ) : (
    //                 <div className="text-center py-16">
    //                     <i className="bi bi-flag text-6xl text-gray-300 mb-4"></i>
    //                     <p className="text-gray-500 text-lg">신고 내역이 없습니다.</p>
    //                 </div>
    //             )}
    //         </div>
    //     </div>
    // );

    // 신고 내역 탭 (Admin 전용)
    const renderReports = () => (
        <div id="content-reports" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">신고 내역</h2>
            <div className="space-y-4">
                {reports && reports.length > 0 ? (
                    reports.map((report) => (
                        <div
                            key={report.reportId}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                        >
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                    <i className="bi bi-flag-fill mr-1"></i>신고
                  </span>
                                        {/* 👇 상태 배지 추가! */}
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                            report.status === 'RESOLVED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                    {report.status === 'RESOLVED' ? '✅ 처리 완료' : '⏳ 처리 대기'}
                  </span>
                                        <span className="text-sm text-gray-500">
                    신고 ID: {report.reportId}
                  </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {report.productTitle || `상품 ID: ${report.productId}`}
                                    </h3>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>
                                            <i className="bi bi-person mr-2"></i>
                                            <span className="font-medium">신고자:</span> {report.reporterName || 'N/A'}
                                        </p>
                                        <p>
                                            <i className="bi bi-chat-square-text mr-2"></i>
                                            <span className="font-medium">사유:</span> {report.reason || '부적절한 게시물'}
                                        </p>
                                        <p>
                                            <i className="bi bi-calendar3 mr-2"></i>
                                            <span className="font-medium">신고일:</span> {formatDate(report.createdDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() => {
                                            if (report.productId) {
                                                navigate(`/products/${report.productId}`);
                                            } else {
                                                alert('상품 정보를 찾을 수 없습니다.');
                                            }
                                        }}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <i className="bi bi-eye mr-1"></i>상품 보기
                                    </Button>

                                    {/* 👇 처리 완료 버튼 추가! */}
                                    {report.status === 'PENDING' && (
                                        <Button
                                            onClick={async () => {
                                                if (!confirm('이 신고를 처리 완료하시겠습니까?')) return;

                                                try {
                                                    await reportApi.resolve(report.reportId);
                                                    alert('✅ 처리 완료되었습니다.');
                                                    fetchReports(); // 새로고침
                                                } catch (err) {
                                                    alert('처리 중 오류가 발생했습니다.');
                                                }
                                            }}
                                            variant="primary"
                                            size="sm"
                                        >
                                            <i className="bi bi-check-circle mr-1"></i>처리 완료
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <i className="bi bi-flag text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">신고 내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <UserProfile user={apiUser} />

                <div className="bg-white rounded-t-2xl shadow-lg">
                    <div className="flex border-b border-gray-200">
                        {[
                            { name: "purchases", icon: "bi-bag", label: "구매내역" },
                            { name: "sales", icon: "bi-receipt", label: "판매내역" },
                            { name: "likes", icon: "bi-heart", label: "찜한 목록" },
                            {
                                name: "notifications",
                                icon: "bi-bell",
                                label: "알림",
                                count: unreadCount,
                            },
                            ...(user?.role === 'ADMIN' ? [{
                                name: "reports",
                                icon: "bi-flag",
                                label: "신고 내역"
                            }] : [])
                        ].map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => showTab(tab.name)}
                                className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                                    activeTab === tab.name
                                        ? "active-tab bg-primary text-white"
                                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                                }`}
                            >
                                <i className={`${tab.icon} mr-2`}></i>
                                {tab.label}
                                {tab.count > 0 && (
                                    <span
                                        className={`absolute top-2 right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                                            activeTab === tab.name
                                                ? "bg-white text-red-500"
                                                : "bg-red-500"
                                        }`}
                                        style={{ right: "1rem" }}
                                    >
                    {tab.count}
                  </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-b-2xl shadow-lg p-8">
                    {activeTab === "purchases" && renderPurchases()}
                    {activeTab === "sales" && renderSales()}
                    {activeTab === "likes" && renderLikes()}
                    {activeTab === "notifications" && renderNotifications()}
                    {activeTab === "reports" && renderReports()}
                </div>
            </div>

            <Footer />
        </>
    );
};

export default MyPage;