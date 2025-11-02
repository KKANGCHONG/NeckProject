import React from "react";

const BASE_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:8000";
    
const CameraStream: React.FC = () => {
  return (
    <div className="camera-stream">
      <img
        src={`${import.meta.env.VITE_API_BASE_URL}/stream`}
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
