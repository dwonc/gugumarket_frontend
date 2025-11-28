import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import qnaApi from "../../api/qnaApi";
import useAuthStore from "../../stores/authStore";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { formatDate, formatDateTime } from "../../utils/formatters";

const QnaListPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [qnaList, setQnaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStorage = localStorage.getItem("auth-storage");
        if (!authStorage) {
          setReady(true);
          return;
        }

        const parsed = JSON.parse(authStorage);
        const hasToken = parsed?.state?.accessToken;

        if (hasToken) {
          setTimeout(() => setReady(true), 200);
        } else {
          setReady(true);
        }
      } catch (error) {
        console.error("인증 체크 실패:", error);
        setReady(true);
      }
    };

    checkAuth();
  }, []);

  const fetchQnaList = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await qnaApi.getList({
        keyword: searchKeyword,
        page: currentPage,
        size: 10,
      });

      const data = response.data;
      setQnaList(data.qnaPosts || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error("QnA 목록 조회 실패:", err);

      if (err.response?.status === 401) {
        setError("로그인이 필요합니다. 다시 로그인해주세요.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(
          err.response?.data?.message ||
            "목록을 불러오는 중 오류가 발생했습니다."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return;

    if (isAuthenticated) {
      fetchQnaList();
    } else {
      setLoading(false);
      setError("로그인이 필요합니다.");
    }
  }, [ready, isAuthenticated, searchKeyword, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchKeyword(keyword);
    setCurrentPage(0);
  };

  const handleReset = () => {
    setKeyword("");
    setSearchKeyword("");
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedId(null);
    window.scrollTo(0, 0);
  };

  const handleToggle = (qnaId) => {
    setExpandedId(expandedId === qnaId ? null : qnaId);
  };

  if (!ready) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Loading text="페이지를 준비하는 중..." />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-20">
              <i className="bi bi-lock text-6xl text-gray-300 mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                로그인이 필요합니다
              </h2>
              <p className="text-gray-600 mb-8">
                Q&A를 이용하려면 로그인해주세요.
              </p>
              <Button onClick={() => navigate("/login")} variant="primary">
                로그인하기
              </Button>
            </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-3">
                  Q&A 게시판
                </h2>
                <p className="text-gray-600">
                  궁금한 점이 있으시면 언제든지 문의해주세요!
                </p>
              </div>
              <button
                onClick={() => navigate("/qna/write")}
                className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
              >
                <i className="bi bi-pencil-square mr-2"></i>
                질문 작성
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="제목 또는 내용으로 검색하세요..."
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-lg"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-secondary text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center"
              >
                <i className="bi bi-search mr-2"></i>
                검색
              </button>
            </div>
            {searchKeyword && (
              <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <i className="bi bi-search text-blue-600 mr-2"></i>
                  <span className="text-blue-800">
                    검색어: <strong>'{searchKeyword}'</strong> · 검색 결과
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <i className="bi bi-x-circle mr-1"></i>
                  검색 결과 지우기
                </button>
              </div>
            )}
          </form>

          {error && (
            <div className="mb-6">
              <ErrorMessage
                message={error}
                type="error"
                onClose={() => setError(null)}
              />
            </div>
          )}

          {loading ? (
            <Loading text="목록을 불러오는 중..." />
          ) : (
            <>
              {qnaList.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                  <i className="bi bi-inbox text-6xl text-gray-300"></i>
                  <p className="text-gray-500 mt-4 text-lg">
                    {searchKeyword ? (
                      <>
                        '<strong>{searchKeyword}</strong>'에 대한 검색 결과가
                        없습니다.
                      </>
                    ) : (
                      "등록된 Q&A가 없습니다."
                    )}
                  </p>
                  {!searchKeyword && (
                    <button
                      onClick={() => navigate("/qna/write")}
                      className="mt-6 bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <i className="bi bi-pencil-square mr-2"></i>첫 질문
                      작성하기
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {qnaList.map((qna) => (
                    <div
                      key={qna.qnaId}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => handleToggle(qna.qnaId)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {qna.isAnswered ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700 border border-green-200">
                                  <i className="bi bi-check-circle-fill mr-1"></i>
                                  답변완료
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                  <i className="bi bi-clock-fill mr-1"></i>
                                  답변대기
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                <i className="bi bi-chat-dots mr-1"></i>Q.{" "}
                                {qna.qnaId}
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-primary transition-colors">
                              {qna.title}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <i className="bi bi-person-circle mr-1"></i>
                                {qna.nickName}
                              </span>
                              <span className="flex items-center">
                                <i className="bi bi-calendar3 mr-1"></i>
                                {formatDate(qna.createdDate)}
                              </span>
                            </div>
                          </div>

                          <div className="ml-4 text-gray-400">
                            <i
                              className={`bi ${
                                expandedId === qna.qnaId
                                  ? "bi-chevron-up"
                                  : "bi-chevron-down"
                              } text-2xl transition-transform`}
                            ></i>
                          </div>
                        </div>
                      </div>

                      {expandedId === qna.qnaId && (
                        <div className="border-t border-gray-200">
                          <div className="bg-gray-50 p-6">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <i className="bi bi-person text-white"></i>
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 mb-2">
                                  {qna.nickName}
                                </p>
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                  {qna.content}
                                </p>
                              </div>
                            </div>
                          </div>

                          {qna.isAnswered &&
                            qna.qnaAnswers &&
                            qna.qnaAnswers.length > 0 && (
                              <div className="bg-blue-50 p-6">
                                {qna.qnaAnswers.map((answer) => (
                                  <div
                                    key={answer.answerId}
                                    className="flex items-start gap-3 mb-4 last:mb-0"
                                  >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                      <i className="bi bi-shield-check text-white"></i>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <p className="font-semibold text-blue-800">
                                          {answer.adminName || "관리자"}
                                        </p>
                                        {answer.createdDate && (
                                          <span className="text-sm text-gray-500">
                                            {formatDateTime(answer.createdDate)}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                        {answer.content}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 0 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`min-w-[40px] px-4 py-2 rounded-lg font-bold transition-all ${
                        currentPage === index
                          ? "bg-primary text-white shadow-lg"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QnaListPage;
