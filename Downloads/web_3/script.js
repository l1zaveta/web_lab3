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
    addRandomTile() {
        const empty = this.getEmptyCells();
        if (empty.length > 0) {
            const {x, y} = empty[Math.floor(Math.random() * empty.length)];
            this.board[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        if (this.gameOver || document.querySelector('.game-overlay.active') || document.querySelector('.modal.active')) return false;
        
        let moved = false;
        let addedScore = 0;
        
        this.history.push({
            board: JSON.parse(JSON.stringify(this.board)),
            score: this.score
        });
        
        if (direction === 'left') {
            for (let i = 0; i < this.size; i++) {
                const result = this.mergeLine(this.board[i]);
                this.board[i] = result.line;
                addedScore += result.score;
                if (result.moved) moved = true;
            }
        } else if (direction === 'right') {
            for (let i = 0; i < this.size; i++) {
                const reversed = [...this.board[i]].reverse();
                const result = this.mergeLine(reversed);
                this.board[i] = result.line.reverse();
                addedScore += result.score;
                if (result.moved) moved = true;
            }
        } else if (direction === 'up') {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = 0; i < this.size; i++) {
                    column.push(this.board[i][j]);
                }
                const result = this.mergeLine(column);
                for (let i = 0; i < this.size; i++) {
                    this.board[i][j] = result.line[i];
                }
                addedScore += result.score;
                if (result.moved) moved = true;
            }
        } else if (direction === 'down') {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = this.size - 1; i >= 0; i--) {
                    column.push(this.board[i][j]);
                }
                const result = this.mergeLine(column);
                const reversedResult = result.line.reverse();
                for (let i = 0; i < this.size; i++) {
                    this.board[i][j] = reversedResult[i];
                }
                addedScore += result.score;
                if (result.moved) moved = true;
            }
        }
        
        if (moved) {
            this.score += addedScore;
            
            
            const emptyCells = this.getEmptyCells();
            if (emptyCells.length > 0) {
                const tilesToAdd = Math.min(
                    Math.random() < 0.7 ? 1 : 2,
                    emptyCells.length
                );
                for (let i = 0; i < tilesToAdd; i++) {
                    this.addRandomTile();
                }
            }
            
            this.animateMove();
            this.animateMerge();
            this.renderBoard();
            this.saveGame();
            
            if (this.isGameOver()) {
                this.gameOver = true;
                this.showGameOver();
            }
            
            return true;
        } else {
            this.history.pop();
        }
        
        return false;
    }

    mergeLine(line) {
        const filtered = line.filter(val => val !== 0);
        const result = [];
        let score = 0;
        let moved = false;
        
        for (let i = 0; i < filtered.length; i++) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                result.push(filtered[i] * 2);
                score += filtered[i] * 2;
                i++;
                moved = true;
            } else {
                result.push(filtered[i]);
            }
        }
        
        while (result.length < this.size) {
            result.push(0);
        }
        
       
        for (let i = 0; i < this.size; i++) {
            if (line[i] !== result[i]) {
                moved = true;
                break;
            }
        }
        
        return { line: result, score, moved };
    }
}