import React, { useState, useEffect } from "react";
import "../styles/layout.css";
import CameraStream from "../components/CameraStream";
import PostureBar from "../components/PostureBar";
import bgImage from "../assets/images/camerapage.png";
import calibrateButtonImage from "../assets/images/calibrate.png";
import alertImage from "../assets/images/alert.png"; // 경고 이미지 import

const CameraPage: React.FC = () => {
  const [accuracy, setAccuracy] = useState(100);
  const [status, setStatus] = useState("Not Calibrated");

  const BASE_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:8000";

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/posture`);
        const data = await res.json();
        if (data.accuracy !== undefined) {
          setAccuracy(data.accuracy);
        }
        if (data.status !== undefined) {
          setStatus(data.status);
        }
      } catch (error) {
        console.error("Failed to fetch posture data:", error);
        setStatus("Server Disconnected");
        setAccuracy(0);
      }
    }, 500); // 0.5초마다 데이터 갱신

    return () => clearInterval(interval);
  }, []);

  // 기준 설정 버튼 클릭 시 호출될 함수
  const handleCalibrate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/calibrate`, {
        method: 'POST',
      });
      if (response.ok) {
        console.log("Calibration signal sent successfully.");
      } else {
        console.error("Failed to send calibration signal.");
      }
    } catch (error) {
      console.error("Error sending calibration signal:", error);
    }
  };

  const [hasBeenWarned, setHasBeenWarned] = useState(false);

  useEffect(() => {
    // 한 번이라도 정확도가 70% 미만으로 떨어지면 경고를 표시하고, 그 상태를 유지합니다.
    if (accuracy < 70 && status !== 'Not Calibrated' && status !== 'Server Disconnected') {
      setHasBeenWarned(true);
    }
  }, [accuracy, status]);

  // 경고 팝업 클릭 시 호출될 함수
  const handleAlertClick = () => {
    setHasBeenWarned(false);
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
      {/* 카메라 영상 */}
      <div className="camera-container">
        <CameraStream />
        {/* 기준 설정 이미지 버튼 */}
        <div className="calibrate-button-container">
          <button onClick={handleCalibrate} className="calibrate-image-button">
            <img src={calibrateButtonImage} alt="Calibrate Posture" />
          </button>
        </div>
      </div>

      {/* 자세 정확도 바 */}
      <div className="posturebar-container">
        <PostureBar accuracy={accuracy} status={status} />
      </div>

      {/* 경고 알림 팝업 */}
      <div className={`alert-popup ${hasBeenWarned ? 'show' : ''}`} onClick={handleAlertClick}>
        <img src={alertImage} alt="Posture Warning" />
      </div>
    </div>
  );
};

export default CameraPage;
