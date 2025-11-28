import { useState } from 'react';
import { shareProduct } from '../../utils/shareUtils';

const ShareModal = ({ isOpen, onClose, product }) => {
    // 복사 완료 메시지를 관리하는 상태
    const [copiedMessage, setCopiedMessage] = useState('');
    // 모달이 열려있지 않거나 (isOpen=false) 상품 정보가 없으면 null을 반환하여 렌더링 중단
    if (!isOpen || !product) return null;
    // --- 1. 공유 처리 핸들러 ---
    const handleShare = async (platform) => {
        try {
            if (platform === 'clipboard') {
                // 클립보드 복사 로직 실행
                const result = await shareProduct.clipboard(product);
                if (result.success) {
                    setCopiedMessage(result.message); // 복사 성공 메시지 설정
                    setTimeout(() => {
                        setCopiedMessage('');
                        onClose(); // 2초 후 메시지 초기화 및 모달 닫기
                    }, 2000);
                }
            } else if (platform === 'native') {
                // 웹 네이티브 공유 API 실행
                const result = await shareProduct.native(product);
                if (result.success) {
                    onClose(); // 공유 성공 시 모달 닫기
                }
            } else {
                // 페이스북, 카카오톡 등 기타 플랫폼 공유 유틸리티 함수 호출
                shareProduct[platform](product);
            }
        } catch (error) {
            console.error('공유 중 오류 발생:', error);
            alert('공유 중 오류가 발생했습니다.'); // 오류 발생 시 사용자에게 알림
        }
    };
    // --- 2. 공유 옵션 목록 정의 ---
    const shareOptions = [
        {
            id: 'facebook',
            name: '페이스북',
            icon: 'bi-facebook',
            color: 'bg-blue-600 hover:bg-blue-700',
            available: true,
        },
        {
            id: 'twitter',
            name: '트위터',
            icon: 'bi-twitter-x',
            color: 'bg-black hover:bg-gray-800',
            available: true,
        },
        {
            id: 'kakao',
            name: '카카오톡',
            icon: 'bi-chat-fill',
            color: 'bg-yellow-400 hover:bg-yellow-500',
            available: typeof window !== 'undefined' && window.Kakao,
        },
        {
            id: 'instagram',
            name: '인스타그램',
            icon: 'bi-instagram',
            color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
            available: true,
        },
        {
            id: 'line',
            name: '라인',
            icon: 'bi-line',
            color: 'bg-green-500 hover:bg-green-600',
            available: true,
        },
        {
            id: 'clipboard',
            name: '링크 복사',
            icon: 'bi-link-45deg',
            color: 'bg-gray-600 hover:bg-gray-700',
            available: true,
        },
    ];

    // 네이티브 공유 사용 가능 여부 확인
    // navigator 객체와 navigator.share 메서드의 존재 여부를 통해 모바일 환경의 네이티브 공유 기능 사용 가능 여부 판단
    const isNativeShareAvailable = typeof navigator !== 'undefined' && navigator.share;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">상품 공유하기</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <i className="bi bi-x-lg text-2xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* 상품 정보 미리보기 */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg flex gap-4">
                        <img
                            src={product.mainImage || '/placeholder.png'}
                            alt={product.title}
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">
                                {product.title}
                            </h4>
                            <p className="text-primary font-bold">
                                {product.price?.toLocaleString()}원
                            </p>
                        </div>
                    </div>

                    {/* 네이티브 공유 버튼 (모바일) */}
                    {isNativeShareAvailable && ( // 네이티브 공유가 가능할 때만 버튼 표시
                        <button
                            onClick={() => handleShare('native')}
                            className="w-full mb-4 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                        >
                            <i className="bi bi-share text-xl"></i>
                            공유하기
                        </button>
                    )}

                    {/* 공유 옵션 그리드 */}
                    <div className="grid grid-cols-3 gap-4">
                        {shareOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleShare(option.id)}
                                disabled={!option.available}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                                    option.available
                                        ? `${option.color} text-white`
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <i className={`${option.icon} text-2xl`}></i>
                                <span className="text-xs font-medium">{option.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* 복사 완료 메시지 */}
                    {copiedMessage && ( // copiedMessage 상태에 값이 있을 때만 메시지 표시
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                            <i className="bi bi-check-circle-fill text-green-600 mr-2"></i>
                            <span className="text-green-700 font-medium">{copiedMessage}</span>
                        </div>
                    )}

                    {/* 안내 메시지 */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex gap-2">
                            <i className="bi bi-info-circle text-blue-600"></i>
                            <div className="flex-1">
                                <p className="text-sm text-blue-800">
                                    <strong>인스타그램 공유 안내:</strong> 인스타그램은 외부 링크 직접 공유를 지원하지 않습니다.
                                    링크를 복사한 후 스토리나 프로필 바이오에 붙여넣어 주세요.
                                </p>
                                <div className="mt-2 text-xs text-blue-600">
                                    <a
                                        href="https://developers.facebook.com/tools/debug/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-blue-800"
                                    >
                                        페이스북 공유 테스트
                                    </a>
                                    {' · '}
                                    <a
                                        href="https://cards-dev.twitter.com/validator"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-blue-800"
                                    >
                                        트위터 카드 검증
                                    </a>
                                    {' · '}
                                    <a
                                        href="https://developers.kakao.com/tool/debugger/sharing"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-blue-800"
                                    >
                                        카카오 디버거
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;