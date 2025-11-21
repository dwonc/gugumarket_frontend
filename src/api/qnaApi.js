import api from './axios';


export const qnaApi = {


    /**
     * QnA 목록 조회 (검색, 페이징)
     * @param {Object} params - { keyword, page, size }
     * @returns {Promise} { success, qnaPosts, totalPages, totalElements, currentPage, keyword, user }
     */


    getList: (params = {}) => {
        return api.get('/qna/list', {
            params: {
                page: params.page || 0,
                size: params.size || 10,
                keyword: params.keyword || null,
            }
        });
    },


    /**
     * QnA 작성
     * @param {Object} data - { title, content }
     * @returns {Promise} { success, message, qnaId, qnaPost }
     */


    create: (data) => {
        return api.post('/qna/write', data);
    },
};

export default qnaApi;