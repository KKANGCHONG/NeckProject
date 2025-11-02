from flask import Flask, Response, jsonify
from flask_cors import CORS # CORS import
import cv2
import mediapipe as mp
import time
import os

app = Flask(__name__)
CORS(app, origins=["https://neckproject-fronted.onrender.com"])

# MediaPipe Face Detection 초기화
mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(
    model_selection=1, min_detection_confidence=0.5)

# --- 글로벌 변수 ---
# 스트림과 공유되어야 하는 변수들
baseline_face_area = None
current_status = "Not Calibrated"
current_color = (255, 150, 0)
current_ratio = 0

# 기준 설정을 위한 플래그
needs_calibration = False

# 메시지 표시용
message = ""
message_time = 0

def generate_frames():
    """카메라 프레임을 실시간으로 처리하고 스트리밍합니다."""
    global baseline_face_area, current_status, current_color, current_ratio
    global needs_calibration, message, message_time
    
    cap = cv2.VideoCapture(0)

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        results = face_detection.process(rgb_frame)
        
        current_face_area = None
        if results.detections:
            detection = results.detections[0] # 첫 번째 얼굴만 사용
            bboxC = detection.location_data.relative_bounding_box
            x, y, width, height = int(bboxC.xmin * w), int(bboxC.ymin * h), \
                                  int(bboxC.width * w), int(bboxC.height * h)
            current_face_area = width * height
            cv2.rectangle(frame, (x, y), (x + width, y + height), current_color, 2)

        # 기준 설정 플래그가 True이고 얼굴이 감지되었을 때
        if needs_calibration and current_face_area is not None:
            baseline_face_area = current_face_area
            needs_calibration = False # 플래그 초기화
            message = "Baseline Set!"
            message_time = time.time()

        # 상태 결정 로직
        if baseline_face_area is not None:
            if current_face_area is not None:
                current_ratio = current_face_area / baseline_face_area
                if current_ratio > 1.20:
                    current_status = "Forward Head"
                    current_color = (0, 0, 255)
                else:
                    current_status = "Good Posture"
                    current_color = (0, 255, 0)
                
                # 화면에 비율 표시
                cv2.putText(frame, f"Size Ratio: {current_ratio:.2f}", (30, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, current_color, 2, cv2.LINE_AA)
            else:
                current_status = "Face Not Detected"
                current_color = (0, 255, 255)
        else:
            current_status = "Press Calibrate Button"
            current_color = (255, 150, 0)

        # 상태 텍스트 출력
        cv2.putText(frame, current_status, (30, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, current_color, 3, cv2.LINE_AA)

        # "Baseline Set!" 메시지를 2초간 표시
        if time.time() - message_time < 2:
            cv2.putText(frame, message, (w // 2 - 150, h // 2),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3, cv2.LINE_AA)

        # 프레임 인코딩 및 스트림으로 전송
        ret, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route("/stream")
def stream():
    """비디오 스트리밍 경로"""
    return Response(generate_frames(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/calibrate", methods=['POST'])
def calibrate():
    """기준 자세 설정을 위한 엔드포인트"""
    global needs_calibration
    needs_calibration = True
    return jsonify({"status": "Calibration initiated"})

@app.route("/posture")
def posture():
    """현재 자세 상태를 JSON으로 반환"""
    # 정확도를 비율에 따라 대략적으로 계산 (0~100)
    # 1.0 근처일수록 100점, 1.2 이상으로 커지면 0점에 가깝게
    accuracy = 0
    if baseline_face_area is not None and current_ratio != 0:
        # 1.0을 기준으로 멀어질수록 점수 하락
        # 1.2를 0점, 1.0을 100점으로 매핑
        accuracy = int(max(0, min(100, (1.2 - current_ratio) / (1.2 - 1.0) * 100)))

    return jsonify({"status": current_status, "accuracy": accuracy})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)