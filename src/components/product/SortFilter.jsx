import { useState } from "react";

const SortFilter = ({ currentSort, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { field: "createdDate", direction: "desc", label: "최신순", icon: "clock" },
    {
      field: "createdDate",
      direction: "asc",
      label: "오래된순",
      icon: "clock-history",
    },
    {
      field: "price",
      direction: "asc",
      label: "낮은가격순",
      icon: "arrow-down",
    },
    {
      field: "price",
      direction: "desc",
      label: "높은가격순",
      icon: "arrow-up",
    },
  ];

  const getCurrentLabel = () => {
    const current = sortOptions.find(
      (option) =>
        option.field === currentSort[0] && option.direction === currentSort[1]
    );
    return current ? current.label : "정렬";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 bg-white text-primary border-2 border-accent hover:bg-primary hover:text-white"
      >
        <i className="bi bi-sort-down"></i>
        {getCurrentLabel()}
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
          <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-20 w-48">
            <div className="p-2">
              {sortOptions.map((option) => (
                <button
                  key={`${option.field}-${option.direction}`}
                  onClick={() => {
                    onSortChange(option.field, option.direction);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-2 ${
                    currentSort[0] === option.field &&
                    currentSort[1] === option.direction
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <i className={`bi bi-${option.icon}`}></i>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SortFilter;
