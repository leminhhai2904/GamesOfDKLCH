# Kho Games của ĐKLCH

## 1. Yêu cầu hệ thống
- Python 3.8 trở lên
- Windows 10/11 (khuyến nghị)
- Trình duyệt web hiện đại (Chrome, Edge, Firefox...)

## 2. Cài đặt Python và các thư viện cần thiết

### Bước 1: Cài đặt Python
- Tải Python tại: https://www.python.org/downloads/
- Khi cài đặt nhớ tick vào "Add Python to PATH"

### Bước 2: Cài đặt các thư viện
Mở terminal/cmd tại thư mục dự án và chạy:
```bash
pip install -r requirements.txt
```

## 3. Chạy ứng dụng nhận diện tay (Hand Detector)

### Chạy file nhận diện tay:
```bash
python hand_detector_app.py
```
- Giao diện sẽ hiện lên, nhấn "Start Detection" để bắt đầu.
- Làm theo hướng dẫn trên màn hình để điều khiển chuột hoặc click bằng cử chỉ tay.

## 4. Chạy các mini game
- Mở file `index.html` trong thư mục chính bằng trình duyệt web.

### Game khủng long (Dino)
- Có thể nhảy bằng phím Space hoặc click chuột trái.
- Thành tích sẽ tự động lưu lại.

### Game Flappy Bird, Paddle Control, Pac-Man
- Hiện chưa phát hành, khi truy cập sẽ hiện thông báo "Game chưa cập nhật".

## 5. Cấu trúc thư mục
```
├── hand_detector_app.py         # Ứng dụng nhận diện tay
├── requirements.txt             # Thư viện Python cần thiết
├── index.html                   # Trang chủ web
├── assets/                      # Ảnh, css, js chung
├── games/
│   ├── dino/                    # Game khủng long
│   ├── flappy-bird/             # Game Flappy Bird (chưa phát hành)
│   ├── pacman/                  # Game Pac-Man (chưa phát hành)
│   └── paddle/                  # Game Pong (chưa phát hành)
```

## 6. Lưu ý
- Nếu gặp lỗi camera, hãy kiểm tra quyền truy cập camera trên Windows.
- Nếu không chạy được, hãy kiểm tra lại phiên bản Python và các thư viện đã cài đặt.

---
*Mọi thắc mắc vui lòng liên hệ người phát triển để được hỗ trợ thêm.  
Sản phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh!*
