// src/api/transactionApi.js
// 거래(트랜잭션) 관련 API 요청 모음

import api from "./axios";

/**
 * 거래 상세 조회
 * GET /api/transactions/{transactionId}
 */
export const getTransactionDetail = (transactionId) => {
    return api.get(`/api/transactions/${transactionId}`);
};

/**
 * 입금자명 수정
 * POST /api/transactions/{transactionId}/depositor
 * body: { depositorName }
 */
export const updateDepositor = (transactionId, depositorName) => {
    return api.post(`/api/transactions/${transactionId}/depositor`, {
        depositorName,
    });
};

/**
 * 거래 완료 처리 (판매자)
 * POST /api/transactions/{transactionId}/complete
 */
export const completeTransaction = (transactionId) => {
    return api.post(`/api/transactions/${transactionId}/complete`);
};

/**
 * 거래 취소 (구매자)
 * DELETE /api/transactions/{transactionId}
 */
export const cancelTransaction = (transactionId) => {
    return api.delete(`/api/transactions/${transactionId}`);
};

// 필요하면 이렇게 객체 형태로도 사용할 수 있습니다.
const transactionApi = {
    getTransactionDetail,
    updateDepositor,
    completeTransaction,
    cancelTransaction,
};

export default transactionApi;
