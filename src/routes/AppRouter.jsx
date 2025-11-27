import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

// Pages
import MainPage from "../pages/product/MainPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import MyPage from "../pages/user/MyPage";
import Edit from "../pages/user/Edit";
import ProductDetailPage from "../pages/product/ProductDetailPage";
import ProductWritePage from "../pages/product/ProductWritePage";
import ProductEditPage from "../pages/product/ProductEditPage";
import FindIdPage from "../pages/auth/FindIdPage";
import FindPasswordPage from "../pages/auth/FindPasswordPage";
import PurchasePage from "../pages/transaction/PurchasePage";
import PurchaseCompletePage from "../pages/transaction/PurchaseCompletePage";
import TransactionDetailPage from "../pages/transaction/TransactionDetailPage";
import KakaoCallbackPage from "../pages/auth/KakaoCallbackPage";
import NotificationPage from "../pages/notification/NotificationPage";
import QnaListPage from "../pages/qna/QnaListPage";
import QnaFormPage from "../pages/qna/QnaFormPage";
import AdminPage from "../pages/admin/AdminPage";
import UserDetailPage from "../pages/admin/UserDetailPage";
import ErrorPage from "../pages/ErrorPage";
import TermsPage from "../pages/etc/TermsPage";
import AboutPage from "../pages/etc/AboutPage";
import MapPage from "../pages/product/MapPage";
// ⭐ 결제 페이지 추가
import PaymentSuccessPage from "../pages/payment/PaymentSuccessPage";
import PaymentCancelPage from "../pages/payment/PaymentCancelPage";
import PaymentFailPage from "../pages/payment/PaymentFailPage";
import ChatListPage from "../pages/chat/ChatListPage";
import ChatRoomModal from "../components/chat/ChatRoomModal";

const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/auth/kakao",
    element: <KakaoCallbackPage />,
  },
  {
    path: "/find-id",
    element: <FindIdPage />,
  },
  {
    path: "/find-password",
    element: <FindPasswordPage />,
  },
  {
    path: "/products/:id",
    element: <ProductDetailPage />,
  },
  {
    path: "/map",
    element: <MapPage />,
  },

  // ⭐ 결제 관련 Public Routes (카카오페이 콜백 때문에)
  {
    path: "/payment/success",
    element: <PaymentSuccessPage />,
  },
  {
    path: "/payment/cancel",
    element: <PaymentCancelPage />,
  },
  {
    path: "/payment/fail",
    element: <PaymentFailPage />,
  },
  // ✅ 채팅 라우트 추가
  {
    path: "/chat",
    element: <ChatListPage />,
  },
  {
    path: "/chat/:chatRoomId",
    element: <ChatRoomModal />,
  },

  // Private Routes (로그인 필요)
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/mypage",
        element: <MyPage />,
      },
      {
        path: "/mypage/edit",
        element: <Edit />,
      },
      {
        path: "/products/write",
        element: <ProductWritePage />,
      },
      {
        path: "/products/:id/edit",
        element: <ProductEditPage />,
      },
      {
        path: "/products/:id/purchase",
        element: <PurchasePage />,
      },
      {
        path: "/purchase/complete/:transactionId",
        element: <PurchaseCompletePage />,
      },
      {
        path: "/transactions/:id",
        element: <TransactionDetailPage />,
      },
      {
        path: "/notifications",
        element: <NotificationPage />,
      },
      {
        path: "/qna",
        element: <QnaListPage />,
      },
      {
        path: "/qna/write",
        element: <QnaFormPage />,
      },
    ],
  },

  // Admin Routes (관리자 전용)
  {
    element: <AdminRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminPage />,
      },
      {
        path: "/admin/users/:userId",
        element: <UserDetailPage />,
      },
    ],
  },

  // 404 Error
  {
    path: "*",
    element: <ErrorPage />,
  },
  {
    path: "/terms",
    element: <TermsPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
]);

export default router;
