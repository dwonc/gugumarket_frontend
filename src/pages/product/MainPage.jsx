import { Link } from "react-router-dom"; // ✅ 1. 이거 추가!

const MainPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">GUGU Market</h1>
        <p className="text-gray-600 mb-8">메인 페이지 (준비중)</p>
        <Link
          to="/login"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    </div>
  );
};

export default MainPage;
