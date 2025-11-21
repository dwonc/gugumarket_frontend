import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import useAuthStore from "./stores/authStore";
import router from "./routes/AppRouter";
// import SignupPage from './pages/auth/SignupPage';  // ← 주석 처리

function App() {
  useEffect(() => {
    const { initialize } = useAuthStore.getState();
    initialize();

    console.log("✅ App 초기화 완료");
    console.log("현재 인증 상태:", useAuthStore.getState().isAuthenticated);
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
