import React from "react";
import calibrateButtonImage from "../assets/images/calibrate.png";

interface CalibrateButtonProps {
  onCalibrate: () => void;
}

const CalibrateButton: React.FC<CalibrateButtonProps> = ({ onCalibrate }) => {
  return (
    <div className="calibrate-button-container">
      <button onClick={onCalibrate} className="calibrate-image-button">
        <img src={calibrateButtonImage} alt="Calibrate" />
      </button>
    </div>
  );
};

export default CalibrateButton;
