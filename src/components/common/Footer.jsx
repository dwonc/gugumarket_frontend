import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">GUGU Market</h3>
            <p className="text-light">안전하고 편리한 중고거래 플랫폼</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">바로가기</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/qna"
                  className="text-light hover:text-white transition-colors"
                >
                  고객센터
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light hover:text-white transition-colors"
                >
                  이용약관
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light hover:text-white transition-colors"
                >
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">고객센터</h4>
            <p className="text-light">평일 09:00 - 18:00</p>
            <p className="text-light">주말 및 공휴일 휴무</p>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-light text-sm">
            &copy; 2025 GUGU Market. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
