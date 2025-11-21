import React, { useState, useEffect, useCallback, useMemo, memo } from "react"; // ✅ memo 추가
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/userApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loading from "../../components/common/Loading";

// *******************************************************************
// ✅ 1. InputField 컴포넌트를 함수 외부로 분리하고 React.memo 적용
// *******************************************************************
// [주의] 이 컴포넌트는 SignupPage의 state/handler를 직접 참조하지 않고 props로 받도록 수정해야 합니다.
const InputField = memo(({
                             label,
                             name,
                             type = "text",
                             placeholder,
                             isRequired = true,
                             rightContent = null,
                             readOnly = false,
                             value, // ✅ value를 props로 받음
                             error, // ✅ errors[name] 대신 error 상태를 받음
                             renderError, // ✅ renderError 함수를 받음
                             onChange, // ✅ handleChange 함수를 받음
                             isSubmitting // ✅ isSubmitting 상태를 받음
                         }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
            {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <div className={`flex ${rightContent ? 'gap-2' : ''}`}>
            <input
                id={name}
                type={type}
                name={name}
                value={value} // ✅ props.value 사용
                onChange={onChange} // ✅ props.onChange 사용
                placeholder={placeholder}
                className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition-colors text-gray-800 ${
                    error ? 'border-red-500' : 'border-gray-200'
                } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:border-primary'}`}
                disabled={isSubmitting}
                readOnly={readOnly}
            />
            {rightContent}
        </div>
        {renderError(name)}
    </div>
));
// *******************************************************************
// *******************************************************************


const SignupPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        passwordConfirm: "",
        nickname: "",
        phone: "",
        postalCode: "",
        address: "",
        addressDetail: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const [usernameCheckStatus, setUsernameCheckStatus] = useState({
        isChecked: false,
        isDuplicate: false,
        message: "",
    });

    const [agreements, setAgreements] = useState({
        agreeTerms: false,
        agreePrivacy: false,
    });

    // Daum Postcode API 스크립트 로드
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        document.head.appendChild(script);
    }, []);

    // ✅ 입력 변경 핸들러 (useCallback으로 메모이제이션)
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        // setFormData를 함수 형태로 호출하여 렌더링 최적화
        setFormData(prev => ({ ...prev, [name]: value }));

        // 아이디 변경 시 중복 체크 상태 초기화
        if (name === "userName") {
            setUsernameCheckStatus({
                isChecked: false,
                isDuplicate: false,
                message: "",
            });
        }

        // 입력 시 에러 메시지 제거
        setErrors(prev => {
            if (prev[name]) {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            }
            return prev;
        });
    }, []);

    // ✅ 약관 동의 핸들러 (useCallback으로 메모이제이션)
    const handleAgreementChange = useCallback((e) => {
        const { id, checked } = e.target;
        if (id === 'agree-all') {
            setAgreements({ agreeTerms: checked, agreePrivacy: checked });
        } else {
            setAgreements(prev => ({ ...prev, [id]: checked }));
        }
    }, []);

    // ✅ 에러 메시지 렌더링 함수 (useCallback으로 메모이제이션)
    // 이 함수는 InputField의 props로 전달되어 사용됩니다.
    const renderError = useCallback((fieldName) => {
        return errors[fieldName] ? (
            <p className="mt-1 text-sm text-red-500">{errors[fieldName]}</p>
        ) : null;
    }, [errors]); // errors 상태에만 의존

    // 아이디 중복 체크 핸들러와 handleSubmit 로직은 변경하지 않습니다.
    const handleCheckUsername = useCallback(async () => {
        if (!formData.userName) {
            setErrors(prev => ({ ...prev, userName: "아이디를 입력해주세요." }));
            return;
        }
        if (formData.userName.length < 5 || formData.userName.length > 20) {
            setErrors(prev => ({ ...prev, userName: "아이디는 5자 이상 20자 이하로 입력해야 합니다." }));
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setMessage(null);

        try {
            const response = await userApi.checkUsername(formData.userName);
            const { isDuplicate, message: apiMessage } = response.data;

            setUsernameCheckStatus({
                isChecked: true,
                isDuplicate: isDuplicate,
                message: apiMessage,
            });
            setMessage({ type: isDuplicate ? "warning" : "success", text: apiMessage });
        } catch (error) {
            console.error("아이디 중복 체크 오류:", error);
            setMessage({ type: "error", text: "아이디 중복 확인 중 오류가 발생했습니다." });
            setUsernameCheckStatus(prev => ({
                ...prev,
                isChecked: true,
                isDuplicate: true,
                message: "중복 확인 오류 발생."
            }));
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.userName]); // userName에만 의존

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);

        const newErrors = {};
        if (formData.password !== formData.passwordConfirm) {
            newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }
        if (!usernameCheckStatus.isChecked || usernameCheckStatus.isDuplicate) {
            newErrors.userName = "아이디 중복 확인을 완료하고 사용 가능한 아이디를 입력해주세요.";
        }
        if (!agreements.agreeTerms || !agreements.agreePrivacy) {
            newErrors.agreement = "필수 약관에 모두 동의해야 합니다.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setMessage({ type: "error", text: "입력된 정보를 확인해주세요." });
            return;
        }

        setIsSubmitting(true);

        const { passwordConfirm: _, ...dataToSend } = formData; // ✅ ESLint 경고 해결

        try {
            const response = await userApi.signup(dataToSend);

            if (response.data.success) {
                setMessage({ type: "success", text: response.data.message || "회원가입이 완료되었습니다!" });
                setTimeout(() => navigate("/login"), 1500);
            }
        } catch (error) {
            console.error("회원가입 오류:", error);

            if (error.response?.data) {
                const { errors: apiErrors, message: apiMessage, field } = error.response.data;

                if (apiErrors) {
                    setErrors(apiErrors);
                    setMessage({ type: "error", text: "입력된 정보를 확인해주세요." });
                } else if (apiMessage && field === "passwordConfirm") {
                    setErrors({ passwordConfirm: apiMessage });
                    setMessage({ type: "error", text: apiMessage });
                } else {
                    setMessage({ type: "error", text: apiMessage || "회원가입 중 예상치 못한 오류가 발생했습니다." });
                }
            } else {
                setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, usernameCheckStatus, agreements, navigate]);

    // ✅ 주소 검색 함수 (useCallback으로 메모이제이션)
    const handleSearchAddress = useCallback(() => {
        if (!window.daum || !window.daum.Postcode) {
            alert("주소 검색 API가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        new window.daum.Postcode({
            oncomplete: function(data) {
                var addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                var extraAddr = '';

                if(data.userSelectedType === 'R'){
                    if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                        extraAddr += data.bname;
                    }
                    if(data.buildingName !== '' && data.apartment === 'Y'){
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    postalCode: data.zonecode,
                    address: addr + (extraAddr !== '' ? ` (${extraAddr})` : ''),
                    addressDetail: '',
                }));

                document.getElementById('addressDetail')?.focus();
            }
        }).open();
    }, []);


    // ✅ 중복확인 버튼 메모이제이션
    const checkUsernameButton = useMemo(() => (
        <button
            type="button"
            onClick={handleCheckUsername}
            disabled={isSubmitting || !formData.userName}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            중복확인
        </button>
    ), [handleCheckUsername, isSubmitting, formData.userName]);


    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h2>
                            <p className="text-gray-500">GUGU Market 회원이 되어보세요</p>
                        </div>

                        {isSubmitting && <Loading text="가입 처리 중..." />}

                        {message && (
                            <div className="mb-6">
                                <ErrorMessage
                                    message={message.text}
                                    type={message.type}
                                    onClose={() => setMessage(null)}
                                />
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 아이디 */}
                            <InputField
                                label="아이디"
                                name="userName"
                                placeholder="영문, 숫자 조합 5-20자"
                                rightContent={checkUsernameButton}
                                value={formData.userName} // ✅ props 전달
                                error={errors.userName} // ✅ props 전달
                                renderError={renderError} // ✅ props 전달
                                onChange={handleChange} // ✅ props 전달
                                isSubmitting={isSubmitting} // ✅ props 전달
                            />
                            {usernameCheckStatus.isChecked && (
                                <p className={`text-sm -mt-2 ${usernameCheckStatus.isDuplicate ? 'text-red-500' : 'text-green-600'}`}>
                                    {usernameCheckStatus.message}
                                </p>
                            )}

                            {/* 닉네임 */}
                            <InputField
                                label="닉네임"
                                name="nickname"
                                placeholder="거래 시 사용할 닉네임"
                                value={formData.nickname}
                                error={errors.nickname}
                                renderError={renderError}
                                onChange={handleChange}
                                isSubmitting={isSubmitting}
                            />

                            {/* 이메일 */}
                            <InputField
                                label="이메일"
                                name="email"
                                type="email"
                                placeholder="example@email.com"
                                value={formData.email}
                                error={errors.email}
                                renderError={renderError}
                                onChange={handleChange}
                                isSubmitting={isSubmitting}
                            />

                            {/* 전화번호 */}
                            <InputField
                                label="전화번호"
                                name="phone"
                                type="tel"
                                placeholder="010-0000-0000"
                                isRequired={false}
                                value={formData.phone}
                                error={errors.phone}
                                renderError={renderError}
                                onChange={handleChange}
                                isSubmitting={isSubmitting}
                            />

                            {/* 비밀번호 */}
                            <InputField
                                label="비밀번호"
                                name="password"
                                type="password"
                                placeholder="영문, 숫자, 특수문자 조합 8자 이상"
                                value={formData.password}
                                error={errors.password}
                                renderError={renderError}
                                onChange={handleChange}
                                isSubmitting={isSubmitting}
                            />

                            {/* 비밀번호 확인 */}
                            <InputField
                                label="비밀번호 확인"
                                name="passwordConfirm"
                                type="password"
                                placeholder="비밀번호를 다시 입력하세요"
                                value={formData.passwordConfirm}
                                error={errors.passwordConfirm}
                                renderError={renderError}
                                onChange={handleChange}
                                isSubmitting={isSubmitting}
                            />

                            {/* 주소 섹션 */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <InputField
                                        label="우편번호"
                                        name="postalCode"
                                        placeholder="우편번호"
                                        readOnly={true}
                                        isRequired={true}
                                        value={formData.postalCode}
                                        error={errors.postalCode}
                                        renderError={renderError}
                                        onChange={handleChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </div>
                                <div className="col-span-2 flex items-end mb-4">
                                    <button
                                        type="button"
                                        onClick={handleSearchAddress}
                                        disabled={isSubmitting}
                                        className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        주소 검색
                                    </button>
                                </div>
                            </div>

                            {/* 주소 */}
                            <InputField
                                label="주소"
                                name="address"
                                placeholder="기본 주소"
                                readOnly={true}
                                isRequired={true}
                                value={formData.address}
                                error={errors.address}
                                renderError={renderError}
                                onChange={handleChange}
                                isSubmitting={isSubmitting}
                            />

                            {/* 상세 주소 */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    id="addressDetail"
                                    name="addressDetail"
                                    value={formData.addressDetail}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition-colors ${
                                        errors.addressDetail ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                                    }`}
                                    placeholder="상세 주소"
                                    disabled={isSubmitting}
                                />
                                {/* 상세 주소는 InputField 컴포넌트 내부가 아니므로 직접 renderError 호출 */}
                                {renderError('addressDetail')}
                            </div>

                            {/* 약관 동의 섹션 */}
                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                <div className="flex items-center">
                                    <input
                                        id="agree-all"
                                        type="checkbox"
                                        checked={agreements.agreeTerms && agreements.agreePrivacy}
                                        onChange={handleAgreementChange}
                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        style={{ accentColor: '#6B4F4F' }}
                                    />
                                    <label htmlFor="agree-all" className="ml-2 block text-sm font-semibold text-gray-700">
                                        전체 동의
                                    </label>
                                </div>
                                <div className="flex items-center ml-4">
                                    <input
                                        id="agreeTerms"
                                        type="checkbox"
                                        checked={agreements.agreeTerms}
                                        onChange={handleAgreementChange}
                                        required
                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        style={{ accentColor: '#6B4F4F' }}
                                    />
                                    <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                                        이용약관 동의 <span className="text-red-500">(필수)</span>
                                    </label>
                                </div>
                                <div className="flex items-center ml-4">
                                    <input
                                        id="agreePrivacy"
                                        type="checkbox"
                                        checked={agreements.agreePrivacy}
                                        onChange={handleAgreementChange}
                                        required
                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        style={{ accentColor: '#6B4F4F' }}
                                    />
                                    <label htmlFor="agreePrivacy" className="ml-2 block text-sm text-gray-700">
                                        개인정보 수집 및 이용 동의 <span className="text-red-500">(필수)</span>
                                    </label>
                                </div>
                                {renderError('agreement')}
                            </div>

                            {/* 버튼 */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition-all duration-300"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    disabled={
                                        isSubmitting ||
                                        !usernameCheckStatus.isChecked ||
                                        usernameCheckStatus.isDuplicate ||
                                        !agreements.agreeTerms ||
                                        !agreements.agreePrivacy
                                    }
                                >
                                    {isSubmitting ? "가입 처리 중..." : "회원가입"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default SignupPage;