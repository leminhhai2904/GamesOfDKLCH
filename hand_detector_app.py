import cv2
import mediapipe as mp
import time
import tkinter as tk
from PIL import Image, ImageTk
from pynput.mouse import Button, Controller


class HandGestureApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Điều khiển chuột bằng cử chỉ tay")

        # ===== CAMERA =====
        self.cap = cv2.VideoCapture(0)
        self.cam_width = 1280
        self.cam_height = 720
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.cam_width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.cam_height)

        # ===== MEDIAPIPE =====
        self.mp_hands = mp.solutions.hands
        self.mp_draw = mp.solutions.drawing_utils
        self.hands = self.mp_hands.Hands(
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.8
        )

        # ===== MOUSE =====
        self.mouse = Controller()
        self.clicked = False

        # ===== UI =====
        self.canvas = tk.Canvas(root, bg="black")
        self.canvas.pack(fill=tk.BOTH, expand=True)

        # self.info = tk.Label(
        #     root,
        #     text="✊ Nắm tay = Click | ✋ Mở tay = Release",
        #     font=("Segoe UI", 11)
        # )
        # self.info.pack()

        self.root.bind("<Escape>", lambda e: self.close())

        # Start loop
        self.update_frame()

    # ================= FINGER COUNT =================
    def count_fingers(self, hand_landmarks):
        lm = hand_landmarks.landmark
        fingers = 0

        # Thumb
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

    # ================= SCALE KEEP RATIO =================
    def resize_keep_ratio(self, frame, canvas_w, canvas_h):
        h, w = frame.shape[:2]
        scale = min(canvas_w / w, canvas_h / h)

        new_w = int(w * scale)
        new_h = int(h * scale)

        resized = cv2.resize(frame, (new_w, new_h))
        canvas = cv2.cvtColor(
            cv2.copyMakeBorder(
                resized,
                (canvas_h - new_h) // 2,
                canvas_h - new_h - (canvas_h - new_h) // 2,
                (canvas_w - new_w) // 2,
                canvas_w - new_w - (canvas_w - new_w) // 2,
                cv2.BORDER_CONSTANT,
                value=(0, 0, 0)
            ),
            cv2.COLOR_BGR2RGB
        )

        return canvas

    # ================= MAIN LOOP =================
    def update_frame(self):
        ret, frame = self.cap.read()
        if not ret:
            self.root.after(10, self.update_frame)
            return

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb)

        finger_count = -1

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
                    (20, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.2,
                    (0, 255, 0),
                    3
                )

        # ===== CLICK LOGIC =====
        if finger_count == 0 and not self.clicked:
            self.mouse.press(Button.left)
            self.clicked = True
        elif finger_count != 0 and self.clicked:
            self.mouse.release(Button.left)
            self.clicked = False

        # ===== DISPLAY =====
        canvas_w = self.canvas.winfo_width()
        canvas_h = self.canvas.winfo_height()

        if canvas_w > 1 and canvas_h > 1:
            frame = self.resize_keep_ratio(frame, canvas_w, canvas_h)

        img = Image.fromarray(frame)
        imgtk = ImageTk.PhotoImage(image=img)

        self.canvas.create_image(
            canvas_w // 2,
            canvas_h // 2,
            image=imgtk,
            anchor=tk.CENTER
        )
        self.canvas.imgtk = imgtk

        self.root.after(10, self.update_frame)

    def close(self):
        self.cap.release()
        self.hands.close()
        self.root.destroy()


# ================= RUN =================
if __name__ == "__main__":
    root = tk.Tk()
    icon = tk.PhotoImage(file="assets/icon/itus.png")
    root.iconphoto(False, icon)
    # root.geometry("1280x720")
    root.geometry("854x480")
    app = HandGestureApp(root)
    root.mainloop()
