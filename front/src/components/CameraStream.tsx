import React, { useEffect, useRef } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";

interface CameraStreamProps {
  onDetect: (area: number | null) => void;
}

const CameraStream: React.FC<CameraStreamProps> = ({ onDetect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // @ts-ignore
    const faceDetection = new FaceDetection({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    // @ts-ignore
    faceDetection.setOptions({
      modelSelection: 1,
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults((results: any) => {
      if (!results.detections || !results.detections[0]) {
        onDetect(null);
        return;
      }

      // @ts-ignore
      const detection: any = results.detections[0];
      const box = detection.locationData.relativeBoundingBox;
      const area = box.width * box.height; // 얼굴 영역 비율
      onDetect(area);
    });

    if (videoRef.current) {
      // @ts-ignore
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          // @ts-ignore
          await faceDetection.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [onDetect]);

  return (
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
  );
};

export default CameraStream;
