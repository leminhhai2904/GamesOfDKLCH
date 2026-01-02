/**
 * Main App - Quản lý giao diện chính
 */

class GameHubApp {
    constructor() {
        this.handDetector = null;
        this.currentGame = null;
        this.games = [
            {
                id: 'dino',
                name: 'Dino T-Rex',
                emoji: '🦕',
                description: 'Điều khiển khủng long T-Rex để tránh các chướng ngại vật',
                instructions: [
                    'Nắm chặt tay (0 ngón) để nhảy',
                    'Tránh các cactus và đại bàng',
                    'Kiếm điểm bằng cách chạy càng lâu càng tốt'
                ],
                file: 'games/dino/index.html',
                controls: 'Nắm tay = Jump'
            },
            {
                id: 'flappy',
                name: 'Flappy Bird',
                emoji: '🐦',
                description: 'Chỉ với một chất liệu, hãy bay qua các ống nước',
                instructions: [
                    'Giơ 1 ngón để chim bay lên',
                    'Tránh va chạm với ống nước',
                    'Kiếm điểm khi đi qua ống nước'
                ],
                file: 'games/flappy-bird/index.html',
                controls: '1 ngón = Flap'
            },
            {
                id: 'paddle',
                name: 'Paddle Control',
                emoji: '🏓',
                description: 'Điều khiển mái chèo để chơi trò chơi pong',
                instructions: [
                    'Ít ngón = Di chuyển trái',
                    'Nhiều ngón = Di chuyển phải',
                    'Chặn quả bóng để kiếm điểm'
                ],
                file: 'games/paddle/index.html',
                controls: 'Ngón ít/nhiều = Trái/Phải'
            },
            {
                id: 'pacman',
                name: 'Pac-Man',
                emoji: '👾',
                description: 'Chơi kinh điển Pac-Man với điều khiển tay',
                instructions: [
                    'Giơ tay để di chuyển',
                    'Ăn tất cả chấm trắng',
                    'Tránh những con ma'
                ],
                file: 'games/pacman/index.html',
                controls: 'Tay = Di chuyển'
            }
        ];
    }

    /**
     * Khởi tạo ứng dụng
     */
    async initialize() {
        try {
            this.setupEventListeners();
            await this.initializeHandDetector();
            this.renderGames();
            console.log('Ứng dụng đã khởi tạo thành công');
        } catch (error) {
            console.error('Lỗi khởi tạo:', error);
            this.showStatus('Lỗi khởi tạo ứng dụng: ' + error, 'error');
        }
    }

    /**
     * Khởi tạo Hand Detector
     */
    async initializeHandDetector() {
        return new Promise(async (resolve, reject) => {
            try {
                const videoElement = document.getElementById('video');
                const canvasElement = document.getElementById('canvas');

                this.handDetector = new HandDetector({
                    detection_confidence: 0.5,
                    tracking_confidence: 0.3,
                    clickCooldown: 0.3,
                    onFingerCountChange: (count) => this.updateFingerCount(count),
                    onFingerCountZero: () => this.handleZeroFingerClick()
                });

                await this.handDetector.initialize(videoElement, canvasElement);
                this.showStatus('Hệ thống phát hiện tay đã sẵn sàng', 'success');
                resolve(true);
            } catch (error) {
                this.showStatus('Không thể khởi động camera: ' + error, 'error');
                reject(error);
            }
        });
    }

    /**
     * Cập nhật số ngón tay
     */
    updateFingerCount(count) {
        const fingerCountEl = document.getElementById('finger-count');
        if (fingerCountEl) {
            if (count === -1) {
                fingerCountEl.textContent = '?';
                fingerCountEl.style.borderColor = '#999';
            } else {
                fingerCountEl.textContent = count;
                fingerCountEl.style.borderColor = count === 0 ? '#FF6B6B' : '#667eea';
            }
        }
    }

    /**
     * Xử lý khi phát hiện 0 ngón (click)
     */
    handleZeroFingerClick() {
        // Flash effect khi click
        const fingerCountEl = document.getElementById('finger-count');
        if (fingerCountEl) {
            fingerCountEl.style.background = 'rgba(255, 107, 107, 0.3)';
            setTimeout(() => {
                fingerCountEl.style.background = 'rgba(0, 0, 0, 0.7)';
            }, 100);
        }
        
        console.log('Click từ camera được kích hoạt!');
    }

