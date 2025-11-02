import React, { useState } from "react";
import "../styles/layout.css";
import CameraStream from "../components/CameraStream";
import PostureBar from "../components/PostureBar";
import CalibrateButton from "../components/CalibrateButton";
import AlertPopup from "../components/AlertPopup";
import bgImage from "../assets/images/camerapage.png";

const CameraPage: React.FC = () => {
  const [baselineArea, setBaselineArea] = useState<number | null>(null);
  const [currentArea, setCurrentArea] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState(100);
  const [status, setStatus] = useState("Not Calibrated");
  const [hasBeenWarned, setHasBeenWarned] = useState(false);

  // 얼굴 감지 콜백
  const handleDetect = (area: number | null) => {
    setCurrentArea(area);

    if (area === null) {
      setStatus("Face Not Detected");
      setAccuracy(0);
      return;
    }

    if (baselineArea === null) {
      setStatus("Press Calibrate Button");
      return;
    }

    const ratio = area / baselineArea;
    let currentStatus = "Good Posture";
    let currentAccuracy = 100;

    if (ratio > 1.2) {
      currentStatus = "Forward Head";
      currentAccuracy = Math.max(
        0,
        Math.min(100, (1.2 - ratio) / (1.2 - 1.0) * 100)
      );
    } else {
      currentAccuracy = Math.max(
        0,
        Math.min(100, (1.2 - ratio) / (1.2 - 1.0) * 100)
      );
    }

    setStatus(currentStatus);
    setAccuracy(Math.round(currentAccuracy));

    if (currentAccuracy < 70 && currentStatus === "Forward Head") {
      setHasBeenWarned(true);
    }
  };

  // 기준 설정 버튼 클릭
  const handleCalibrate = () => {
    if (currentArea) {
      setBaselineArea(currentArea);
      setStatus("Calibrated");
    }
  };

  return (
    <div
      className="camera-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 카메라 + 버튼 */}
      <div className="camera-container">
        <CameraStream onDetect={handleDetect} />
        <CalibrateButton onCalibrate={handleCalibrate} />
      </div>

      {/* 자세 정확도 바 */}
      <PostureBar accuracy={accuracy} status={status} />

      {/* 경고 팝업 */}
      {hasBeenWarned && (
        <AlertPopup onClose={() => setHasBeenWarned(false)} />
      )}
    </div>
  );
};

export default CameraPage;
