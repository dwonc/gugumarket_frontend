import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { userApi } from "../../api/userApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

const defaultProfileImage = 'https://via.placeholder.com/200/6B4F4F/FFFFFF?text=Profile';

// ✅ InputField를 컴포넌트 외부로 분리 + React.memo
const InputField = React.memo(({
                                   label,
                                   name,
                                   type = "text",
                                   placeholder,
                                   isRequired = false,
                                   readOnly = false,
                                   helperText = null,
                                   value,
                                   onChange,
                                   disabled
                               }) => (
    <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
            required={isRequired}
            disabled={disabled}
        />
        {helperText && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
));

const Edit = () => {
    const navigate = useNavigate();
    const { isAuthenticated,logout, updateUser } = useAuthStore();

    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        phone: '',
        postalCode: '',
        address: '',
        addressDetail: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [initialUserData, setInitialUserData] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [deleteProfileImage, setDeleteProfileImage] = useState(false);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const profileImageInputRef = useRef(null);

    useEffect(() => {
        const fetchEditData = async () => {
            setLoading(true);
            try {
                const response = await userApi.getEditFormData();
                if (response.data.success) {
                    const userData = response.data.user;

                    setFormData({
                        nickname: userData.nickname || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        postalCode: userData.postalCode || '',
                        address: userData.address || '',
                        addressDetail: userData.addressDetail || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                    });
                    setInitialUserData(userData);
                    setProfileImageUrl(userData.profileImage || defaultProfileImage);
                }
            } catch (err) {
                console.error("회원정보 로드 오류:", err);
                setError("회원정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchEditData();
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // ✅ handleChange를 useCallback으로 메모이제이션
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // ✅ handleSearchAddress를 useCallback으로 메모이제이션
    const handleSearchAddress = useCallback(() => {
        if (!window.daum || !window.daum.Postcode) {
            alert("주소 검색 API가 로드되지 않았습니다.");
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

    // ✅ resetProfileImage를 useCallback으로 메모이제이션
    const resetProfileImage = useCallback(() => {
        setProfileImageUrl(defaultProfileImage);
        setProfileImageFile(null);
        setDeleteProfileImage(true);

        if (profileImageInputRef.current) {
            profileImageInputRef.current.value = '';
        }

        alert('프로필 이미지가 기본 이미지로 변경됩니다.\n저장 버튼을 눌러야 적용됩니다.');
    }, []);

    // ✅ handleProfileImageChange를 useCallback으로 메모이제이션
    const handleProfileImageChange = useCallback((event) => {
        const file = event.target.files[0];

        if (!file) {
            setProfileImageFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("파일 크기는 5MB 이하여야 합니다.");
            event.target.value = '';
            setProfileImageFile(null);
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert("JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.");
            event.target.value = '';
            setProfileImageFile(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            setProfileImageUrl(e.target.result);
            setProfileImageFile(file);
            setDeleteProfileImage(false);
        };
        reader.readAsDataURL(file);
    }, []);

    // ✅ handleSubmit을 useCallback으로 메모이제이션
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const { currentPassword, newPassword, confirmPassword } = formData;
        const passwordChangeRequested = currentPassword || newPassword || confirmPassword;

        if (passwordChangeRequested) {
            if (!currentPassword) {
                return setError("비밀번호 변경을 위해 현재 비밀번호를 입력해주세요.");
            }
            if (newPassword && newPassword !== confirmPassword) {
                return setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            }
            if (newPassword && newPassword.length < 8) {
                return setError("새 비밀번호는 8자 이상이어야 합니다.");
            }
        }

        setIsSubmitting(true);

        const dataToSend = new FormData();
        dataToSend.append('nickname', formData.nickname);
        dataToSend.append('email', formData.email);
        dataToSend.append('phone', formData.phone || '');
        dataToSend.append('postalCode', formData.postalCode);
        dataToSend.append('address', formData.address);
        dataToSend.append('addressDetail', formData.addressDetail);
        dataToSend.append('currentPassword', currentPassword);
        dataToSend.append('newPassword', newPassword);
        dataToSend.append('confirmPassword', confirmPassword);

        if (profileImageFile) {
            dataToSend.append('profileImage', profileImageFile);
        } else if (deleteProfileImage) {
            dataToSend.append('deleteProfileImage', 'true');
        }

        try {
            const response = await userApi.updateProfile(dataToSend);

            if (response.data.success) {
                setSuccessMessage(response.data.message || "회원정보가 성공적으로 수정되었습니다.");

                const updatedUser = response.data.user;

                console.log("📸 서버 응답:", response.data);
                console.log("📸 업데이트된 사용자 정보:", updatedUser); // 디버깅용


                // ✅ Zustand store 업데이트 (타임스탬프 포함)
                updateUser(updatedUser);

                // 로컬 상태만 타임스탬프 포함 (Edit 페이지 미리보기용)
                if (updatedUser.profileImage) {
                    setProfileImageUrl(`${updatedUser.profileImage}?t=${Date.now()}`);
                }

                console.log("📸 프로필 이미지 URL:", updatedUser.profileImage);

                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));

                setTimeout(() => navigate('/mypage',{state : {refresh: true}}), 1500);

            } else {
                setError(response.data.message || "회원정보 수정에 실패했습니다.");
            }
        } catch (err) {
            console.error("수정 오류:", err);
            const errMsg = err.response?.data?.message || "서버 오류가 발생했습니다.";
            setError(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, profileImageFile, deleteProfileImage, updateUser, navigate]);

    // ✅ handleUserDelete를 useCallback으로 메모이제이션
    const handleUserDelete = useCallback(async () => {
        setIsSubmitting(true);
        try {
            await userApi.deleteUser();
            alert('회원탈퇴가 완료되었습니다.');
            logout();
            navigate('/');
        } catch (err) {
            console.error("회원탈퇴 오류:", err);
            alert('회원탈퇴에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    }, [logout, navigate]);

    if (loading || !initialUserData) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen py-12 flex justify-center items-center">
                    <Loading size="lg" text="회원 정보를 불러오는 중입니다..." />
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">회원정보 수정</h1>
                    <p className="text-white/80">개인정보를 안전하게 관리하세요</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {successMessage && (
                    <div className="mb-6">
                        <ErrorMessage message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
                    </div>
                )}
                {error && (
                    <div className="mb-6">
                        <ErrorMessage message={error} type="error" onClose={() => setError(null)} />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 프로필 이미지 섹션 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <i className="bi bi-person-circle text-primary"></i>
                            프로필
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg bg-gray-100">
                                    <img
                                        src={profileImageUrl || defaultProfileImage}
                                        alt="프로필 이미지"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* ✅ 카메라 아이콘 버튼 - 수정된 부분 */}
                                <button
                                    type="button"
                                    onClick={() => profileImageInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-white border-2 border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-all shadow-md"
                                    aria-label="프로필 이미지 변경"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        fill="currentColor"
                                        className="bi bi-camera"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z"/>
                                        <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
                                    </svg>
                                </button>

                                <input
                                    type="file"
                                    ref={profileImageInputRef}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleProfileImageChange}
                                />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">프로필 사진을 변경할 수 있습니다</p>
                                <p className="text-gray-400 text-xs mb-1">권장: 500x500px 이상, 최대 5MB</p>
                                <p className="text-gray-400 text-xs">지원 형식: JPG, PNG, GIF</p>
                                <button
                                    type="button"
                                    onClick={resetProfileImage}
                                    className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                    <i className="bi bi-x-circle"></i>
                                    기본 이미지로 변경
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* 기본 정보 섹션 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <i className="bi bi-info-circle text-primary"></i>
                            기본 정보
                        </h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                아이디
                            </label>
                            <input
                                type="text"
                                value={initialUserData.userName}
                                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                disabled
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                <i className="bi bi-lock"></i> 아이디는 변경할 수 없습니다
                            </p>
                        </div>

                        <InputField
                            label="닉네임"
                            name="nickname"
                            placeholder="닉네임을 입력하세요"
                            isRequired={true}
                            value={formData.nickname}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        <InputField
                            label="이메일"
                            name="email"
                            type="email"
                            placeholder="example@email.com"
                            isRequired={true}
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        <InputField
                            label="전화번호"
                            name="phone"
                            type="tel"
                            placeholder="010-0000-0000"
                            isRequired={false}
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />

                        {/* 주소 섹션 */}
                        <div className="mb-6">
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
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={handleSearchAddress}
                                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                    disabled={isSubmitting}
                                >
                                    주소 검색
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
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
                                disabled={isSubmitting}
                            />
                            <input
                                type="text"
                                id="addressDetail"
                                name="addressDetail"
                                value={formData.addressDetail}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
                                placeholder="상세 주소"
                                disabled={isSubmitting}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                <i className="bi bi-geo-alt"></i> 주로 거래하는 지역을 입력하세요
                            </p>
                        </div>
                    </div>

                    {/* 비밀번호 변경 섹션 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <i className="bi bi-shield-lock text-primary"></i>
                            비밀번호 변경
                        </h2>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                            <div className="flex">
                                <i className="bi bi-info-circle-fill text-blue-500 text-xl flex-shrink-0 mr-3"></i>
                                <p className="text-sm text-blue-800">
                                    비밀번호를 변경하지 않으려면 아래 입력란을 비워두세요
                                </p>
                            </div>
                        </div>

                        <InputField
                            label="현재 비밀번호"
                            name="currentPassword"
                            type="password"
                            placeholder="현재 비밀번호를 입력하세요"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        <InputField
                            label="새 비밀번호"
                            name="newPassword"
                            type="password"
                            placeholder="새 비밀번호를 입력하세요"
                            helperText="영문, 숫자, 특수문자 포함 8자 이상"
                            value={formData.newPassword}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        <InputField
                            label="새 비밀번호 확인"
                            name="confirmPassword"
                            type="password"
                            placeholder="새 비밀번호를 다시 입력하세요"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/mypage')}
                            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-4 rounded-lg transition-all"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={isSubmitting}
                        >
                            <i className="bi bi-check-circle mr-2"></i>
                            {isSubmitting ? "저장 중..." : "변경사항 저장"}
                        </button>
                    </div>
                </form>

                {/* 회원탈퇴 */}
                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                        회원탈퇴
                    </button>
                </div>
            </div>

            <Footer />

            {/* 회원탈퇴 확인 모달 */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="회원탈퇴 확인"
                size="sm"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
                        <Button variant="danger" onClick={handleUserDelete} disabled={isSubmitting}>
                            {isSubmitting ? "처리 중..." : "예, 탈퇴합니다"}
                        </Button>
                    </div>
                }
            >
                <p className="text-gray-700 mb-4">정말로 탈퇴하시겠습니까?</p>
                <p className="text-red-600 font-semibold">탈퇴 시 모든 데이터(거래 내역, 찜 목록 등)가 영구적으로 삭제되며 복구할 수 없습니다.</p>
                <p className="text-red-600 font-semibold mt-2">이 결정은 되돌릴 수 없습니다.</p>
            </Modal>
        </>
    );
};

export default Edit;