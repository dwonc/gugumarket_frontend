 import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">GUGU Market</h3>
            <p className="text-sm text-gray-300">
              안전하고 편리한 중고거래 플랫폼
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/qna"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Q&A
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">고객센터</h3>
            <p className="text-sm text-gray-300">
              평일 09:00 - 18:00
              <br />
              주말 및 공휴일 휴무
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-600 pt-6 text-center text-sm text-gray-300">
          <p>&copy; 2025 GUGU Market. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
