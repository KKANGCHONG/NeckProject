import React from "react";
import alertImage from "../assets/images/alert.png";

interface AlertPopupProps {
  onClose: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ onClose }) => {
  return (
    <div className="alert-popup show" onClick={onClose}>
      <img src={alertImage} alt="Posture Warning" />
    </div>
  );
};

export default AlertPopup;
