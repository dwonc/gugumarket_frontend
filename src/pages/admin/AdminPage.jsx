import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import useAdminStore from "../../stores/adminStore";
import { adminApi } from "../../api/adminApi";
import api from "../../api/axios";
import reportApi from "../../api/reportApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Dashboard from "../../components/admin/Dashboard";
import UserTable from "../../components/admin/UserTable";
import ProductTable from "../../components/admin/ProductTable";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

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
  const [reports, setReports] = useState([]); // ✅ 신고 내역 state 추가

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

  // ✅ 신고 내역 조회
  const fetchReports = async () => {
    try {
      const response = await api.get("/report/admin/list");
      if (response.data.success) {
        setReports(response.data.reports || []);
      }
    } catch (err) {
      console.error("❌ 신고 내역 조회 실패:", err);
      alert("신고 내역을 불러오는데 실패했습니다.");
    }
  };

  // ✅ 탭 변경 시 신고 내역 로드
  useEffect(() => {
    if (currentTab === "reports") {
      fetchReports();
    }
  }, [currentTab]);

  // 회원 검색
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

  // 상품 검색
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

  // QnA 답변 제출
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

  // ✅ 날짜 포맷 함수
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(". ", "-")
      .replace(". ", "-")
      .replace(".", "")
      .replace(" ", " ");
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
                  {new Date().toLocaleString("ko-KR")}
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
              {/* ✅ 신고 내역 탭 추가 */}
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
                              작성일:{" "}
                              {new Date(qna.createdDate).toLocaleString(
                                "ko-KR"
                              )}
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
                                    {new Date(
                                      answer.createdDate
                                    ).toLocaleString("ko-KR")}
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

            {/* ✅ 신고 내역 Tab */}
            {currentTab === "reports" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  신고 내역
                </h2>
                <div className="space-y-4">
                  {reports && reports.length > 0 ? (
                    reports.map((report) => (
                      <div
                        key={report.reportId}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                                <i className="bi bi-flag-fill mr-1"></i>신고
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  report.status === "RESOLVED"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {report.status === "RESOLVED"
                                  ? "✅ 처리 완료"
                                  : "⏳ 처리 대기"}
                              </span>
                              <span className="text-sm text-gray-500">
                                신고 ID: {report.reportId}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                              {report.productTitle ||
                                `상품 ID: ${report.productId}`}
                            </h3>

                            <div className="space-y-2 text-sm text-gray-600">
                              <p>
                                <i className="bi bi-person mr-2"></i>
                                <span className="font-medium">
                                  신고자:
                                </span>{" "}
                                {report.reporterName || "N/A"}
                              </p>
                              <p>
                                <i className="bi bi-chat-square-text mr-2"></i>
                                <span className="font-medium">사유:</span>{" "}
                                {report.reason || "부적절한 게시물"}
                              </p>
                              <p>
                                <i className="bi bi-calendar3 mr-2"></i>
                                <span className="font-medium">
                                  신고일:
                                </span>{" "}
                                {formatDate(report.createdDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => {
                                if (report.productId) {
                                  navigate(`/products/${report.productId}`);
                                } else {
                                  alert("상품 정보를 찾을 수 없습니다.");
                                }
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <i className="bi bi-eye mr-1"></i>상품 보기
                            </Button>

                            {report.status === "PENDING" && (
                              <Button
                                onClick={async () => {
                                  if (
                                    !confirm("이 신고를 처리 완료하시겠습니까?")
                                  )
                                    return;

                                  try {
                                    await reportApi.resolve(report.reportId);
                                    alert("✅ 처리 완료되었습니다.");
                                    fetchReports(); // 새로고침
                                  } catch (err) {
                                    alert("처리 중 오류가 발생했습니다.");
                                  }
                                }}
                                variant="primary"
                                size="sm"
                              >
                                <i className="bi bi-check-circle mr-1"></i>처리
                                완료
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <i className="bi bi-flag text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500 text-lg">
                        신고 내역이 없습니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AdminPage;
