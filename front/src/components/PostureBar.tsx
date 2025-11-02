import React from "react";

interface PostureBarProps {
  accuracy: number;
  status: string;
}

const PostureBar: React.FC<PostureBarProps> = ({ accuracy, status }) => {
  // 상태(status)와 정확도에 따라 바 색상 결정
  const getBarColor = () => {
    if (accuracy < 70) {
      return "#F44336"; // 빨간색 (정확도 70% 미만)
    }
    switch (status) {
      case "Forward Head":
        return "#F44336"; // 빨간색
      case "Good Posture":
        return "#4CAF50"; // 초록색
      case "Face Not Detected":
        return "#FFC107"; // 노란색
      default:
        return "#9E9E9E"; // 회색 (Not Calibrated 등)
    }
  };

  return (
    <div className="posture-bar-wrapper">
      <div className="posture-bar-label">
        자세 정확도: {accuracy}%
      </div>
      <div className="posture-bar-bg">
        <div
          className="posture-bar-fill"
          style={{
            width: `${accuracy}%`,
            backgroundColor: getBarColor(),
          }}
        ></div>
      </div>
    </div>
  );
};

export default PostureBar;
