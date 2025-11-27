import { useState, useEffect } from "react";
import api from "../../api/axios";
import reportApi from "../../api/reportApi";
import Button from "../common/Button";
import Modal from "../common/Modal";

const AdminReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 신고 목록 불러오기
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/report/admin/list");
      if (response.data.success) {
        setReports(response.data.reports || []);
      } else {
        setError(
          response.data.message || "신고 내역을 불러오는데 실패했습니다."
        );
      }
    } catch (err) {
      console.error("❌ 신고 내역 조회 실패:", err);
      setError("신고 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

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

  // 특정 상품의 신고들만 필터링
  const getReportsByProduct = (productId) =>
    reports.filter((r) => r.productId === productId);

  // 상품별 신고 건수
  const getReportCountByProduct = (productId) =>
    reports.filter((r) => r.productId === productId).length;

  // 중복 제거된 상품 목록
  const uniqueProducts = Array.from(
    new Set(reports.map((r) => r.productId))
  ).map((productId) => {
    const firstReport = reports.find((r) => r.productId === productId);
    return {
      productId,
      productTitle: firstReport?.productTitle,
      reportCount: getReportCountByProduct(productId),
    };
  });

  const handleShowDetail = (productId) => {
    setSelectedProductId(productId);
    setIsDetailModalOpen(true);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">신고 내역</h2>

      {loading && (
        <div className="py-10 text-center text-gray-500">불러오는 중...</div>
      )}

      {!loading && error && (
        <div className="py-4 text-center text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {uniqueProducts && uniqueProducts.length > 0 ? (
            uniqueProducts.map((product) => (
              <div
                key={product.productId}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                        <i className="bi bi-flag-fill mr-1"></i>
                        {product.reportCount}건 신고
                      </span>
                      <span className="text-sm text-gray-500">
                        상품 ID: {product.productId}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {product.productTitle || `상품 ID: ${product.productId}`}
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleShowDetail(product.productId)}
                      variant="primary"
                      size="sm"
                    >
                      <i className="bi bi-list-ul mr-1"></i>상세 보기
                    </Button>
                    <Button
                      onClick={() => {
                        if (product.productId) {
                          window.location.href = `/products/${product.productId}`;
                        } else {
                          alert("상품 정보를 찾을 수 없습니다.");
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <i className="bi bi-eye mr-1"></i>상품 보기
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <i className="bi bi-flag text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">신고 내역이 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 상세 보기 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="신고 상세 내역"
        size="lg"
      >
        <div className="space-y-4">
          {selectedProductId &&
            getReportsByProduct(selectedProductId).map((report) => (
              <div
                key={report.reportId}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          report.status === "RESOLVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {report.status === "RESOLVED"
                          ? "✅ 처리 완료"
                          : "⏳ 처리 대기"}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {report.reportId}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium text-gray-700">
                          <i className="bi bi-person mr-1"></i>신고자:
                        </span>{" "}
                        <span className="text-gray-600">
                          {report.reporterName || "N/A"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">
                          <i className="bi bi-chat-square-text mr-1"></i>사유:
                        </span>{" "}
                        <span className="text-gray-600">
                          {report.reason || "부적절한 게시물"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">
                          <i className="bi bi-calendar3 mr-1"></i>신고일:
                        </span>{" "}
                        <span className="text-gray-600">
                          {formatDate(report.createdDate)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {report.status === "PENDING" && (
                    <Button
                      onClick={async () => {
                        if (!confirm("이 신고를 처리 완료하시겠습니까?"))
                          return;

                        try {
                          await reportApi.resolve(report.reportId);
                          alert("✅ 처리 완료되었습니다.");
                          await fetchReports();
                          // 모달 내용 즉시 갱신
                          setIsDetailModalOpen(false);
                          setTimeout(() => setIsDetailModalOpen(true), 50);
                        } catch (err) {
                          console.error(err);
                          alert("처리 중 오류가 발생했습니다.");
                        }
                      }}
                      variant="primary"
                      size="sm"
                    >
                      <i className="bi bi-check-circle mr-1"></i>처리 완료
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </Modal>
    </>
  );
};

export default AdminReportsTab;
