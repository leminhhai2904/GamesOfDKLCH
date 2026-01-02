# 🎮 Game Hub - Hand Control Gaming Platform

Nền tảng chơi game với điều khiển tay thông qua camera - một giải pháp chuyên nghiệp sử dụng MediaPipe và JavaScript.

## 📁 Cấu trúc dự án

```
App/
├── index.html                          # Trang chính
├── README.md                           # File hướng dẫn này
│
├── assets/
│   ├── css/
│   │   └── styles.css                 # CSS chung cho tất cả
│   └── js/
│       ├── app.js                     # Logic ứng dụng chính
│       └── hand-detector.js           # Lớp phát hiện tay (reusable)
│
├── games/
│   ├── dino/
│   │   └── index.html                 # Game Dino T-Rex
│   ├── flappy-bird/
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── game.css
│   │   └── js/
│   │       └── game.js
│   ├── paddle/
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   └── pacman/
│       ├── index.html
│       ├── css/
│       └── js/
│
└── trex-runner.html                   # Game T-Rex cũ (legacy)
```

## 🚀 Cách chạy

### 1. Sử dụng Python HTTP Server
```bash
cd "d:\Storage\Workspace\Python\App"
python -m http.server 8000
```
Rồi mở trình duyệt: `http://localhost:8000`

### 2. Sử dụng Live Server (VS Code)
- Cài extension "Live Server"
- Click chuột phải → "Open with Live Server"

### 3. Mở trực tiếp file HTML
- Mở `index.html` trong trình duyệt

## 🎮 Các game có sẵn

### 1. Dino T-Rex 🦕
- **Điều khiển:** Nắm chặt tay (0 ngón) để nhảy
- **Mục tiêu:** Tránh cactus và đại bàng
- **File:** `games/dino/index.html`

### 2. Flappy Bird 🐦
- **Điều khiển:** Giơ 1 ngón để bay lên
- **Mục tiêu:** Bay qua các ống nước
- **File:** `games/flappy-bird/index.html`

### 3. Paddle Control 🏓
- **Điều khiển:** Ít ngón = trái, Nhiều ngón = phải
- **Mục tiêu:** Chặn quả bóng
- **File:** `games/paddle/index.html`

### 4. Pac-Man 👾
- **Điều khiển:** Giơ tay để di chuyển
- **Mục tiêu:** Ăn chấm trắng tránh ma
- **File:** `games/pacman/index.html`

## 🖐️ Hand Detection Module

Module `HandDetector` hoàn toàn độc lập và có thể tái sử dụng.

### Cách sử dụng:

```javascript
// Khởi tạo
const detector = new HandDetector({
    detection_confidence: 0.5,
    tracking_confidence: 0.3,
    onFingerCountChange: (count) => {
        console.log(`Số ngón tay: ${count}`);
    }
});

// Khởi động
await detector.initialize(videoElement, canvasElement);
await detector.start();

// Dừng
detector.stop();

// Lấy số ngón tay
const count = detector.getFingerCount();
```

## ➕ Thêm game mới

### Bước 1: Tạo thư mục game
```bash
mkdir games/my-game
mkdir games/my-game/css
mkdir games/my-game/js
```

### Bước 2: Tạo HTML game
`games/my-game/index.html`

### Bước 3: Thêm vào danh sách game
Sửa file `assets/js/app.js`:

```javascript
// Trong constructor của GameHubApp
this.games = [
    // ... games cũ ...
    {
        id: 'my-game',
        name: 'Tên game',
        emoji: '🎮',
        description: 'Mô tả game',
        instructions: [
            'Hướng dẫn 1',
            'Hướng dẫn 2'
        ],
        file: 'games/my-game/index.html',
        controls: 'Điều khiển'
    }
];
```

## 📊 Tính năng chính

✅ **Hand Detection Realtime** - Phát hiện tay 24/7
✅ **Camera Preview** - Hiển thị khung hình camera
✅ **Finger Counting** - Đếm số ngón tay chính xác
✅ **Modular Architecture** - Kiến trúc module, dễ mở rộng
✅ **Responsive Design** - Hoạt động trên mọi thiết bị
✅ **Professional UI** - Giao diện hiện đại với CSS Grid
✅ **Reusable Components** - Module tái sử dụng được

## 🛠️ Công nghệ sử dụng

- **MediaPipe** - Phát hiện tay (từ Google)
- **JavaScript Vanilla** - Logic ứng dụng
- **CSS Grid/Flexbox** - Layout responsive
- **HTML5 Canvas** - Vẽ landmarks
- **HTML5 Camera API** - Truy cập camera

## ⚙️ Các tính năng advanced

### Hand Detector
- Phát hiện 1 tay tối ưu
- Ngưỡng phát hiện có thể cấu hình
- Callback cho thay đổi số ngón tay
- Vẽ landmarks tự động
- Quản lý camera lifecycle

### Game Manager
- Menu game tổ chức
- Modal game chi tiết
- Thống kê chơi game
- Quản lý phiên làm việc

## 📱 Responsive Breakpoints

- **Desktop:** Từ 1024px trở lên
- **Tablet:** 768px - 1024px
- **Mobile:** Dưới 768px

## 🔧 Lỗi thường gặp và cách khắc phục

### Camera không hoạt động
1. Kiểm tra quyền truy cập camera
2. Đảm bảo HTTPS hoặc localhost
3. Thử browser khác (Chrome, Firefox)

### Phát hiện tay không chính xác
1. Tăng ánh sáng
2. Điều chỉnh ngưỡng phát hiện trong `app.js`
3. Giơ tay rõ ràng trước camera

### Hiệu suất chậm
1. Giảm độ phân giải camera (480p)
2. Giảm tần số cập nhật game
3. Đóng các tab khác

## 📝 Danh sách TODO

- [ ] Tạo Flappy Bird game hoàn chỉnh
- [ ] Tạo Paddle Control game
- [ ] Tạo Pac-Man game
- [ ] Lưu trữ highscore (LocalStorage)
- [ ] Thêm leaderboard
- [ ] Hỗ trợ đa tay
- [ ] Lưu video gameplay

## 👥 Hỗ trợ

Có lỗi hoặc câu hỏi? Liên hệ hoặc tạo issue.

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

---

**Tạo bởi:** Game Hub Team
**Cập nhật:** 3 Tháng 1, 2026
**Phiên bản:** 1.0.0
