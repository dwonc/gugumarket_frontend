// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import qnaApi from '../../api/qnaApi';
// import useAuthStore from '../../stores/authStore';
// import Button from '../../components/common/Button';
// import ErrorMessage from '../../components/common/ErrorMessage';
//
// const QnaFormPage = () => {
//     const navigate = useNavigate();
//     const { isAuthenticated } = useAuthStore();
//
//     // 폼 데이터
//     const [formData, setFormData] = useState({
//         title: '',
//         content: '',
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
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value,
//         }));
//
//         // 입력 시 해당 필드 에러 제거
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
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };
//
//     // 제출 처리
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError(null);
//
//         // 인증 재확인
//         if (!isAuthenticated) {
//             alert('로그인이 필요합니다.');
//             navigate('/login');
//             return;
//         }
//
//         // 유효성 검증
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
//     // 로그인 안 되어 있으면 리다이렉트 중
//     if (!isAuthenticated) {
//         return null;
//     }
//
//     return (
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//             {/* 헤더 */}
//             <div className="mb-8">
//                 <h1 className="text-4xl font-bold text-gray-800">문의하기</h1>
//                 <p className="text-gray-600 mt-2">
//                     궁금하신 사항을 작성해주세요. 빠른 시일 내에 답변드리겠습니다.
//                 </p>
//             </div>
//
//             {/* 에러 메시지 */}
//             {error && (
//                 <div className="mb-6">
//                     <ErrorMessage message={error} type="error" onClose={() => setError(null)} />
//                 </div>
//             )}
//
//             {/* 폼 */}
//             <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
//                 {/* 제목 */}
//                 <div className="mb-6">
//                     <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
//                         제목 <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                         type="text"
//                         id="title"
//                         name="title"
//                         value={formData.title}
//                         onChange={handleChange}
//                         placeholder="제목을 입력해주세요"
//                         className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
//                             errors.title
//                                 ? 'border-red-500 focus:ring-red-500'
//                                 : 'border-gray-300 focus:ring-primary'
//                         }`}
//                         disabled={loading}
//                     />
//                     {errors.title && (
//                         <p className="mt-2 text-sm text-red-600">
//                             <i className="bi bi-exclamation-circle mr-1"></i>
//                             {errors.title}
//                         </p>
//                     )}
//                     <p className="mt-2 text-sm text-gray-500">
//                         {formData.title.length}/100
//                     </p>
//                 </div>
//
//                 {/* 내용 */}
//                 <div className="mb-8">
//                     <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
//                         내용 <span className="text-red-500">*</span>
//                     </label>
//                     <textarea
//                         id="content"
//                         name="content"
//                         value={formData.content}
//                         onChange={handleChange}
//                         placeholder="문의 내용을 상세히 작성해주세요"
//                         rows="10"
//                         className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
//                             errors.content
//                                 ? 'border-red-500 focus:ring-red-500'
//                                 : 'border-gray-300 focus:ring-primary'
//                         }`}
//                         disabled={loading}
//                     />
//                     {errors.content && (
//                         <p className="mt-2 text-sm text-red-600">
//                             <i className="bi bi-exclamation-circle mr-1"></i>
//                             {errors.content}
//                         </p>
//                     )}
//                     <p className="mt-2 text-sm text-gray-500">
//                         {formData.content.length}/1000
//                     </p>
//                 </div>
//
//                 {/* 버튼 */}
//                 <div className="flex justify-end gap-4">
//                     <Button
//                         type="button"
//                         onClick={handleCancel}
//                         variant="secondary"
//                         size="lg"
//                         disabled={loading}
//                     >
//                         취소
//                     </Button>
//                     <Button
//                         type="submit"
//                         variant="primary"
//                         size="lg"
//                         disabled={loading}
//                     >
//                         {loading ? (
//                             <>
//                                 <i className="bi bi-hourglass-split animate-spin mr-2"></i>
//                                 등록 중...
//                             </>
//                         ) : (
//                             '등록하기'
//                         )}
//                     </Button>
//                 </div>
//             </form>
//
//             {/* 안내 */}
//             <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-blue-800 mb-3">
//                     <i className="bi bi-info-circle mr-2"></i>
//                     문의 작성 안내
//                 </h3>
//                 <ul className="space-y-2 text-sm text-blue-700">
//                     <li>• 문의 내용은 관리자만 확인할 수 있습니다.</li>
//                     <li>• 답변은 영업일 기준 1~2일 내에 등록됩니다.</li>
//                     <li>• 개인정보가 포함된 내용은 작성을 자제해주세요.</li>
//                     <li>• 욕설, 비방 등 부적절한 내용은 삭제될 수 있습니다.</li>
//                 </ul>
//             </div>
//         </div>
//     );
// };
//
// export default QnaFormPage;


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
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value,
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
//                     {/* 헤더 */}
//                     <div className="mb-8">
//                         <h1 className="text-4xl font-bold text-gray-800">문의하기</h1>
//                         <p className="text-gray-600 mt-2">
//                             궁금하신 사항을 작성해주세요. 빠른 시일 내에 답변드리겠습니다.
//                         </p>
//                     </div>
//
//                     {/* 에러 메시지 */}
//                     {error && (
//                         <div className="mb-6">
//                             <ErrorMessage message={error} type="error" onClose={() => setError(null)} />
//                         </div>
//                     )}
//
//                     {/* 폼 */}
//                     <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
//                         {/* 제목 */}
//                         <div className="mb-6">
//                             <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
//                                 제목 <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 id="title"
//                                 name="title"
//                                 value={formData.title}
//                                 onChange={handleChange}
//                                 placeholder="제목을 입력해주세요"
//                                 className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
//                                     errors.title
//                                         ? 'border-red-500 focus:ring-red-500'
//                                         : 'border-gray-300 focus:ring-primary'
//                                 }`}
//                                 disabled={loading}
//                             />
//                             {errors.title && (
//                                 <p className="mt-2 text-sm text-red-600">
//                                     <i className="bi bi-exclamation-circle mr-1"></i>
//                                     {errors.title}
//                                 </p>
//                             )}
//                             <p className="mt-2 text-sm text-gray-500">
//                                 {formData.title.length}/100
//                             </p>
//                         </div>
//
//                         {/* 내용 */}
//                         <div className="mb-8">
//                             <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
//                                 내용 <span className="text-red-500">*</span>
//                             </label>
//                             <textarea
//                                 id="content"
//                                 name="content"
//                                 value={formData.content}
//                                 onChange={handleChange}
//                                 placeholder="문의 내용을 상세히 작성해주세요"
//                                 rows="10"
//                                 className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
//                                     errors.content
//                                         ? 'border-red-500 focus:ring-red-500'
//                                         : 'border-gray-300 focus:ring-primary'
//                                 }`}
//                                 disabled={loading}
//                             />
//                             {errors.content && (
//                                 <p className="mt-2 text-sm text-red-600">
//                                     <i className="bi bi-exclamation-circle mr-1"></i>
//                                     {errors.content}
//                                 </p>
//                             )}
//                             <p className="mt-2 text-sm text-gray-500">
//                                 {formData.content.length}/1000
//                             </p>
//                         </div>
//
//                         {/* 버튼 */}
//                         <div className="flex justify-end gap-4">
//                             <Button
//                                 type="button"
//                                 onClick={handleCancel}
//                                 variant="secondary"
//                                 size="lg"
//                                 disabled={loading}
//                             >
//                                 취소
//                             </Button>
//                             <Button
//                                 type="submit"
//                                 variant="primary"
//                                 size="lg"
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <>
//                                         <i className="bi bi-hourglass-split animate-spin mr-2"></i>
//                                         등록 중...
//                                     </>
//                                 ) : (
//                                     '등록하기'
//                                 )}
//                             </Button>
//                         </div>
//                     </form>
//
//                     {/* 안내 */}
//                     <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
//                         <h3 className="text-lg font-semibold text-blue-800 mb-3">
//                             <i className="bi bi-info-circle mr-2"></i>
//                             문의 작성 안내
//                         </h3>
//                         <ul className="space-y-2 text-sm text-blue-700">
//                             <li>• 문의 내용은 관리자만 확인할 수 있습니다.</li>
//                             <li>• 답변은 영업일 기준 1~2일 내에 등록됩니다.</li>
//                             <li>• 개인정보가 포함된 내용은 작성을 자제해주세요.</li>
//                             <li>• 욕설, 비방 등 부적절한 내용은 삭제될 수 있습니다.</li>
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//             <Footer />
//         </>
//     );
// };
//
// export default QnaFormPage;



