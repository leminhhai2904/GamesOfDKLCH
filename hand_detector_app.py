"""
Hand Gesture Mouse Click
- 0 fingers (fist) = ONE click
- Must release hand before next click
- Smooth, no spam, no start/stop
"""

import cv2
import mediapipe as mp
import time
from pynput.mouse import Button, Controller


class HandSingleClick:
    def __init__(self):
        # Mouse
        self.mouse = Controller()

        # MediaPipe Hands
        self.mp_hands = mp.solutions.hands
        self.mp_draw = mp.solutions.drawing_utils
        self.hands = self.mp_hands.Hands(
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.8
        )

        # Camera
        self.cap = cv2.VideoCapture(0)

        # ===== SMOOTH PARAMETERS =====
        self.HOLD_TIME = 0.05       # giữ nắm tay bao lâu mới click (giây)
        self.STABLE_FRAMES = 10      # số frame 0 ngón liên tục

        # State
        self.fist_frames = 0
        self.fist_start_time = None
        self.clicked = False

    # ================= FINGER COUNT =================

    def count_fingers(self, hand_landmarks):
        lm = hand_landmarks.landmark
        fingers = 0

        # Thumb (mirrored camera)
        if lm[self.mp_hands.HandLandmark.THUMB_TIP].x < lm[self.mp_hands.HandLandmark.THUMB_IP].x:
            fingers += 1

        tips = [
            self.mp_hands.HandLandmark.INDEX_FINGER_TIP,
            self.mp_hands.HandLandmark.MIDDLE_FINGER_TIP,
            self.mp_hands.HandLandmark.RING_FINGER_TIP,
            self.mp_hands.HandLandmark.PINKY_TIP
        ]

        pips = [
            self.mp_hands.HandLandmark.INDEX_FINGER_PIP,
            self.mp_hands.HandLandmark.MIDDLE_FINGER_PIP,
            self.mp_hands.HandLandmark.RING_FINGER_PIP,
            self.mp_hands.HandLandmark.PINKY_PIP
        ]

        for tip, pip in zip(tips, pips):
            if lm[tip].y < lm[pip].y:
                fingers += 1

        return fingers

    # ================= MAIN LOOP =================

    def run(self):
        print("✊ Hand Single Click Running")
        print("✊ Nắm tay = 1 click | ✋ Thả tay = reset")
        print("ESC để thoát")

        while True:
            ret, frame = self.cap.read()
            if not ret:
                continue

            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb)

            finger_count = -1
            now = time.time()

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    self.mp_draw.draw_landmarks(
                        frame,
                        hand_landmarks,
                        self.mp_hands.HAND_CONNECTIONS
                    )
                    finger_count = self.count_fingers(hand_landmarks)

                    cv2.putText(
                        frame,
                        f"Fingers: {finger_count}",
                        (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1.2,
                        (0, 255, 0),
                        3
                    )


            # ============ 5 FINGERS HOLD CLICK LOGIC ============
            if finger_count == 0:
                if not self.clicked:
                    self.mouse.press(Button.left)
                    self.clicked = True
                    print("PRESS (0 fingers)")
            elif finger_count == 5:
                if self.clicked:
                    self.mouse.release(Button.left)
                    self.clicked = False
                    print("RELEASE (5 fingers)")
            else:
                if self.clicked:
                    self.mouse.release(Button.left)
                    self.clicked = False
                    print("RELEASE (other)")

            cv2.imshow("Hand Single Click", frame)

            if cv2.waitKey(1) & 0xFF == 27:
                break

        self.cap.release()
        self.hands.close()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    HandSingleClick().run()
