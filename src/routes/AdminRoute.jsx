import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/stores/authStore";

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  // 로그인 안 되어 있으면 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 관리자가 아니면 메인 페이지로
  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // 관리자면 자식 라우트 렌더링
  return <Outlet />;
};

export default AdminRoute;