// ------------------------------------------------------------------------------------------------------------


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import qnaApi from '../../api/qnaApi';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const QnaFormPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    // 폼 데이터
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        agree: false,
    });

    // 에러 & 로딩
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // 인증 체크
    useEffect(() => {
        if (!isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // 입력 변경 처리
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    // 유효성 검증
    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = '제목을 입력해주세요.';
        } else if (formData.title.length > 100) {
            newErrors.title = '제목은 100자 이내로 입력해주세요.';
        }

        if (!formData.content.trim()) {
            newErrors.content = '내용을 입력해주세요.';
        } else if (formData.content.length > 1000) {
            newErrors.content = '내용은 1000자 이내로 입력해주세요.';
        }

        if (!formData.agree) {
            newErrors.agree = '개인정보 수집 및 이용에 동의해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            const response = await qnaApi.create({
                title: formData.title.trim(),
                content: formData.content.trim(),
            });

            alert(response.data.message || '문의가 등록되었습니다.');
            navigate('/qna');
        } catch (err) {
            console.error('QnA 작성 실패:', err);

            if (err.response?.status === 401) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                setError(err.response?.data?.message || '문의 등록 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 취소
    const handleCancel = () => {
        if (formData.title || formData.content) {
            if (window.confirm('작성 중인 내용이 있습니다. 취소하시겠습니까?')) {
                navigate('/qna');
            }
        } else {
            navigate('/qna');
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6">
                            <ErrorMessage message={error} type="error" onClose={() => setError(null)} />
                        </div>
                    )}

                    {/* 메인 폼 카드 */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* 헤더 */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                <i className="bi bi-pencil-square text-primary mr-2"></i>
                                Q&A 작성
                            </h1>
                            <p className="text-gray-600">궁금한 사항을 문의해주시면 빠르게 답변드리겠습니다.</p>
                        </div>

                        {/* 폼 */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 제목 */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                    제목 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="제목을 입력하세요"
                                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors ${
                                        errors.title ? 'border-red-500' : ''
                                    }`}
                                    disabled={loading}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                                )}
                            </div>

                            {/* 내용 */}
                            <div>
                                <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                                    내용 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    rows="12"
                                    placeholder="문의 내용을 상세하게 작성해주세요.

예시:
- 상품 관련 문의
- 결제/배송 관련 문의
- 기타 서비스 이용 관련 문의"
                                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none transition-colors ${
                                        errors.content ? 'border-red-500' : ''
                                    }`}
                                    disabled={loading}
                                />
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-500">{errors.content}</p>
                                )}
                                <p className="mt-2 text-sm text-gray-500">
                                    <i className="bi bi-info-circle mr-1"></i>
                                    개인정보(전화번호, 이메일 등)는 공개되지 않도록 주의해주세요.
                                </p>
                            </div>

                            {/* Notice */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <i className="bi bi-info-circle-fill text-blue-500 text-xl"></i>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-semibold text-blue-800 mb-1">문의 전 확인사항</h3>
                                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                            <li>자주 묻는 질문(FAQ)을 먼저 확인해주세요.</li>
                                            <li>답변은 평일 기준 1-2일 이내에 등록됩니다.</li>
                                            <li>주말 및 공휴일에는 답변이 지연될 수 있습니다.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Agreement */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-start">
                                    <input
                                        id="agree"
                                        name="agree"
                                        type="checkbox"
                                        checked={formData.agree}
                                        onChange={handleChange}
                                        required
                                        className="h-4 w-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <label htmlFor="agree" className="ml-3 block text-sm text-gray-700">
                                        개인정보 수집 및 이용에 동의합니다. <span className="text-red-500">(필수)</span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            문의 답변을 위해 작성하신 내용이 수집되며, 답변 완료 후 일정 기간 보관 후 파기됩니다.
                                        </p>
                                    </label>
                                </div>
                                {errors.agree && (
                                    <p className="mt-2 text-sm text-red-500 ml-7">{errors.agree}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
                                >
                                    <i className="bi bi-arrow-left mr-2"></i>취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
                                >
                                    <i className="bi bi-send mr-2"></i>
                                    {loading ? '등록 중...' : '문의 등록'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            <i className="bi bi-question-circle text-primary mr-2"></i>
                            자주 묻는 질문 (FAQ)
                        </h2>
                        <div className="space-y-4">
                            <details className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                                <summary className="font-semibold text-gray-800 cursor-pointer flex items-center justify-between">
                  <span>
                    <i className="bi bi-chevron-right group-open:rotate-90 transition-transform mr-2"></i>
                    회원가입은 어떻게 하나요?
                  </span>
                                </summary>
                                <p className="mt-3 text-gray-600 pl-6">
                                    홈페이지 우측 상단의 '회원가입' 버튼을 클릭하신 후, 필요한 정보를 입력하시면 가입이 완료됩니다.
                                </p>
                            </details>

                            <details className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                                <summary className="font-semibold text-gray-800 cursor-pointer flex items-center justify-between">
                  <span>
                    <i className="bi bi-chevron-right group-open:rotate-90 transition-transform mr-2"></i>
                    상품은 어떻게 등록하나요?
                  </span>
                                </summary>
                                <p className="mt-3 text-gray-600 pl-6">
                                    로그인 후 마이페이지에서 '상품 등록하기' 버튼을 클릭하여 상품 정보를 입력하시면 됩니다.
                                </p>
                            </details>

                            <details className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                                <summary className="font-semibold text-gray-800 cursor-pointer flex items-center justify-between">
                  <span>
                    <i className="bi bi-chevron-right group-open:rotate-90 transition-transform mr-2"></i>
                    거래는 어떻게 진행되나요?
                  </span>
                                </summary>
                                <p className="mt-3 text-gray-600 pl-6">
                                    원하시는 상품을 찾으신 후 '구매하기' 버튼을 클릭하여 판매자와 직접 거래를 진행하시면 됩니다. 안전한 거래를 위해 직거래를 권장드립니다.
                                </p>
                            </details>

                            <details className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                                <summary className="font-semibold text-gray-800 cursor-pointer flex items-center justify-between">
                  <span>
                    <i className="bi bi-chevron-right group-open:rotate-90 transition-transform mr-2"></i>
                    비밀번호를 분실했어요.
                  </span>
                                </summary>
                                <p className="mt-3 text-gray-600 pl-6">
                                    로그인 페이지에서 '비밀번호 찾기'를 클릭하시고 가입 시 등록하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                                </p>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default QnaFormPage;

