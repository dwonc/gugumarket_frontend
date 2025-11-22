import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Loading from "../common/Loading";

const CompleteProfileModal = ({ isOpen, onClose, onComplete, userInfo }) => {
  const [formData, setFormData] = useState({
    address: "",
    addressDetail: "",
    postalCode: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Daum Postcode API 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // 주소 검색
  const handleSearchAddress = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 API가 로드되지 않았습니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        var addr =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        var extraAddr = "";

        if (data.userSelectedType === "R") {
          if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
            extraAddr += data.bname;
          }
          if (data.buildingName !== "" && data.apartment === "Y") {
            extraAddr +=
              extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
          }
        }

        setFormData((prev) => ({
          ...prev,
          postalCode: data.zonecode,
          address: addr + (extraAddr !== "" ? ` (${extraAddr})` : ""),
          addressDetail: "",
        }));
      },
    }).open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 유효성 검사
    if (!formData.address || !formData.postalCode) {
      setError("주소는 필수 항목입니다.");
      return;
    }

    // 비밀번호 입력 시 일치 여부 확인
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }

      if (formData.password.length < 8) {
        setError("비밀번호는 8자 이상이어야 합니다.");
        return;
      }
    }

    setLoading(true);

    try {
      await onComplete(formData);
    } catch (err) {
      setError(err.message || "필수 정보 입력 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // 닫기 방지
      title="필수 정보 입력"
      size="lg"
      closeOnBackdrop={false} // 배경 클릭으로 닫기 방지
      showCloseButton={false} // X 버튼 숨기기
    >
      <div className="space-y-6">
        {/* 안내 메시지 */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <i className="bi bi-exclamation-triangle-fill text-yellow-400 text-xl mr-3"></i>
            <div>
              <p className="text-sm text-yellow-800 font-semibold mb-1">
                구구마켓은 같은 구에 사는 이웃과의 거래를 중심으로 합니다
              </p>
              <p className="text-xs text-yellow-700">
                원활한 거래를 위해 주소 정보가 필요합니다. 주소는 '구' 단위로
                공개되며, 상세 주소는 비공개로 보호됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <i className="bi bi-exclamation-circle mr-2"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 사용자 정보 표시 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              <i className="bi bi-person-circle mr-2"></i>
              카카오 로그인: <strong>{userInfo?.nickname}</strong>
            </p>
            <p className="text-sm text-gray-600">
              <i className="bi bi-envelope mr-2"></i>
              이메일: <strong>{userInfo?.email}</strong>
            </p>
          </div>

          {/* 주소 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우편번호 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                placeholder="우편번호"
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                주소 검색
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              readOnly
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 mb-2"
              placeholder="기본 주소"
            />
            <input
              type="text"
              name="addressDetail"
              value={formData.addressDetail}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="상세 주소 (선택)"
            />
          </div>

          {/* 비밀번호 설정 (선택) */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-4">
              <i className="bi bi-info-circle mr-2"></i>
              비밀번호를 설정하면 카카오 로그인 외에도 일반 로그인이 가능합니다
              (선택 사항)
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 (선택)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="8자 이상 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인 (선택)
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="비밀번호 재입력"
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loading size="sm" className="inline mr-2" />
                  처리 중...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle mr-2"></i>
                  완료
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CompleteProfileModal;
