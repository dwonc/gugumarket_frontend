import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import reportApi from "../../api/reportApi";

const ReportModal = ({ isOpen, onClose, productId, onSuccess }) => {
    const [selectedReason, setSelectedReason] = useState("");
    // 🎯 기타 사유 입력 state 추가
    const [customReason, setCustomReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reasons = [
        { value: "부적절한 게시물", label: "부적절한 게시물" },
        { value: "허위정보 게시", label: "허위정보 게시" },
        { value: "음란성 및 유해정보 포함됨", label: "음란성 및 유해정보 포함됨" },
        // 🎯 기타 옵션 추가
        { value: "기타", label: "기타" },
    ];

    const handleSubmit = async () => {
        // 🎯 기타 선택 시 입력 내용 확인
        if (!selectedReason) {
            alert("신고 사유를 선택해주세요.");
            return;
        }

        if (selectedReason === "기타" && !customReason.trim()) {
            alert("기타 사유를 입력해주세요.");
            return;
        }

        if (!confirm("이 게시물을 신고하시겠습니까?")) {
            return;
        }

        setIsSubmitting(true);

        try {
            // 🎯 기타 선택 시 입력한 내용을 reason으로 전송
            const finalReason = selectedReason === "기타" ? customReason : selectedReason;
            await reportApi.create(productId, finalReason);
            alert("신고가 접수되었습니다.");
            setSelectedReason("");
            setCustomReason(""); // 🎯 초기화
            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("신고 실패:", err);
            const errorMessage = err.response?.data?.message || "신고 접수 중 오류가 발생했습니다.";
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedReason("");
        setCustomReason(""); // 🎯 초기화
        onClose();
    };

    // 🎯 라디오 버튼 변경 시 customReason 초기화
    const handleReasonChange = (value) => {
        setSelectedReason(value);
        if (value !== "기타") {
            setCustomReason("");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="게시물 신고"
            size="sm"
            footer={
                <div className="flex gap-3">
                    <Button
                        onClick={handleClose}
                        variant="secondary"
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="danger"
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "신고 중..." : "신고하기"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                    신고 사유를 선택해주세요. 허위 신고 시 제재를 받을 수 있습니다.
                </p>

                <div className="space-y-3">
                    {reasons.map((reason) => (
                        <label
                            key={reason.value}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedReason === reason.value
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <input
                                type="radio"
                                name="reportReason"
                                value={reason.value}
                                checked={selectedReason === reason.value}
                                onChange={(e) => handleReasonChange(e.target.value)}
                                className="w-4 h-4 text-red-600 mr-3"
                            />
                            <span
                                className={`font-medium ${
                                    selectedReason === reason.value
                                        ? "text-red-700"
                                        : "text-gray-700"
                                }`}
                            >
                {reason.label}
              </span>
                        </label>
                    ))}
                </div>

                {/* 🎯 기타 선택 시 입력창 표시 */}
                {selectedReason === "기타" && (
                    <div className="mt-3">
            <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="신고 사유를 자세히 입력해주세요 (최대 500자)"
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none resize-none"
            />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {customReason.length} / 500
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ReportModal;