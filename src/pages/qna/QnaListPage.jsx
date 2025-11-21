
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import qnaApi from '../../api/qnaApi';
// import useAuthStore from '../../stores/authStore';
// import Button from '../../components/common/Button';
// import Loading from '../../components/common/Loading';
// import ErrorMessage from '../../components/common/ErrorMessage';
// import Navbar from '../../components/common/Navbar';
// import Footer from '../../components/common/Footer';
//
// const QnaListPage = () => {
//     const navigate = useNavigate();
//     const { isAuthenticated } = useAuthStore();
//
//     // 상태 관리
//     const [qnaList, setQnaList] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [ready, setReady] = useState(false);
//
//     const [keyword, setKeyword] = useState('');
//     const [searchKeyword, setSearchKeyword] = useState('');
//     const [currentPage, setCurrentPage] = useState(0);
//     const [totalPages, setTotalPages] = useState(0);
//     const [totalElements, setTotalElements] = useState(0);
//
//     // 초기화
//     useEffect(() => {
//         const checkAuth = () => {
//             try {
//                 const authStorage = localStorage.getItem('auth-storage');
//                 if (!authStorage) {
//                     setReady(true);
//                     return;
//                 }
//
//                 const parsed = JSON.parse(authStorage);
//                 const hasToken = parsed?.state?.accessToken;
//
//                 if (hasToken) {
//                     setTimeout(() => setReady(true), 200);
//                 } else {
//                     setReady(true);
//                 }
//             } catch (error) {
//                 console.error('인증 체크 실패:', error);
//                 setReady(true);
//             }
//         };
//
//         checkAuth();
//     }, []);
//
//     // QnA 목록 조회
//     const fetchQnaList = async () => {
//         setLoading(true);
//         setError(null);
//
//         try {
//             const response = await qnaApi.getList({
//                 keyword: searchKeyword,
//                 page: currentPage,
//                 size: 10,
//             });
//
//             const data = response.data;
//             setQnaList(data.qnaPosts || []);
//             setTotalPages(data.totalPages || 0);
//             setTotalElements(data.totalElements || 0);
//         } catch (err) {
//             console.error('QnA 목록 조회 실패:', err);
//
//             if (err.response?.status === 401) {
//                 setError('로그인이 필요합니다. 다시 로그인해주세요.');
//                 setTimeout(() => navigate('/login'), 2000);
//             } else {
//                 setError(err.response?.data?.message || '목록을 불러오는 중 오류가 발생했습니다.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // ready && isAuthenticated 체크
//     useEffect(() => {
//         if (!ready) return;
//
//         if (isAuthenticated) {
//             fetchQnaList();
//         } else {
//             setLoading(false);
//             setError('로그인이 필요합니다.');
//         }
//     }, [ready, isAuthenticated, searchKeyword, currentPage]);
//
//     // 검색 실행
//     const handleSearch = (e) => {
//         e.preventDefault();
//         setSearchKeyword(keyword);
//         setCurrentPage(0);
//     };
//
//     // 검색 초기화
//     const handleReset = () => {
//         setKeyword('');
//         setSearchKeyword('');
//         setCurrentPage(0);
//     };
//
//     // 페이지 이동
//     const handlePageChange = (page) => {
//         setCurrentPage(page);
//         window.scrollTo(0, 0);
//     };
//
//     // 날짜 포맷팅
//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('ko-KR', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//         });
//     };
//
//     // 초기 로딩 중
//     if (!ready) {
//         return (
//             <>
//                 <Navbar />
//                 <div className="min-h-screen bg-gray-50">
//                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//                         <Loading text="페이지를 준비하는 중..." />
//                     </div>
//                 </div>
//                 <Footer />
//             </>
//         );
//     }
//
//     // 로그인 필요
//     if (!isAuthenticated) {
//         return (
//             <>
//                 <Navbar />
//                 <div className="min-h-screen bg-gray-50">
//                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//                         <div className="text-center py-20">
//                             <i className="bi bi-lock text-6xl text-gray-300 mb-4"></i>
//                             <h2 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
//                             <p className="text-gray-600 mb-8">Q&A를 이용하려면 로그인해주세요.</p>
//                             <Button onClick={() => navigate('/login')} variant="primary">
//                                 로그인하기
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//                 <Footer />
//             </>
//         );
//     }
//
//     return (
//         <>
//             <Navbar />
//             <div className="min-h-screen bg-gray-50">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//                     {/* 헤더 */}
//                     <div className="flex justify-between items-center mb-8">
//                         <div>
//                             <h1 className="text-4xl font-bold text-gray-800">Q&A</h1>
//                             <p className="text-gray-600 mt-2">
//                                 총 <span className="text-primary font-semibold">{totalElements}</span>개의 문의
//                             </p>
//                         </div>
//                         <Button onClick={() => navigate('/qna/write')} variant="primary">
//                             문의하기
//                         </Button>
//                     </div>
//
//                     {/* 검색 */}
//                     <form onSubmit={handleSearch} className="mb-8">
//                         <div className="flex gap-2">
//                             <input
//                                 type="text"
//                                 value={keyword}
//                                 onChange={(e) => setKeyword(e.target.value)}
//                                 placeholder="제목 또는 내용으로 검색..."
//                                 className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                             />
//                             <Button type="submit" variant="primary">
//                                 검색
//                             </Button>
//                             {searchKeyword && (
//                                 <Button type="button" onClick={handleReset} variant="secondary">
//                                     초기화
//                                 </Button>
//                             )}
//                         </div>
//                     </form>
//
//                     {/* 에러 메시지 */}
//                     {error && (
//                         <div className="mb-6">
//                             <ErrorMessage message={error} type="error" onClose={() => setError(null)} />
//                         </div>
//                     )}
//
//                     {/* 로딩 */}
//                     {loading ? (
//                         <Loading text="목록을 불러오는 중..." />
//                     ) : (
//                         <>
//                             {/* QnA 목록 */}
//                             {qnaList.length === 0 ? (
//                                 <div className="text-center py-20">
//                                     <i className="bi bi-inbox text-6xl text-gray-300"></i>
//                                     <p className="text-gray-500 mt-4 text-lg">
//                                         {searchKeyword ? '검색 결과가 없습니다.' : '등록된 문의가 없습니다.'}
//                                     </p>
//                                     {!searchKeyword && (
//                                         <Button
//                                             onClick={() => navigate('/qna/write')}
//                                             variant="primary"
//                                             className="mt-4"
//                                         >
//                                             첫 문의 작성하기
//                                         </Button>
//                                     )}
//                                 </div>
//                             ) : (
//                                 <div className="bg-white rounded-lg shadow-md overflow-hidden">
//                                     <table className="w-full">
//                                         <thead className="bg-gray-50 border-b">
//                                         <tr>
//                                             <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-20">
//                                                 번호
//                                             </th>
//                                             <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                                                 제목
//                                             </th>
//                                             <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-32">
//                                                 작성자
//                                             </th>
//                                             <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-32">
//                                                 작성일
//                                             </th>
//                                             <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-24">
//                                                 답변상태
//                                             </th>
//                                         </tr>
//                                         </thead>
//                                         <tbody className="divide-y divide-gray-200">
//                                         {qnaList.map((qna) => (
//                                             <tr
//                                                 key={qna.qnaId}
//                                                 className="hover:bg-gray-50 transition-colors cursor-pointer"
//                                                 onClick={() => console.log('QnA 클릭:', qna.qnaId)}
//                                             >
//                                                 <td className="px-6 py-4 text-sm text-gray-600">
//                                                     {qna.qnaId}
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <div className="text-sm font-medium text-gray-800">
//                                                         {qna.title}
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 text-sm text-gray-600">
//                                                     {qna.nickName}
//                                                 </td>
//                                                 <td className="px-6 py-4 text-sm text-gray-600">
//                                                     {formatDate(qna.createdDate)}
//                                                 </td>
//                                                 <td className="px-6 py-4 text-center">
//                                                     {qna.isAnswered ? (
//                                                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
//                                 답변완료
//                               </span>
//                                                     ) : (
//                                                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
//                                 대기중
//                               </span>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             )}
//
//                             {/* 페이징 */}
//                             {totalPages > 0 && (
//                                 <div className="flex justify-center items-center gap-2 mt-8">
//                                     <Button
//                                         onClick={() => handlePageChange(currentPage - 1)}
//                                         disabled={currentPage === 0}
//                                         variant="secondary"
//                                         size="sm"
//                                     >
//                                         이전
//                                     </Button>
//
//                                     {[...Array(totalPages)].map((_, index) => (
//                                         <Button
//                                             key={index}
//                                             onClick={() => handlePageChange(index)}
//                                             variant={currentPage === index ? 'primary' : 'secondary'}
//                                             size="sm"
//                                             className="min-w-[40px]"
//                                         >
//                                             {index + 1}
//                                         </Button>
//                                     ))}
//
//                                     <Button
//                                         onClick={() => handlePageChange(currentPage + 1)}
//                                         disabled={currentPage === totalPages - 1}
//                                         variant="secondary"
//                                         size="sm"
//                                     >
//                                         다음
//                                     </Button>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             </div>
//             <Footer />
//         </>
//     );
// };
//
// export default QnaListPage;


