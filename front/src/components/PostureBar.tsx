import React from "react";

interface PostureBarProps {
  accuracy: number;
  status: string;
}

const PostureBar: React.FC<PostureBarProps> = ({ accuracy, status }) => {
  const getColor = () => {
    if (status === "Forward Head") return "#ff3b30";
    if (status === "Good Posture") return "#4cd964";
    return "#999";
  };

  return (
    <div className="posturebar-container">
      <div
        style={{
          backgroundColor: "#ccc",
          borderRadius: "20px",
          width: "80%",
          height: "20px",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${accuracy}%`,
            height: "100%",
            backgroundColor: getColor(),
            transition: "width 0.3s ease",
          }}
        ></div>
      </div>
      <p
        style={{
          color: "#000",
          fontWeight: "bold",
          textAlign: "center",
          marginTop: "10px",
        }}
      >
        {status} — {accuracy}%
      </p>
    </div>
  );
};

export default PostureBar;