    /**
     * Thiết lập event listeners
     */
    setupEventListeners() {
        // Start button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startDetection());
        }

        // Stop button
        const stopBtn = document.getElementById('stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopDetection());
        }

        // Game cards
        document.addEventListener('click', (e) => {
            const gameCard = e.target.closest('.game-card');
            if (gameCard) {
                const gameId = gameCard.dataset.gameId;
                this.showGameModal(gameId);
            }

            // Play button in modal
            const playBtn = e.target.closest('.play-game-btn');
            if (playBtn) {
                const gameId = playBtn.dataset.gameId;
                this.playGame(gameId);
            }

            // Close modal
            const closeBtn = e.target.closest('.close-btn');
            if (closeBtn) {
                this.closeModal();
            }
        });

        // Close modal on outside click
        const modal = document.getElementById('game-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    /**
     * Bắt đầu phát hiện tay
     */
    async startDetection() {
        try {
            const result = await this.handDetector.start();
            if (result) {
                this.showStatus('Đang phát hiện tay...', 'success');
                document.getElementById('start-btn').disabled = true;
                document.getElementById('stop-btn').disabled = false;
                document.getElementById('canvas').style.display = 'block';
            }
        } catch (error) {
            this.showStatus('Lỗi: ' + error, 'error');
        }
    }

    /**
     * Dừng phát hiện tay
     */
    stopDetection() {
        this.handDetector.stop();
        this.showStatus('Đã dừng phát hiện tay', 'info');
        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('canvas').style.display = 'none';
        this.updateFingerCount(-1);
    }

    /**
     * Render danh sách game
     */
    renderGames() {
        const gameGrid = document.getElementById('game-grid');
        gameGrid.innerHTML = this.games.map(game => `
            <div class="game-card" data-game-id="${game.id}">
                <div class="game-thumbnail">${game.emoji}</div>
                <div class="game-info">
                    <h3>${game.name}</h3>
                    <p>${game.description}</p>
                    <button class="btn btn-primary">Chơi ngay</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Hiển thị modal game
     */
    showGameModal(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        const modal = document.getElementById('game-modal');
        const modalContent = document.getElementById('modal-game-content');

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>${game.emoji} ${game.name}</h2>
                <button class="close-btn">×</button>
            </div>
            <div class="modal-body">
                <p>${game.description}</p>
                
                <div class="instructions">
                    <h3>📋 Hướng dẫn chơi:</h3>
                    <ul>
                        ${game.instructions.map(instr => `<li>${instr}</li>`).join('')}
                    </ul>
                </div>

                <div class="instructions">
                    <h3>🎮 Điều khiển:</h3>
                    <p><strong>${game.controls}</strong></p>
                </div>

                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Điểm cao nhất</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Lần chơi</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">0:00</div>
                        <div class="stat-label">Thời gian</div>
                    </div>
                </div>

                <button class="btn btn-primary play-game-btn" data-game-id="${game.id}" style="margin-top: 20px;">
                    🎮 Chơi game
                </button>
            </div>
        `;

        modal.classList.add('active');
    }

    /**
     * Đóng modal
     */
    closeModal() {
        const modal = document.getElementById('game-modal');
        modal.classList.remove('active');
    }

    /**
     * Chơi game
     */
    playGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Dừng phát hiện tay trước khi chơi
        if (this.handDetector.isActive()) {
            this.stopDetection();
        }

        // Mở game trong tab mới hoặc iframe
        window.open(game.file, '_blank');
        this.closeModal();
    }

    /**
     * Hiển thị thông báo
     */
    showStatus(message, type = 'info') {
        const statusContainer = document.getElementById('status-message');
        if (!statusContainer) {
            const container = document.createElement('div');
            container.id = 'status-message';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '999';
            document.body.appendChild(container);
        }

        const statusEl = document.getElementById('status-message');
        const statusDiv = document.createElement('div');
        statusDiv.className = `status ${type}`;
        statusDiv.textContent = message;
        statusEl.appendChild(statusDiv);

        // Tự động xóa sau 5 giây
        setTimeout(() => {
            statusDiv.style.transition = 'opacity 0.3s';
            statusDiv.style.opacity = '0';
            setTimeout(() => statusDiv.remove(), 300);
        }, 5000);
    }
}

// Khởi tạo ứng dụng khi DOM loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new GameHubApp();
    await app.initialize();
});
