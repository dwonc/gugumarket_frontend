// src/components/mypages/MyReports.jsx
import Button from "../common/Button";
import reportApi from "../../api/reportApi";

const MyReports = ({ reports, formatDate, fetchReports, navigate }) => {
  // 신고 처리 완료 핸들러
  const handleResolve = async (reportId) => {
    if (!confirm("이 신고를 처리 완료하시겠습니까?")) return;

    try {
      await reportApi.resolve(reportId);
      alert("✅ 처리 완료되었습니다.");
      fetchReports(); // 새로고침
    } catch (err) {
      console.error("신고 처리 오류:", err);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div id="content-reports" className="tab-content">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">신고 내역</h2>
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
                    {/* 👇 상태 배지 */}
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
                    {report.productTitle || `상품 ID: ${report.productId}`}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <i className="bi bi-person mr-2"></i>
                      <span className="font-medium">신고자:</span>{" "}
                      {report.reporterName || "N/A"}
                    </p>
                    <p>
                      <i className="bi bi-chat-square-text mr-2"></i>
                      <span className="font-medium">사유:</span>{" "}
                      {report.reason || "부적절한 게시물"}
                    </p>
                    <p>
                      <i className="bi bi-calendar3 mr-2"></i>
                      <span className="font-medium">신고일:</span>{" "}
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

                  {/* 👇 처리 완료 버튼 */}
                  {report.status === "PENDING" && (
                    <Button
                      onClick={() => handleResolve(report.reportId)}
                      variant="primary"
                      size="sm"
                    >
                      <i className="bi bi-check-circle mr-1"></i>처리 완료
                    </Button>
                  )}
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
    </div>
  );
};

export default MyReports;
