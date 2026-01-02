/**
 * Hand Detector - Phát hiện tay bằng MediaPipe
 * Hoạt động với camera realtime
 */

class HandDetector {
    constructor(options = {}) {
        this.options = {
            detection_confidence: options.detection_confidence || 0.5,
            tracking_confidence: options.tracking_confidence || 0.3,
            max_num_hands: options.max_num_hands || 1,
            ...options
        };

        this.hands = null;
        this.camera = null;
        this.canvasCtx = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.isRunning = false;
        this.fingerCount = -1;
        
        this.TIP_IDS = [4, 8, 12, 16, 20];
        
        // Callbacks
        this.onResults = this.options.onResults || (() => {});
        this.onFingerCountChange = this.options.onFingerCountChange || (() => {});
        this.onFingerCountZero = this.options.onFingerCountZero || (() => {});
        
        // Click handling
        this.lastClickTime = 0;
        this.clickCooldown = this.options.clickCooldown || 0.3;
    }

    /**
     * Khởi tạo Hand Detector
     */
    async initialize(videoElement, canvasElement) {
        return new Promise(async (resolve, reject) => {
            try {
                this.videoElement = videoElement;
                this.canvasElement = canvasElement;
                this.canvasCtx = canvasElement.getContext('2d');

                // Khởi tạo MediaPipe Hands
                this.hands = new window.Hands({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    }
                });

                this.hands.setOptions({
                    maxNumHands: this.options.max_num_hands,
                    modelComplexity: 1,
                    minDetectionConfidence: this.options.detection_confidence,
                    minTrackingConfidence: this.options.tracking_confidence
                });

                this.hands.onResults(this.handleResults.bind(this));

                // Khởi tạo Camera
                if (typeof window.Camera !== 'undefined') {
                    this.camera = new window.Camera(videoElement, {
                        onFrame: async () => {
                            await this.hands.send({ image: videoElement });
                        },
                        width: 640,
                        height: 480
                    });

                    resolve(true);
                } else {
                    reject('Camera không khả dụng');
                }
            } catch (error) {
                reject(`Lỗi khởi tạo: ${error.message}`);
            }
        });
    }

    /**
     * Xử lý kết quả từ MediaPipe
     */
    handleResults(results) {
        this.drawFrame(results);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const newFingerCount = this.countFingers(landmarks);
            
            if (newFingerCount !== this.fingerCount) {
                this.fingerCount = newFingerCount;
                this.onFingerCountChange(newFingerCount);
                
                // Trigger click khi phát hiện 0 ngón
                if (newFingerCount === 0) {
                    this.handleFingerZeroClick();
                }
            }
        } else {
            if (this.fingerCount !== -1) {
                this.fingerCount = -1;
                this.onFingerCountChange(-1);
            }
        }

        this.onResults({
            multiHandLandmarks: results.multiHandLandmarks,
            multiHandedness: results.multiHandedness,
            fingerCount: this.fingerCount
        });
    }

    /**
     * Xử lý click khi phát hiện 0 ngón
     */
    handleFingerZeroClick() {
        const currentTime = Date.now() / 1000;
        if (currentTime - this.lastClickTime > this.clickCooldown) {
            // Simulate click
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            document.dispatchEvent(event);
            
            // Gọi callback
            this.onFingerCountZero();
            
            this.lastClickTime = currentTime;
        }
    }

    /**
     * Vẽ frame với landmarks
     */
    drawFrame(results) {
        const canvas = this.canvasElement;
        const ctx = this.canvasCtx;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Vẽ video
        if (this.videoElement.videoWidth > 0) {
            ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        }

        // Vẽ landmarks
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Vẽ connections
            this.drawConnections(ctx, landmarks);
            
            // Vẽ landmarks
            this.drawLandmarks(ctx, landmarks);
        }
    }

    /**
     * Vẽ kết nối giữa các điểm
     */
    drawConnections(ctx, landmarks) {
        const HAND_CONNECTIONS = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];

        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;

        for (const [start, end] of HAND_CONNECTIONS) {
            const startLandmark = landmarks[start];
            const endLandmark = landmarks[end];

            ctx.beginPath();
            ctx.moveTo(startLandmark.x * this.canvasElement.width, startLandmark.y * this.canvasElement.height);
            ctx.lineTo(endLandmark.x * this.canvasElement.width, endLandmark.y * this.canvasElement.height);
            ctx.stroke();
        }
    }

    /**
     * Vẽ các điểm landmarks
     */
    drawLandmarks(ctx, landmarks) {
        ctx.fillStyle = '#FF0000';

        for (const landmark of landmarks) {
            ctx.beginPath();
            ctx.arc(
                landmark.x * this.canvasElement.width,
                landmark.y * this.canvasElement.height,
                4,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    }

    /**
     * Đếm số ngón tay
     */
    countFingers(landmarks) {
        if (!landmarks || landmarks.length === 0) {
            return -1;
        }

        let count = 0;

        // Kiểm tra ngón cái
        if (landmarks[this.TIP_IDS[0]].x < landmarks[this.TIP_IDS[0] - 1].x) {
            count++;
        }

        // Kiểm tra 4 ngón còn lại
        for (let i = 1; i < 5; i++) {
            if (landmarks[this.TIP_IDS[i]].y < landmarks[this.TIP_IDS[i] - 2].y) {
                count++;
            }
        }

        return count;
    }

    /**
     * Bắt đầu phát hiện
     */
    async start() {
        if (!this.isRunning && this.camera) {
            try {
                await this.camera.start();
                this.isRunning = true;
                return true;
            } catch (error) {
                console.error('Lỗi khởi động camera:', error);
                return false;
            }
        }
        return true;
    }

    /**
     * Dừng phát hiện
     */
    stop() {
        if (this.isRunning && this.camera) {
            this.camera.stop();
            this.isRunning = false;
        }
    }

    /**
     * Giải phóng tài nguyên
     */
    dispose() {
        this.stop();
        if (this.hands) {
            this.hands.close();
        }
    }

    /**
     * Kiểm tra xem có đang chạy không
     */
    isActive() {
        return this.isRunning;
    }

    /**
     * Lấy số ngón tay hiện tại
     */
    getFingerCount() {
        return this.fingerCount;
    }
}

// Export cho sử dụng
window.HandDetector = HandDetector;
