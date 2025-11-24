import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const TermsPage = () => {
    return (
        <>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-6">이용약관</h1>

                <div className="space-y-6 text-gray-700 leading-7">
                    {/* 1조 목적 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">제1조(목적)</h2>
                        <p>
                            본 약관은 GUGU Market(이하 “서비스”)의 이용과 관련하여 회사와
                            이용자 간의 권리, 의무 및 책임사항을 규정하는 것을 목적으로 합니다.
                        </p>
                    </section>

                    {/* 2조 계정 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">제2조(계정 및 회원 정보)</h2>
                        <p>
                            ① 이용자는 서비스 이용을 위해 정확한 정보를 제공해야 하며, 타인의
                            정보를 도용할 수 없습니다.
                            <br />
                            ② 회원 정보가 변경된 경우 지체 없이 수정해야 하며, 이를 게을리하여
                            발생하는 불이익은 이용자 본인의 책임입니다.
                        </p>
                    </section>

                    {/* 3조 금지행위 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">제3조(금지 행위)</h2>
                        <p className="mb-2">
                            이용자는 다음 각 호의 행위를 하여서는 안 됩니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>허위·과장된 상품 정보 또는 존재하지 않는 매물을 등록하는 행위</li>
                            <li>사기, 갈취, 금전적인 피해를 줄 의도로 거래를 시도하는 행위</li>
                            <li>불법·위조·도난 물품 등 관련 법령을 위반하는 상품을 거래하는 행위</li>
                            <li>욕설, 비방, 혐오 표현 등 타인에게 정신적 피해를 주는 행위</li>
                            <li>서비스의 서버·네트워크에 부하를 주거나 해킹을 시도하는 행위</li>
                        </ul>
                    </section>

                    {/* 4조 거래 안전 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">제4조(거래 및 안전)</h2>
                        <p>
                            ① 서비스는 이용자 간 안전한 거래를 지원하기 위해 거래 상태 확인,
                            입금 확인 기능 등을 제공하지만, 개별 거래의 당사자는 판매자와
                            구매자입니다.
                            <br />
                            ② 거래 전 상대방의 프로필, 거래 내역 등을 확인하는 등 이용자 스스로
                            주의를 기울여야 하며, 부주의로 인한 손해는 회사가 책임지지 않습니다.
                        </p>
                    </section>

                    {/* 5조 서비스 변경 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">제5조(서비스 제공 및 변경)</h2>
                        <p>
                            ① 회사는 24시간 안정적인 서비스 제공을 위해 노력합니다. 다만,
                            시스템 점검, 천재지변, 기타 불가피한 사유가 있는 경우 서비스의 일부
                            또는 전체가 일시 중단될 수 있습니다.
                            <br />
                            ② 서비스 내용, 운영 정책, 화면 구성 등은 회사의 필요에 따라 변경될 수
                            있으며, 중요한 변경 사항은 사전에 공지합니다.
                        </p>
                    </section>

                    {/* 6조 게시물 / 지식재산권 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">
                            제6조(게시물 및 지식재산권)
                        </h2>
                        <p className="mb-2">
                            ① 회원이 서비스에 등록한 게시물(글, 사진, 댓글 등)의 저작권은 해당
                            회원에게 귀속됩니다. 다만, 회사는 다음 목적 범위 내에서 게시물을
                            사용할 수 있습니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li>서비스 운영 및 개선을 위한 노출, 복제, 저장</li>
                            <li>서비스 홍보를 위한 비상업적 사용 (예: 서비스 소개 화면)</li>
                        </ul>
                        <p>
                            ② 법령 또는 약관을 위반하거나, 공공질서 및 미풍양속을 해치는
                            게시물은 사전 통보 없이 수정·삭제될 수 있습니다.
                        </p>
                    </section>

                    {/* 7조 개인정보 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">제7조(개인정보 보호)</h2>
                        <p>
                            ① 회사는 관련 법령 및 개인정보처리방침에 따라 회원의 개인정보를
                            보호하기 위해 노력합니다.
                            <br />
                            ② 개인정보의 수집·이용 목적, 보관 기간, 제3자 제공 여부 등 구체적인
                            내용은 별도의 개인정보처리방침에서 안내합니다.
                        </p>
                    </section>

                    {/* 8조 이용제한 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">제8조(이용제한 및 탈퇴)</h2>
                        <p className="mb-2">
                            회사는 다음 각 호에 해당하는 경우 사전 고지 없이 서비스 이용을 제한하거나
                            계정을 영구 정지할 수 있습니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li>반복적인 사기·분쟁 신고가 접수되는 경우</li>
                            <li>법령 또는 본 약관을 중대하게 위반한 경우</li>
                            <li>타인의 권리(저작권, 초상권 등)를 침해한 경우</li>
                        </ul>
                        <p>
                            회원은 언제든지 서비스 내 메뉴를 통해 탈퇴를 요청할 수 있으며,
                            탈퇴 후에도 관련 법령에 따라 일정 기간 정보가 보관될 수 있습니다.
                        </p>
                    </section>

                    {/* 9조 책임제한 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">제9조(책임의 제한)</h2>
                        <p>
                            회사는 다음 각 호에 해당하는 손해에 대해 책임을 지지 않습니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-1 mt-1">
                            <li>회원 간 직거래로 인해 발생한 분쟁, 손해, 사기 행위</li>
                            <li>
                                회원의 부주의 또는 약관 위반으로 인해 발생한 계정 도용, 정보
                                유출
                            </li>
                            <li>
                                천재지변, 정전, 통신 장애 등 회사의 합리적인 통제를 벗어난 사유로
                                인한 서비스 중단
                            </li>
                        </ul>
                    </section>

                    {/* 10조 분쟁해결 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">제10조(분쟁의 해결)</h2>
                        <p>
                            ① 서비스 이용과 관련하여 회사와 회원 간 분쟁이 발생한 경우, 당사자는
                            원만한 해결을 위해 성실히 협의합니다.
                            <br />
                            ② 협의로 해결되지 않을 경우, 관련 법령이 정한 절차에 따라 관할
                            법원의 판결을 따릅니다.
                        </p>
                    </section>

                    {/* 부칙 */}
                    <section>
                        <h2 className="text-xl font-bold mb-3">부칙</h2>
                        <p className="text-sm text-gray-600">
                            이 약관은 2025년 1월 1일부터 시행됩니다. 서비스 정책 변화나 법령 개정에
                            따라 약관이 수정될 수 있으며, 변경 시 서비스 내 공지사항을 통해
                            안내드립니다.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default TermsPage;
