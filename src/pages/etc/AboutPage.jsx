import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const AboutPage = () => {
    return (
        <>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-6">GUGU Market 소개</h1>

                <p className="text-gray-700 leading-7 mb-4">
                    GUGU Market은 사람과 사람을 연결하는 안전한 중고거래 플랫폼입니다.
                    단순히 물건을 사고파는 공간을 넘어서, 누구나 안심하고 이용할 수 있는
                    신뢰 기반의 거래 환경을 만들어가는 것을 목표로 하고 있습니다.
                </p>

                <p className="text-gray-700 leading-7 mb-8">
                    왜 GUGU Market이어야 할까요?
                    GUGU Market은 복잡한 절차와 불편함을 줄이고, 누구나 쉽게 사용할 수 있도록
                    직관적인 UI와 안정적인 거래 시스템을 제공합니다.
                    필요한 기능만 담아 깔끔하게 구성된 화면에서 편리한 중고거래를 경험하실 수 있습니다.
                </p>

                <h2 className="text-2xl font-bold mb-4">안전한 거래</h2>
                <p className="text-gray-700 leading-7">
                    GUGU Market은 판매자와 구매자 모두가 안심할 수 있도록 설계되었습니다.
                    실시간 거래 상태 확인, 입금 확인 절차, 거래 완료 보장 시스템 등을 통해
                    거래 과정에서 발생할 수 있는 불확실성을 최소화했습니다.
                    모든 거래 정보는 시스템 내부에 안전하게 저장되어 언제든 다시 확인할 수 있습니다.
                </p>
            </div>

            <Footer />
        </>
    );
};

export default AboutPage;
