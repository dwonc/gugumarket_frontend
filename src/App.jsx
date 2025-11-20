import { RouterProvider, createBrowserRouter } from "react-router-dom";
import router from "./routes/AppRouter";
// import SignupPage from './pages/auth/SignupPage';  // ← 주석 처리

function App() {
  return <RouterProvider router={router} />;
}

export default App;
