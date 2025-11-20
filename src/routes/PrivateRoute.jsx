import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/stores/authStore";

const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();

  // 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 로그인 되어 있으면 자식 라우트 렌더링
  return <Outlet />;
};

export default PrivateRoute;
