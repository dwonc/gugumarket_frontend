import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import useAdminStore from "../../stores/adminStore";
import { adminApi } from "../../api/adminApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Dashboard from "../../components/admin/Dashboard";
import UserTable from "../../components/admin/UserTable";
import ProductTable from "../../components/admin/ProductTable";
import ErrorMessage from "../../components/common/ErrorMessage";
import AdminReportsTab from "../../components/admin/AdminReportsTab";
import { formatDateTime, getQnaStatus } from "../../utils/formatters";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    stats,
    users,
    products,
    qnaPosts,
    currentTab,
    setStats,
    setUsers,
    setProducts,
    setQnaPosts,
    setCurrentTab,
  } = useAdminStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qnaAnswers, setQnaAnswers] = useState({});

  // 권한 체크
  useEffect(() => {
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      alert("관리자만 접근할 수 있습니다.");
      navigate("/");
      return;
    }

    fetchInitialData();
  }, []);

  // 초기 데이터 로드
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, usersRes, productsRes, qnaRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getProducts(),
        adminApi.getQnaPosts(),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }

      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }

      if (qnaRes.data.success) {
        setQnaPosts(qnaRes.data.data);
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async (keyword = "") => {
    try {
      const response = await adminApi.getUsers(keyword);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error("회원 검색 실패:", err);
      alert("회원 검색에 실패했습니다.");
    }
  };

  const handleProductSearch = async (params = {}) => {
    try {
      const response = await adminApi.getProducts(params);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error("상품 검색 실패:", err);
      alert("상품 검색에 실패했습니다.");
    }
  };

  const handleQnaAnswer = async (qnaId) => {
    const content = qnaAnswers[qnaId];

    if (!content || !content.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await adminApi.answerQna(qnaId, content);

      if (response.data.success) {
        alert("답변이 등록되었습니다.");
        const qnaRes = await adminApi.getQnaPosts();
        if (qnaRes.data.success) {
          setQnaPosts(qnaRes.data.data);
        }
        setQnaAnswers({ ...qnaAnswers, [qnaId]: "" });
      }
    } catch (err) {
      console.error("답변 등록 실패:", err);
      alert("답변 등록에 실패했습니다.");
    }
  };

  const handleAnswerChange = (qnaId, value) => {
    setQnaAnswers({ ...qnaAnswers, [qnaId]: value });
  };

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
              <span>{user?.nickname || user?.username}님</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Admin Info Card */}
          <div
            className="rounded-2xl shadow-lg p-8 mb-8 text-white"
            style={{
              background: "linear-gradient(to right, #6B4F4F, #8B7070)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
                <p className="opacity-90">
                  GUGU Market 관리자 페이지에 오신 것을 환영합니다
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">마지막 로그인</p>
                <p className="text-lg font-semibold">
                  {/* ✅ 수정: 현재 시간 또는 user의 lastLoginAt 사용 */}
                  {user?.lastLoginAt
                    ? formatDateTime(user.lastLoginAt)
                    : new Date().toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <Dashboard stats={stats} />

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

          {/* Tabs */}
          <div className="bg-white rounded-t-2xl shadow-lg">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setCurrentTab("users")}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  currentTab === "users"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <i className="bi bi-people mr-2"></i>회원 관리
              </button>
              <button
                onClick={() => setCurrentTab("products")}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  currentTab === "products"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <i className="bi bi-box-seam mr-2"></i>제품 관리
              </button>
              <button
                onClick={() => setCurrentTab("qna")}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  currentTab === "qna"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <i className="bi bi-chat-square-dots mr-2"></i>Q&A 답변
              </button>
              <button
                onClick={() => setCurrentTab("reports")}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  currentTab === "reports"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <i className="bi bi-flag mr-2"></i>신고 내역
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="bg-white rounded-b-2xl shadow-lg p-8">
            {/* 회원 관리 Tab */}
            {currentTab === "users" && (
              <UserTable users={users} onRefresh={handleUserSearch} />
            )}

            {/* 제품 관리 Tab */}
            {currentTab === "products" && (
              <ProductTable
                products={products}
                onRefresh={handleProductSearch}
              />
            )}

            {/* Q&A 답변 Tab */}
            {currentTab === "qna" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Q&A 답변
                </h2>

                <div className="space-y-4">
                  {qnaPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <i className="bi bi-chat-square-dots text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500 text-lg">
                        등록된 Q&A가 없습니다.
                      </p>
                    </div>
                  ) : (
                    qnaPosts.map((qna) => (
                      <div
                        key={qna.qnaId}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">
                                {qna.title}
                              </h3>
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
                            <p className="text-gray-600 text-sm mb-2">
                              작성일: {formatDateTime(qna.createdDate)}
                            </p>
                            <p className="text-gray-700 whitespace-pre-line">
                              {qna.content}
                            </p>
                          </div>
                        </div>

                        {!qna.isAnswered && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <textarea
                              value={qnaAnswers[qna.qnaId] || ""}
                              onChange={(e) =>
                                handleAnswerChange(qna.qnaId, e.target.value)
                              }
                              rows="3"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none mb-3"
                              placeholder="답변을 입력하세요..."
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleQnaAnswer(qna.qnaId)}
                                className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition-all"
                              >
                                <i className="bi bi-send mr-1"></i>답변 등록
                              </button>
                            </div>
                          </div>
                        )}

                        {qna.isAnswered &&
                          qna.answers &&
                          qna.answers.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 p-4 rounded-lg">
                              {qna.answers.map((answer) => (
                                <div key={answer.answerId || answer.id}>
                                  <p className="text-sm text-gray-600 mb-2">
                                    <i className="bi bi-reply-fill mr-1"></i>
                                    관리자 답변 |{" "}
                                    {formatDateTime(answer.createdDate)}
                                  </p>
                                  <p className="text-gray-800 whitespace-pre-line">
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

            {currentTab === "reports" && <AdminReportsTab />}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AdminPage;
