import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

// Pages
import MainPage from "@/pages/product/MainPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ProductDetailPage from "@/pages/product/ProductDetailPage";
import ProductWritePage from "@/pages/product/ProductWritePage";
import ProductEditPage from "@/pages/product/ProductEditPage";
import PurchasePage from "@/pages/transaction/PurchasePage";
import PurchaseCompletePage from "@/pages/transaction/PurchaseCompletePage";
import TransactionDetailPage from "@/pages/transaction/TransactionDetailPage";
import MyPage from "@/pages/user/MyPage";
import NotificationPage from "@/pages/notification/NotificationPage";
import QnaListPage from "@/pages/qna/QnaListPage";
import QnaFormPage from "@/pages/qna/QnaFormPage";
import AdminPage from "@/pages/admin/AdminPage";
import UserDetailPage from "@/pages/admin/UserDetailPage";
import ErrorPage from "@/pages/ErrorPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Private Routes (로그인 필요) */}
        <Route element={<PrivateRoute />}>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/products/write" element={<ProductWritePage />} />
          <Route path="/products/:id/edit" element={<ProductEditPage />} />
          <Route path="/products/:id/purchase" element={<PurchasePage />} />
          <Route
            path="/purchase/complete/:transactionId"
            element={<PurchaseCompletePage />}
          />
          <Route path="/transactions/:id" element={<TransactionDetailPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/qna" element={<QnaListPage />} />
          <Route path="/qna/write" element={<QnaFormPage />} />
        </Route>

        {/* Admin Routes (관리자 전용) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users/:userId" element={<UserDetailPage />} />
        </Route>

        {/* Error */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
