class Game2048 {
    constructor() {
        this.board = [];
        this.size = 4;
        this.score = 0;
        this.history = [];
        this.leaderboard = this.loadLeaderboard();
        this.gameOver = false;
        this.scoreSaved = false;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.loadGame();
        this.setupEventListeners();
        this.updateLeaderboardDisplay();
    }

    createBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            boardElement.appendChild(cell);
        }
    }

    setupEventListeners() {
        
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || document.querySelector('.modal.active') || document.querySelector('.game-overlay.active')) return;
            
            const keyToDirection = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            
            if (keyToDirection[e.key]) {
                e.preventDefault();
                this.move(keyToDirection[e.key]);
            }
        });

       
        document.getElementById('moveUp').addEventListener('click', () => {
            if (!this.gameOver && !document.querySelector('.modal.active') && !document.querySelector('.game-overlay.active')) {
                this.move('up');
            }
        });
        document.getElementById('moveDown').addEventListener('click', () => {
            if (!this.gameOver && !document.querySelector('.modal.active') && !document.querySelector('.game-overlay.active')) {
                this.move('down');
            }
        });
        document.getElementById('moveLeft').addEventListener('click', () => {
            if (!this.gameOver && !document.querySelector('.modal.active') && !document.querySelector('.game-overlay.active')) {
                this.move('left');
            }
        });
        document.getElementById('moveRight').addEventListener('click', () => {
            if (!this.gameOver && !document.querySelector('.modal.active') && !document.querySelector('.game-overlay.active')) {
                this.move('right');
            }
        });

      
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showLeaderboard());

        
        document.getElementById('closeModal').addEventListener('click', () => this.hideLeaderboard());
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('leaderboardModal');
            if (e.target === modal) {
                this.hideLeaderboard();
            }
        });

        
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.getElementById('board').addEventListener('touchstart', (e) => {
            if (this.gameOver || document.querySelector('.modal.active') || document.querySelector('.game-overlay.active')) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.getElementById('board').addEventListener('touchend', (e) => {
            if (this.gameOver || document.querySelector('.modal.active') || document.querySelector('.game-overlay.active')) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
                if (dx > 0) this.move('right');
                else this.move('left');
            } else if (Math.abs(dy) > 30) {
                if (dy > 0) this.move('down');
                else this.move('up');
            }
        });
    }

    newGame() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.history = [];
        this.gameOver = false;
        this.scoreSaved = false;
        
        
        const tilesCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < tilesCount; i++) {
            this.addRandomTile();
        }
        
        this.saveGame();
        this.renderBoard();
        this.hideGameOverlay();
        this.showControls();
    }

    loadGame() {
        const saved = localStorage.getItem('game2048');
        if (saved) {
            const data = JSON.parse(saved);
            this.board = data.board;
            this.score = data.score;
            this.history = data.history || [];
            this.gameOver = false;
            this.scoreSaved = false;
        } else {
            this.newGame();
        }
        this.renderBoard();
    }

    saveGame() {
        localStorage.setItem('game2048', JSON.stringify({
            board: this.board,
            score: this.score,
            history: this.history
        }));
    }

    getEmptyCells() {
        const empty = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) empty.push({x: i, y: j});
            }
        }
        return empty;
    }
}