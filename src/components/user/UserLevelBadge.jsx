import React from "react";

const UserLevelBadge = ({ levelInfo, size = "md", showProgress = false }) => {
  if (!levelInfo) {
    return null;
  }

  const levelColors = {
    EGG: "bg-gray-100 text-gray-700 border-gray-300",
    BABY_BIRD: "bg-green-100 text-green-700 border-green-300",
    TEEN_BIRD: "bg-blue-100 text-blue-700 border-blue-300",
    ADULT_BIRD: "bg-purple-100 text-purple-700 border-purple-300",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const progressPercent =
    levelInfo.level === "ADULT_BIRD"
      ? 100
      : ((levelInfo.transactionCount - levelInfo.minTransactions) /
          (levelInfo.maxTransactions - levelInfo.minTransactions + 1)) *
        100;

  return (
    <div className="inline-flex flex-col">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border-2 font-semibold
          ${levelColors[levelInfo.level]} ${sizeStyles[size]}`}
      >
        <span className="text-lg">{levelInfo.emoji}</span>
        <span>{levelInfo.levelName}</span>
      </div>

      {showProgress && (
        <div className="mt-2 w-full">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>거래 {levelInfo.transactionCount}회</span>
            {levelInfo.toNextLevel > 0 && (
              <span className="text-primary font-medium">
                +{levelInfo.toNextLevel}회 더 필요
              </span>
            )}
            {levelInfo.toNextLevel === 0 && (
              <span className="text-purple-600 font-bold">🎉 최고 등급!</span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLevelBadge;