// ------------------------------------------------------------------------------------------------------------

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import qnaApi from '../../api/qnaApi';
// import useAuthStore from '../../stores/authStore';
// import Button from '../../components/common/Button';
// import ErrorMessage from '../../components/common/ErrorMessage';
// import Navbar from '../../components/common/Navbar';
// import Footer from '../../components/common/Footer';
//
// const QnaFormPage = () => {
//     const navigate = useNavigate();
//     const { isAuthenticated } = useAuthStore();
//
//     // 폼 데이터
//     const [formData, setFormData] = useState({
//         title: '',
//         content: '',
//         agree: false, // 👈 추가: 개인정보 동의
//     });
//
//     // 에러 & 로딩
//     const [errors, setErrors] = useState({});
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(false);
//
//     // 인증 체크
//     useEffect(() => {
//         if (!isAuthenticated) {
//             alert('로그인이 필요합니다.');
//             navigate('/login');
//         }
//     }, [isAuthenticated, navigate]);
//
//     // 입력 변경 처리
//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value,
//         }));
//
//         if (errors[name]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [name]: null,
//             }));
//         }
//     };
//
//     // 유효성 검증
//     const validate = () => {
//         const newErrors = {};
//
//         if (!formData.title.trim()) {
//             newErrors.title = '제목을 입력해주세요.';
//         } else if (formData.title.length > 100) {
//             newErrors.title = '제목은 100자 이내로 입력해주세요.';
//         }
//
//         if (!formData.content.trim()) {
//             newErrors.content = '내용을 입력해주세요.';
//         } else if (formData.content.length > 1000) {
//             newErrors.content = '내용은 1000자 이내로 입력해주세요.';
//         }
//
//         if (!formData.agree) {
//             newErrors.agree = '개인정보 수집 및 이용에 동의해주세요.';
//         }
//
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };
//
//     // 제출 처리
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError(null);
//
//         if (!isAuthenticated) {
//             alert('로그인이 필요합니다.');
//             navigate('/login');
//             return;
//         }
//
//         if (!validate()) {
//             return;
//         }
//
//         setLoading(true);
//
//         try {
//             const response = await qnaApi.create({
//                 title: formData.title.trim(),
//                 content: formData.content.trim(),
//             });
//
//             alert(response.data.message || '문의가 등록되었습니다.');
//             navigate('/qna');
//         } catch (err) {
//             console.error('QnA 작성 실패:', err);
//
//             if (err.response?.status === 401) {
//                 alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
//                 navigate('/login');
//             } else {
//                 setError(err.response?.data?.message || '문의 등록 중 오류가 발생했습니다.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // 취소
//     const handleCancel = () => {
//         if (formData.title || formData.content) {
//             if (window.confirm('작성 중인 내용이 있습니다. 취소하시겠습니까?')) {
//                 navigate('/qna');
//             }
//         } else {
//             navigate('/qna');
//         }
//     };
//
//     if (!isAuthenticated) {
//         return null;
//     }
//
//     return (
//         <>
//             <Navbar />
//             <div className="min-h-screen bg-gray-50">
//                 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//                     {/* 에러 메시지 */}
//                     {error && (
//                         <div className="mb-6">
//                             <ErrorMessage message={error} type="error" onClose={() => setError(null)} />
//                         </div>
//                     )}
//
//                     {/* 메인 폼 카드 */}
//                     <div className="bg-white rounded-2xl shadow-xl p-8">
//                         {/* 헤더 */}
//                         <div className="mb-8">
//                             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//                                 <i className="bi bi-pencil-square text-primary mr-2"></i>
//                                 Q&A 작성
//                             </h1>
//                             <p className="text-gray-600">궁금한 사항을 문의해주시면 빠르게 답변드리겠습니다.</p>
//                         </div>
//
//                         {/* 폼 */}
//                         <form onSubmit={handleSubmit} className="space-y-6">
//                             {/* 제목 */}
//                             <div>
//                                 <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
//                                     제목 <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     id="title"
//                                     name="title"
//                                     value={formData.title}
//                                     onChange={handleChange}
//                                     required
//                                     placeholder="제목을 입력하세요"
//                                     className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors ${
//                                         errors.title ? 'border-red-500' : ''
//                                     }`}
//                                     disabled={loading}
//                                 />
//                                 {errors.title && (
//                                     <p className="mt-1 text-sm text-red-500">{errors.title}</p>
//                                 )}
//                             </div>
//
//                             {/* 내용 */}
//                             <div>
//                                 <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
//                                     내용 <span className="text-red-500">*</span>
//                                 </label>
//                                 <textarea
//                                     id="content"
//                                     name="content"
//                                     value={formData.content}
//                                     onChange={handleChange}
//                                     required
//                                     rows="12"
//                                     placeholder="문의 내용을 상세하게 작성해주세요.
//
// 예시:
// - 상품 관련 문의
// - 결제/배송 관련 문의
// - 기타 서비스 이용 관련 문의"
//                                     className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none transition-colors ${
//                                         errors.content ? 'border-red-500' : ''
//                                     }`}
//                                     disabled={loading}
//                                 />
//                                 {errors.content && (
//                                     <p className="mt-1 text-sm text-red-500">{errors.content}</p>
//                                 )}
//                                 <p className="mt-2 text-sm text-gray-500">
//                                     <i className="bi bi-info-circle mr-1"></i>
//                                     개인정보(전화번호, 이메일 등)는 공개되지 않도록 주의해주세요.
//                                 </p>
//                             </div>
//
//                             {/* Notice */}
//                             <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
//                                 <div className="flex">
//                                     <div className="flex-shrink-0">
//                                         <i className="bi bi-info-circle-fill text-blue-500 text-xl"></i>
//                                     </div>
//                                     <div className="ml-3">
//                                         <h3 className="text-sm font-semibold text-blue-800 mb-1">문의 전 확인사항</h3>
//                                         <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
//                                             <li>자주 묻는 질문(FAQ)을 먼저 확인해주세요.</li>
//                                             <li>답변은 평일 기준 1-2일 이내에 등록됩니다.</li>
//                                             <li>주말 및 공휴일에는 답변이 지연될 수 있습니다.</li>
//                                         </ul>
//                                     </div>
//                                 </div>
//                             </div>
//
//                             {/* Agreement */}
//                             <div className="border-t border-gray-200 pt-6">
//                                 <div className="flex items-start">
//                                     <input
//                                         id="agree"
//                                         name="agree"
//                                         type="checkbox"
//                                         checked={formData.agree}
//                                         onChange={handleChange}
//                                         required
//                                         className="h-4 w-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
//                                     />
//                                     <label htmlFor="agree" className="ml-3 block text-sm text-gray-700">
//                                         개인정보 수집 및 이용에 동의합니다. <span className="text-red-500">(필수)</span>
//                                         <p className="text-xs text-gray-500 mt-1">
//                                             문의 답변을 위해 작성하신 내용이 수집되며, 답변 완료 후 일정 기간 보관 후 파기됩니다.
//                                         </p>
//                                     </label>
//                                 </div>
//                                 {errors.agree && (
//                                     <p className="mt-2 text-sm text-red-500 ml-7">{errors.agree}</p>
//                                 )}
//                             </div>
//
//                             {/* Buttons */}
//                             <div className="flex gap-4 pt-6">
//                                 <button
//                                     type="button"
//                                     onClick={handleCancel}
//                                     disabled={loading}
//                                     className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
//                                 >
//                                     <i className="bi bi-arrow-left mr-2"></i>취소
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
//                                 >
//                                     <i className="bi bi-send mr-2"></i>
//                                     {loading ? '등록 중...' : '문의 등록'}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//
//                     {/* FAQ Section */}
//                     <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
//                         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//                             <i className="bi bi-question-circle text-primary mr-2"></i>
//                             자주 묻는 질문 (FAQ)
//                         </h2>
//                         <div className="space-y-4">
//                             <details className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
//                                 <summary className="font-semibold text-gray-800 cursor-pointer flex items-center justify-between">
//                   <span>
//                     <i className="bi bi-chevron-right group-open:rotate-90 transition-transform mr-2"></i>
//                     회원가입은 어떻게 하나요?
//                   </span>
//                                 </summary>
//                                 <p className="mt-3 text-gray-600 pl-6">
//                                     홈페이지 우측 상단의 '회원가입' 버튼을 클릭하신 후, 필요한 정보를 입력하시면 가입이 완료됩니다.
//                                 </p>
//                             </details>
//
//                             <details className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
//                                 <summary className="font-semibold text-gray-800 cursor-pointer flex items-center justify-between">
//                   <span>
//                     <i className="bi bi-chevron-right group-open:rotate-90 transition-transform mr-2"></i>
//                     상품은 어떻게 등록하나요?
//                   </span>
//                                 </summary>
//                                 <p className="mt-3 text-gray-600 pl-6">
//                                     로그인 후 마이페이지에서 '상품 등록하기' 버튼을 클릭하여 상품 정보를 입력하시면 됩니다.
//                                 </p>
//                             </details>
//
//                             <details className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
//                                 <summary className="font-semibold text-gray-800 cursor-pointer flex items-center justify-between">
//                   <span>
//                     <i className="bi bi-chevron-right group-open:rotate-90 transition-transform mr-2"></i>
//                     거래는 어떻게 진행되나요?
//                   </span>
//                                 </summary>
//                                 <p className="mt-3 text-gray-600 pl-6">
//                                     원하시는 상품을 찾으신 후 '구매하기' 버튼을 클릭하여 판매자와 직접 거래를 진행하시면 됩니다. 안전한 거래를 위해 직거래를 권장드립니다.
//                                 </p>
//                             </details>
//
//                             <details className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
//                                 <summary className="font-semibold text-gray-800 cursor-pointer flex items-center justify-between">
//                   <span>
//                     <i className="bi bi-chevron-right group-open:rotate-90 transition-transform mr-2"></i>
//                     비밀번호를 분실했어요.
//                   </span>
//                                 </summary>
//                                 <p className="mt-3 text-gray-600 pl-6">
//                                     로그인 페이지에서 '비밀번호 찾기'를 클릭하시고 가입 시 등록하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
//                                 </p>
//                             </details>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <Footer />
//         </>
//     );
// };
//
// export default QnaFormPage;


