import React, { useEffect, useRef } from "react";

const CameraStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }, // 전면 카메라 우선
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("카메라 접근 실패:", err);
        alert("카메라 접근 권한을 허용해야 합니다!");
      }
    };

    startCamera();
  }, []);

  return (
    <div className="camera-stream">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "10px",
          backgroundColor: "#000",
        }}
      />
    </div>
  );
};

export default CameraStream;
