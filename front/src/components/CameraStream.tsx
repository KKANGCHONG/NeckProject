import React, { useEffect, useRef } from "react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision"; // ✅ 최신 Mediapipe 모듈
import { Camera } from "@mediapipe/camera_utils";

interface CameraStreamProps {
  onDetect: (area: number | null) => void;
}

const CameraStream: React.FC<CameraStreamProps> = ({ onDetect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let camera: Camera | null = null;
    let faceDetector: FaceDetector | null = null;

    const initFaceDetection = async () => {
      try {
        // ✅ Mediapipe vision API 리졸버 로드
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        // ✅ FaceDetector 인스턴스 초기화
        faceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-assets/face_detection_short_range.tflite",
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });

        // ✅ 카메라 시작
        if (videoRef.current) {
          camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (!faceDetector || !videoRef.current) return;
              const detections = await faceDetector.detectForVideo(
                videoRef.current,
                performance.now()
              );

              if (!detections.detections || detections.detections.length === 0) {
                onDetect(null);
                return;
              }

              const detection = detections.detections[0];
              const box = detection.boundingBox;
              if (!box || !box.width || !box.height) {
                onDetect(null);
                return;
              }
              const area = (box.width * box.height) / 
                           (videoRef.current.videoWidth * videoRef.current.videoHeight);
              onDetect(area);
            },
            width: 640,
            height: 480,
          });

          await camera.start();
        }
      } catch (err) {
        console.error("FaceDetection init error:", err);
        alert("카메라 접근 또는 얼굴 인식 초기화에 실패했습니다.");
      }
    };

    initFaceDetection();

    return () => {
      if (camera) camera.stop();
      faceDetector?.close();
    };
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
