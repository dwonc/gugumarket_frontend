import { useState } from "react";

// 🔥 서울시 25개 구 고정 목록
const SEOUL_DISTRICTS = [
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "광진구",
  "구로구",
  "금천구",
  "노원구",
  "도봉구",
  "동대문구",
  "동작구",
  "마포구",
  "서대문구",
  "서초구",
  "성동구",
  "성북구",
  "송파구",
  "양천구",
  "영등포구",
  "용산구",
  "은평구",
  "종로구",
  "중구",
  "중랑구",
];

const DistrictFilter = ({ selectedDistrict, onDistrictChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
          selectedDistrict
            ? "bg-primary text-white shadow-md"
            : "bg-white text-primary border-2 border-accent hover:bg-primary hover:text-white"
        }`}
      >
        <i className="bi bi-geo-alt"></i>
        {selectedDistrict || "전체 지역"}
        <i
          className={`bi bi-chevron-${
            isOpen ? "up" : "down"
          } text-sm transition-transform`}
        ></i>
      </button>

      {isOpen && (
        <>
          {/* 배경 클릭 시 닫기 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* 드롭다운 메뉴 */}
          <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-20 w-64 max-h-80 overflow-y-auto">
            <div className="p-2">
              {/* 전체 지역 */}
              <button
                onClick={() => {
                  onDistrictChange(null);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  !selectedDistrict
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <i className="bi bi-globe mr-2"></i>
                전체 지역
              </button>

              {/* 구분선 */}
              <div className="my-2 border-t border-gray-200"></div>

              {/* 🔥 서울시 25개 구 목록 */}
              {SEOUL_DISTRICTS.map((district) => (
                <button
                  key={district}
                  onClick={() => {
                    onDistrictChange(district);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedDistrict === district
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <i className="bi bi-geo-alt-fill mr-2"></i>
                  {district}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DistrictFilter;
