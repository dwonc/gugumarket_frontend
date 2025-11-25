import React, { useState } from "react";
import axios from "../../api/axios";

/**
 * 구매 확정 버튼 컴포넌트
 * @param {Number} transactionId - 거래 ID
 * @param {Function} onSuccess - 성공 시 콜백
 */
const PurchaseConfirmButton = ({ transactionId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (
      !window.confirm(
        "구매를 확정하시겠습니까?\n\n" +
          "✅ 판매자와 구매자 모두 등급이 올라갑니다!\n" +
          "⚠️ 확정 후에는 취소할 수 없습니다."
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/transactions/${transactionId}/complete`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        const levelInfo = response.data.levelInfo;

        // 성공 메시지
        alert(
          `🎉 구매가 확정되었습니다!\n\n` +
            `📊 현재 등급: ${levelInfo.emoji} ${levelInfo.levelName}\n` +
            `🔢 거래 횟수: ${levelInfo.transactionCount}회\n` +
            (levelInfo.toNextLevel > 0
              ? `🎯 다음 등급까지: ${levelInfo.toNextLevel}회`
              : `🏆 최고 등급 달성!`)
        );

        // 부모 컴포넌트에 알림
        if (onSuccess) {
          onSuccess(levelInfo);
        }
      }
    } catch (error) {
      console.error("구매 확정 실패:", error);

      if (error.response?.data?.message) {
        alert(`❌ ${error.response.data.message}`);
      } else {
        alert("❌ 구매 확정 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleConfirm}
      disabled={isLoading}
      className={`w-full py-3 rounded-lg font-semibold text-white transition-all
        ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-105"
        }`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          처리 중...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <i className="bi bi-check-circle"></i>
          거래 완료하기
        </span>
      )}
    </button>
  );
};

export default PurchaseConfirmButton;
