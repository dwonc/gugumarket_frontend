import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import useAuthStore from "./stores/authStore";
import router from "./routes/AppRouter";
// import SignupPage from './pages/auth/SignupPage';  // ← 주석 처리

function App() {
  useEffect(() => {
    const { initialize } = useAuthStore.getState();
    initialize();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
