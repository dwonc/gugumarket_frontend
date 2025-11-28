import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/userApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loading from "../../components/common/Loading";

// *******************************************************************
// InputField 컴포넌트 (로직 유지)
// *******************************************************************
const InputField = memo(({
                             label,
                             name,
                             type = "text",
                             placeholder,
                             isRequired = true,
                             rightContent = null, // 우측에 추가될 컴포넌트 (예: 중복확인 버튼)
                             readOnly = false,
                             value,
                             error,
                             renderError,
                             onChange,
                             isSubmitting
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
                value={value}
                onChange={onChange}
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


const SignupPage = () => {
    const navigate = useNavigate();
    // 폼의 모든 입력 값을 관리하는 상태
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
    // 필드별 유효성 검사 오류 메시지를 저장하는 상태
    const [errors, setErrors] = useState({});
    // 폼 제출 중 상태
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 전역적인 성공/경고/에러 메시지 상태
    const [message, setMessage] = useState(null);
    // 아이디 중복 확인 결과를 저장하는 상태
    const [usernameCheckStatus, setUsernameCheckStatus] = useState({
        isChecked: false,
        isDuplicate: false,
        message: "",
    });
    // 약관 동의 상태
    const [agreements, setAgreements] = useState({
        agreeTerms: false,
        agreePrivacy: false,
    });

    // Daum Postcode API 스크립트 로드 (로직 유지)
    useEffect(() => {
        const script = document.createElement("script");
        // 외부 주소 검색 API 스크립트 로드
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        document.head.appendChild(script);
    }, []);

    // ✅ 입력 변경 핸들러 (최적화 로직 유지)
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "userName") {
            setUsernameCheckStatus({
                isChecked: false,
                isDuplicate: false,
                message: "",
            });
        }

        setErrors(prev => {
            if (prev[name]) {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            }
            return prev;
        });
    }, []);

    // ✅ 약관 동의 핸들러 (로직 유지)
    const handleAgreementChange = useCallback((e) => {
        const { id, checked } = e.target;
        if (id === 'agree-all') {
            // '전체 동의' 체크 시 모든 필수 약관 상태를 일괄 변경
            setAgreements({ agreeTerms: checked, agreePrivacy: checked });
        } else {
            setAgreements(prev => ({ ...prev, [id]: checked }));
        }
    }, []);

    // ✅ 에러 메시지 렌더링 함수 (로직 유지)
    const renderError = useCallback((fieldName) => {
        // errors 객체에 해당 필드의 에러 메시지가 있을 경우 JSX로 반환
        return errors[fieldName] ? (
            <p className="mt-1 text-sm text-red-500">{errors[fieldName]}</p>
        ) : null;
    }, [errors]); //errors가 나오면 함수 재생성

// 아이디 중복 체크 핸들러 - 수정된 버전
    const handleCheckUsername = useCallback(async () => {
        if (!formData.userName) {
            setErrors(prev => ({ ...prev, userName: "아이디를 입력해주세요." }));
            return;
        }
        // ✅ 공백 제거를 위해 trim() 적용
        if (formData.userName.trim().length < 5 || formData.userName.trim().length > 20) {
            setErrors(prev => ({ ...prev, userName: "아이디는 5자 이상 20자 이하로 입력해야 합니다." }));
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setMessage(null);

        try {
            // API 호출 시도 시 trim() 적용
            const response = await userApi.checkUsername(formData.userName.trim());
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
    }, [formData.userName]); // formData.userName이 변경될 때만 함수 재생성

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);

        const { password, passwordConfirm } = formData;

        const newErrors = {};
        // ✅ 비밀번호 일치 확인 (프론트엔드 유효성) - trim() 적용
        if (password.trim() !== passwordConfirm.trim()) {
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

        // ✅ 수정 7: dataToSend를 만들기 전에, 모든 문자열 필드의 앞뒤 공백을 제거하여 서버 측 오류를 방지
        const trimmedDataToSend = Object.keys(formData).reduce((acc, key) => {
            acc[key] = typeof formData[key] === 'string'
                ? formData[key].trim()
                : formData[key];
            return acc;
        }, {});

        // 🚨 수정: passwordConfirm을 제거하지 않고 그대로 보냄. (dataToSend = trimmedDataToSend;)
        // UserDto는 passwordConfirm 필드를 요구합니다 (@NotEmpty).
        const dataToSend = trimmedDataToSend;

        try {
            // 서버에 passwordConfirm을 포함한 요청을 보냄 (DTO 바인딩 성공 유도)
            const response = await userApi.signup(dataToSend);

            if (response.data.success) {
                setMessage({ type: "success", text: response.data.message || "회원가입이 완료되었습니다!" });
                setTimeout(() => navigate("/login"), 1500);
            }
        } catch (error) {
            console.error("회원가입 오류:", error);

            // 🚨 서버 측 오류 응답 처리 강화
            if (error.response?.data) {
                const responseData = error.response.data;
                // UserController.java는 비밀번호 불일치 시 {field: "passwordConfirm", message: "..."} 반환

                if (responseData.errors) {
                    // Spring Validation 오류 처리 (Field-level errors)
                    const errorsMap = responseData.errors.map(err => [err.field, err.defaultMessage])
                        .reduce((acc, [field, msg]) => ({ ...acc, [field]: msg }), {});

                    setErrors(errorsMap);
                    setMessage({ type: "error", text: "입력된 정보를 확인해주세요." });

                } else if (responseData.field || responseData.message) {
                    // UserController.java에서 직접 반환하는 오류 처리
                    const field = responseData.field || 'general';
                    setErrors(prev => ({ ...prev, [field]: responseData.message }));
                    setMessage({ type: "error", text: responseData.message });
                } else {
                    setMessage({ type: "error", text: responseData.message || "회원가입 중 예상치 못한 오류가 발생했습니다." });
                }
            } else {
                setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, usernameCheckStatus, agreements, navigate]); // ✅ formData 의존성 유지 (useRef가 제거되었으므로)

    // ✅ 주소 검색 함수 (로직 유지)
    const handleSearchAddress = useCallback(() => {
        if (!window.daum || !window.daum.Postcode) {
            alert("주소 검색 API가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        new window.daum.Postcode({
            oncomplete: function(data) {
                // 주소 유형에 따라 기본 주소 추출
                var addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                var extraAddr = '';
                // 도로명 주소일 경우 참고 항목(extraAddr) 구성
                if(data.userSelectedType === 'R'){
                    if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                        extraAddr += data.bname;
                    }
                    if(data.buildingName !== '' && data.apartment === 'Y'){
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                }
                // formData 상태 업데이트
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
                                value={formData.userName}
                                error={errors.userName}
                                renderError={renderError}
                                onChange={handleChange}
                                isSubmitting={isSubmitting}
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