import { useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";

const UserTable = ({ users, onRefresh }) => {
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      onRefresh(searchKeyword);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ✅ 상태 토글 추가
  const handleToggleStatus = async (userId, userName, currentStatus) => {
    const action = currentStatus ? "정지" : "활성화";
    if (!window.confirm(`${userName} 회원을 ${action}하시겠습니까?`)) {
      return;
    }

    try {
      await adminApi.toggleUserStatus(userId);
      alert(`회원이 ${action}되었습니다.`);
      onRefresh();
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`${userName} 회원을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      alert("회원이 삭제되었습니다.");
      onRefresh();
    } catch (error) {
      console.error("회원 삭제 실패:", error);
      alert("회원 삭제에 실패했습니다.");
    }
  };

  return (
    <div>
      {/* 검색 바 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">회원 관리</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="회원 검색..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSearch}
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="bi bi-search"></i>
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                아이디
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                닉네임
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                이메일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                가입일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                상태
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <i className="bi bi-people text-5xl text-gray-300 mb-3 block"></i>
                  등록된 회원이 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {user.userName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {user.nickname}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdDate).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        활성
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        정지
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/users/${user.userId}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        상세
                      </Link>
                      {/* ✅ 상태 토글 버튼 추가 */}
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            user.userId,
                            user.userName,
                            user.isActive
                          )
                        }
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                      >
                        {user.isActive ? "정지" : "활성화"}
                      </button>
                      <button
                        onClick={() => handleDelete(user.userId, user.userName)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
