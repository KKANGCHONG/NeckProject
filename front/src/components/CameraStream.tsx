import React from "react";

const CameraStream: React.FC = () => {
  // Flask 백엔드에서 스트리밍 받을 경우: src="http://localhost:8000/stream"
  // 지금은 테스트용으로 회색 박스로 대체
  return (
    <div className="camera-stream">
      <img
        src="http://localhost:8000/stream"
        alt="Camera Stream"
        className="camera-feed"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://via.placeholder.com/640x360?text=Camera+Stream";
        }}
      />
    </div>
  );
};

export default CameraStream;
