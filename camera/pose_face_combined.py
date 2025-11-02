import cv2
import mediapipe as mp
import time

# MediaPipe Face Detection 초기화
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

face_detection = mp_face_detection.FaceDetection(
    model_selection=1, min_detection_confidence=0.5)

# -----------------------
# 변수 초기화
# -----------------------
baseline_face_area = None
status = "Not Calibrated"
color = (128, 128, 128)  # 회색

# 화면에 메시지를 표시하기 위한 변수
message = ""
message_time = 0

# -----------------------
# 카메라 시작
# -----------------------
cap = cv2.VideoCapture(0)
print("✅ 거북목 자세 인식 시작 (s: 기준 설정, ESC: 종료)")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("❌ 카메라 프레임을 읽을 수 없습니다.")
        break

    # 좌우 반전 (거울 모드) 및 RGB 변환
    frame = cv2.flip(frame, 1)
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # 얼굴 인식 수행
    results = face_detection.process(image_rgb)
    
    frame_height, frame_width = frame.shape[:2]
    current_face_area = None

    if results.detections:
        for detection in results.detections:
            # 얼굴 위치 경계 상자
            bboxC = detection.location_data.relative_bounding_box
            ih, iw, _ = frame.shape
            x, y, w, h = int(bboxC.xmin * iw), int(bboxC.ymin * ih), \
                         int(bboxC.width * iw), int(bboxC.height * ih)
            
            # 얼굴 영역 계산
            current_face_area = w * h
            
            # 경계 상자 그리기 (상태에 따라 색상 변경)
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            break # 첫 번째 검출된 얼굴만 사용

    # 키 입력 확인
    key = cv2.waitKey(5) & 0xFF

    # 's' 키를 눌러 기준 설정
    if key == ord('s') and current_face_area is not None:
        baseline_face_area = current_face_area
        message = "Baseline Set!"
        message_time = time.time()

    # ESC로 종료
    elif key == 27:
        break

    # 기준이 설정된 경우, 거북목 상태 판별
    if baseline_face_area is not None:
        if current_face_area is not None:
            size_ratio = current_face_area / baseline_face_area
            
            # 얼굴 크기가 기준보다 30% 이상 커지면 경고
            if size_ratio > 1.30:
                status = "Forward Head (거북목)"
                color = (0, 0, 255) # 빨간색
            else:
                status = "Good Posture"
                color = (0, 255, 0) # 초록색
            
            # 화면에 비율 표시
            cv2.putText(frame, f"Size Ratio: {size_ratio:.2f}", (30, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2, cv2.LINE_AA)
        else:
            # 얼굴이 감지되지 않으면 상태를 초기화
            status = "Face Not Detected"
            color = (0, 255, 255) # 노란색
    else:
        status = "Press 's' to calibrate"
        color = (255, 150, 0) # 파란색 계열

    # 상태 텍스트 출력
    cv2.putText(frame, status, (30, 100),
                cv2.FONT_HERSHEY_SIMPLEX, 1, color, 3, cv2.LINE_AA)

    # "Baseline Set!" 메시지를 2초간 표시
    if time.time() - message_time < 2:
        cv2.putText(frame, message, (frame_width // 2 - 150, frame_height // 2),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3, cv2.LINE_AA)


    cv2.imshow("Neck Posture Detector", frame)

# 종료 처리
face_detection.close()
cap.release()
cv2.destroyAllWindows()