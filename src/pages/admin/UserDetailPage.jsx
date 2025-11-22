import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import useAuthStore from "../../stores/authStore";

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [qnaPosts, setQnaPosts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [qnaCount, setQnaCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  // 권한 체크
  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "ADMIN") {
      alert("관리자만 접근할 수 있습니다.");
      navigate("/admin");
      return;
    }

    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.getUserDetail(userId);

      if (response.data.success) {
        const data = response.data.data;

        // ✅ data 자체가 user 정보를 포함하고 있음
        setUser(data);
        setProducts(data.products || []);
        setQnaPosts(data.qnaPosts || []);
        setProductCount(data.productCount || 0);
        setQnaCount(data.qnaCount || 0);
      }
    } catch (err) {
      console.error("회원 상세 조회 실패:", err);
      setError("회원 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm("회원 상태를 변경하시겠습니까?")) {
      return;
    }

    try {
      await adminApi.toggleUserStatus(userId);
      alert("회원 상태가 변경되었습니다.");
      fetchUserDetail();
    } catch (err) {
      console.error("상태 변경 실패:", err);
      alert("상태 변경에 실패했습니다.");
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`${user.userName} 회원을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      alert("회원이 삭제되었습니다.");
      navigate("/admin");
    } catch (err) {
      console.error("회원 삭제 실패:", err);
      alert("회원 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loading text="회원 정보를 불러오는 중..." />
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="bi bi-exclamation-circle text-6xl text-red-500 mb-4"></i>
            <p className="text-gray-700 text-lg">회원을 찾을 수 없습니다.</p>
            <Link
              to="/admin"
              className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg"
            >
              관리자 페이지로
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="bg-primary text-white py-2">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center text-sm">
              <span>
                <i className="bi bi-shield-check mr-2"></i>관리자 모드
              </span>
              <span>{currentUser?.nickname || currentUser?.username}님</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary"
                  >
                    <i className="bi bi-house-door mr-2"></i>관리자
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <i className="bi bi-chevron-right text-gray-400 mx-2"></i>
                    <span className="text-gray-500">회원 상세</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <ErrorMessage
                message={error}
                type="error"
                onClose={() => setError("")}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Info */}
            <div className="lg:col-span-1">
              {/* User Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i className="bi bi-person-fill text-white text-5xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {user.nickname}
                  </h2>
                  <p className="text-gray-500">@{user.userName}</p>
                  <div className="mt-4">
                    {user.isActive ? (
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <i className="bi bi-check-circle mr-1"></i>활성
                      </span>
                    ) : (
                      <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <i className="bi bi-x-circle mr-1"></i>정지
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center text-sm">
                    <i className="bi bi-envelope text-gray-400 w-6"></i>
                    <span className="text-gray-600 ml-2">{user.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <i className="bi bi-phone text-gray-400 w-6"></i>
                    <span className="text-gray-600 ml-2">
                      {user.phone || "미등록"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <i className="bi bi-geo-alt text-gray-400 w-6"></i>
                    <span className="text-gray-600 ml-2">
                      {user.address || "미등록"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <i className="bi bi-calendar text-gray-400 w-6"></i>
                    <span className="text-gray-600 ml-2">
                      가입일:{" "}
                      {new Date(user.createdDate).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={handleToggleStatus}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium transition-all"
                  >
                    <i className="bi bi-toggle-on mr-2"></i>
                    {user.isActive ? "회원 정지" : "정지 해제"}
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-all"
                  >
                    <i className="bi bi-trash mr-2"></i>회원 삭제
                  </button>
                  <Link
                    to="/admin"
                    className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all text-center"
                  >
                    <i className="bi bi-arrow-left mr-2"></i>목록으로
                  </Link>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  활동 통계
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">등록 상품</span>
                    <span className="text-2xl font-bold text-primary">
                      {productCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">작성 Q&A</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {qnaCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Activities */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-t-2xl shadow-lg">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("products")}
                    className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                      activeTab === "products"
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <i className="bi bi-box-seam mr-2"></i>등록 상품
                  </button>
                  <button
                    onClick={() => setActiveTab("qna")}
                    className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                      activeTab === "qna"
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <i className="bi bi-chat-square-dots mr-2"></i>작성 Q&A
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="bg-white rounded-b-2xl shadow-lg p-6">
                {/* Products Tab */}
                {activeTab === "products" && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      등록한 상품
                    </h3>
                    <div className="space-y-4">
                      {products.length === 0 ? (
                        <div className="text-center py-12">
                          <i className="bi bi-box-seam text-5xl text-gray-300 mb-3"></i>
                          <p className="text-gray-500">
                            등록한 상품이 없습니다.
                          </p>
                        </div>
                      ) : (
                        products.map((product) => (
                          <div
                            key={product.productId}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                          >
                            <div className="flex gap-4">
                              <img
                                src={
                                  product.mainImage ||
                                  "https://via.placeholder.com/80"
                                }
                                alt={product.title}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/80/6B4F4F/FFFFFF?text=No+Image";
                                }}
                              />
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800 mb-1">
                                  {product.title}
                                </h4>
                                <p className="text-primary font-bold mb-1">
                                  {product.price?.toLocaleString()}원
                                </p>
                                <p className="text-sm text-gray-500">
                                  등록일:{" "}
                                  {new Date(
                                    product.createdDate
                                  ).toLocaleDateString("ko-KR")}
                                </p>
                              </div>
                              <div className="flex flex-col justify-between items-end">
                                {product.isDeleted ? (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                    삭제됨
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    판매중
                                  </span>
                                )}
                                <a
                                  href={`/products/${product.productId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  상세보기
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* QnA Tab */}
                {activeTab === "qna" && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      작성한 Q&A
                    </h3>
                    <div className="space-y-4">
                      {qnaPosts.length === 0 ? (
                        <div className="text-center py-12">
                          <i className="bi bi-chat-square-dots text-5xl text-gray-300 mb-3"></i>
                          <p className="text-gray-500">
                            작성한 Q&A가 없습니다.
                          </p>
                        </div>
                      ) : (
                        qnaPosts.map((qna) => (
                          <div
                            key={qna.qnaId}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-bold text-gray-800">
                                {qna.title}
                              </h4>
                              {qna.isAnswered ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  답변완료
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                  미답변
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2 whitespace-pre-line">
                              {qna.content}
                            </p>
                            <p className="text-gray-500 text-xs">
                              작성일:{" "}
                              {new Date(qna.createdDate).toLocaleString(
                                "ko-KR"
                              )}
                            </p>

                            {/* Answer if exists */}
                            {qna.isAnswered &&
                              qna.answers &&
                              qna.answers.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200 bg-blue-50 p-3 rounded-lg">
                                  {qna.answers.map((answer) => (
                                    <div key={answer.answerId}>
                                      <p className="text-sm text-gray-600 mb-2">
                                        <i className="bi bi-reply-fill mr-1"></i>
                                        관리자 답변
                                      </p>
                                      <p className="text-gray-800 text-sm whitespace-pre-line">
                                        {answer.content}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default UserDetailPage;
