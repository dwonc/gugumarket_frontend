const Dashboard = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* 총 회원 수 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">총 회원 수</p>
            <p className="text-3xl font-bold text-gray-800">
              {stats.totalUsers?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <i className="bi bi-people text-blue-600 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* 총 상품 수 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">총 상품 수</p>
            <p className="text-3xl font-bold text-gray-800">
              {stats.totalProducts?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <i className="bi bi-box-seam text-green-600 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* 미답변 Q&A */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">미답변 Q&A</p>
            <p className="text-3xl font-bold text-gray-800">
              {stats.unansweredQna || 0}
            </p>
          </div>
          <div className="bg-red-100 p-4 rounded-full">
            <i className="bi bi-question-circle text-red-600 text-2xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