//-------------------------------------------------------------------------------------------------


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import qnaApi from '../../api/qnaApi';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const QnaListPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    // 상태 관리
    const [qnaList, setQnaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ready, setReady] = useState(false);

    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // 초기화
    useEffect(() => {
        const checkAuth = () => {
            try {
                const authStorage = localStorage.getItem('auth-storage');
                if (!authStorage) {
                    setReady(true);
                    return;
                }

                const parsed = JSON.parse(authStorage);
                const hasToken = parsed?.state?.accessToken;

                if (hasToken) {
                    setTimeout(() => setReady(true), 200);
                } else {
                    setReady(true);
                }
            } catch (error) {
                console.error('인증 체크 실패:', error);
                setReady(true);
            }
        };

        checkAuth();
    }, []);

    // QnA 목록 조회
    const fetchQnaList = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await qnaApi.getList({
                keyword: searchKeyword,
                page: currentPage,
                size: 10,
            });

            const data = response.data;
            setQnaList(data.qnaPosts || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error('QnA 목록 조회 실패:', err);

            if (err.response?.status === 401) {
                setError('로그인이 필요합니다. 다시 로그인해주세요.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(err.response?.data?.message || '목록을 불러오는 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ready && isAuthenticated 체크
    useEffect(() => {
        if (!ready) return;

        if (isAuthenticated) {
            fetchQnaList();
        } else {
            setLoading(false);
            setError('로그인이 필요합니다.');
        }
    }, [ready, isAuthenticated, searchKeyword, currentPage]);

    // 검색 실행
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchKeyword(keyword);
        setCurrentPage(0);
    };

    // 검색 초기화
    const handleReset = () => {
        setKeyword('');
        setSearchKeyword('');
        setCurrentPage(0);
    };

    // 페이지 이동
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    // 초기 로딩 중
    if (!ready) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <Loading text="페이지를 준비하는 중..." />
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // 로그인 필요
    if (!isAuthenticated) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center py-20">
                            <i className="bi bi-lock text-6xl text-gray-300 mb-4"></i>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
                            <p className="text-gray-600 mb-8">Q&A를 이용하려면 로그인해주세요.</p>
                            <Button onClick={() => navigate('/login')} variant="primary">
                                로그인하기
                            </Button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* 헤더 카드 */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-800 mb-3">Q&A 게시판</h2>
                                <p className="text-gray-600">궁금한 점이 있으시면 언제든지 문의해주세요!</p>
                            </div>
                            <button
                                onClick={() => navigate('/qna/write')}
                                className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
                            >
                                <i className="bi bi-pencil-square mr-2"></i>
                                질문 작성
                            </button>
                        </div>
                    </div>

                    {/* 검색 */}
                    <form onSubmit={handleSearch} className="mb-8">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="제목 또는 내용으로 검색하세요..."
                                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-lg"
                            />
                            <button
                                type="submit"
                                className="bg-primary hover:bg-secondary text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center"
                            >
                                <i className="bi bi-search mr-2"></i>
                                검색
                            </button>
                        </div>
                        {searchKeyword && (
                            <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <i className="bi bi-search text-blue-600 mr-2"></i>
                                    <span className="text-blue-800">
                    검색어: <strong>'{searchKeyword}'</strong> · 검색 결과
                  </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                >
                                    <i className="bi bi-x-circle mr-1"></i>
                                    검색 결과 지우기
                                </button>
                            </div>
                        )}
                    </form>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6">
                            <ErrorMessage message={error} type="error" onClose={() => setError(null)} />
                        </div>
                    )}

                    {/* 로딩 */}
                    {loading ? (
                        <Loading text="목록을 불러오는 중..." />
                    ) : (
                        <>
                            {/* QnA 목록 - 카드 형태 */}
                            {qnaList.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                                    <i className="bi bi-inbox text-6xl text-gray-300"></i>
                                    <p className="text-gray-500 mt-4 text-lg">
                                        {searchKeyword ? (
                                            <>
                                                '<strong>{searchKeyword}</strong>'에 대한 검색 결과가 없습니다.
                                            </>
                                        ) : (
                                            '등록된 Q&A가 없습니다.'
                                        )}
                                    </p>
                                    {!searchKeyword && (
                                        <button
                                            onClick={() => navigate('/qna/write')}
                                            className="mt-6 bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                                        >
                                            <i className="bi bi-pencil-square mr-2"></i>
                                            첫 질문 작성하기
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {qnaList.map((qna) => (
                                        <div
                                            key={qna.qnaId}
                                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer transform hover:-translate-y-1"
                                            onClick={() => console.log('QnA 클릭:', qna.qnaId)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    {/* 답변 상태 뱃지 */}
                                                    <div className="flex items-center gap-3 mb-3">
                                                        {qna.isAnswered ? (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700 border border-green-200">
                                <i className="bi bi-check-circle-fill mr-1"></i>
                                답변완료
                              </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                <i className="bi bi-clock-fill mr-1"></i>
                                답변대기
                              </span>
                                                        )}
                                                        <span className="text-sm text-gray-500">
                              <i className="bi bi-chat-dots mr-1"></i>Q. {qna.qnaId}
                            </span>
                                                    </div>

                                                    {/* 제목 */}
                                                    <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-primary transition-colors">
                                                        {qna.title}
                                                    </h3>

                                                    {/* 작성자 & 날짜 */}
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <i className="bi bi-person-circle mr-1"></i>
                                {qna.nickName}
                            </span>
                                                        <span className="flex items-center">
                              <i className="bi bi-calendar3 mr-1"></i>
                                                            {formatDate(qna.createdDate)}
                            </span>
                                                    </div>
                                                </div>

                                                {/* 화살표 아이콘 */}
                                                <div className="ml-4 text-gray-400">
                                                    <i className="bi bi-chevron-right text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 페이징 */}
                            {totalPages > 0 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>

                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(index)}
                                            className={`min-w-[40px] px-4 py-2 rounded-lg font-bold transition-all ${
                                                currentPage === index
                                                    ? 'bg-primary text-white shadow-lg'
                                                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default QnaListPage;