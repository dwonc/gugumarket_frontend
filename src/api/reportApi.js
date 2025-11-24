import api from './axios';

export const reportApi = {
    create: (productId, reason = '부적절한 게시물') => {
        return api.post('/report', { productId, reason });
    },

    // ========= 추가 =================
    resolve: (reportId) => {
        return api.post(`/report/${reportId}/resolve`);
    },
};

export default reportApi;