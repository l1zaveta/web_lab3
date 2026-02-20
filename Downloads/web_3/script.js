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
    isGameOver() {
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) return false;
            }
        }
        

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size - 1; j++) {
                if (this.board[i][j] === this.board[i][j + 1]) return false;
            }
        }
        
        
        for (let j = 0; j < this.size; j++) {
            for (let i = 0; i < this.size - 1; i++) {
                if (this.board[i][j] === this.board[i + 1][j]) return false;
            }
        }
        
        return true;
    }

    undo() {
        if (this.gameOver || 
            document.querySelector('.game-overlay.active') || 
            document.querySelector('.modal.active') ||
            this.history.length === 0) {
            return;
        }
        
        const lastState = this.history.pop();
        this.board = lastState.board;
        this.score = lastState.score;
        this.renderBoard();
        this.saveGame();
    }

    animateMove() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.add('moving');
            setTimeout(() => {
                cell.classList.remove('moving');
            }, 150);
        });
    }

    animateMerge() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (cell.textContent) {
                cell.classList.add('merging');
                setTimeout(() => {
                    cell.classList.remove('merging');
                }, 200);
            }
        });
    }

    renderBoard() {
        const cells = document.querySelectorAll('.cell');
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const index = i * this.size + j;
                const value = this.board[i][j];
                cells[index].textContent = value || '';
                cells[index].setAttribute('data-value', value || '');
            }
        }
        document.getElementById('score').textContent = this.score;
    }

    showGameOver() {
        const overlay = document.getElementById('gameOverlay');
        const content = document.getElementById('gameOverContent');
        
        
        this.hideControls();
        
        if (this.scoreSaved) {
            content.innerHTML = `
                <h3>Игра окончена!</h3>
                <p>Ваш счет: ${this.score}</p>
                <p>Ваш рекорд сохранен</p>
                <button class="reset-btn" onclick="game.newGame()">Начать заново</button>
            `;
        } else {
            content.innerHTML = `
                <h3>Игра окончена!</h3>
                <p>Ваш счет: ${this.score}</p>
                <input type="text" id="playerName" placeholder="Введите ваше имя" maxlength="20" autocomplete="off">
                <button onclick="game.saveScore()">Сохранить результат</button>
                <button class="reset-btn" onclick="game.newGame()">Начать заново</button>
            `;
        }
        
        overlay.classList.add('active');
    }

    hideGameOverlay() {
        document.getElementById('gameOverlay').classList.remove('active');
    }

    saveScore() {
        const nameInput = document.getElementById('playerName');
        let name = nameInput ? nameInput.value.trim() : 'Аноним';
        
        if (!name) name = 'Аноним';
        
        const record = {
            name: name,
            score: this.score,
            date: new Date().toLocaleDateString('ru-RU')
        };
        
        this.leaderboard.push(record);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10);
        
        localStorage.setItem('leaderboard2048', JSON.stringify(this.leaderboard));
        
        this.scoreSaved = true;
        this.updateLeaderboardDisplay();
        
       
        const content = document.getElementById('gameOverContent');
        content.innerHTML = `
            <h3>Игра окончена!</h3>
            <p>Ваш счет: ${this.score}</p>
            <p>Ваш рекорд сохранен</p>
            <button class="reset-btn" onclick="game.newGame()">Начать заново</button>
        `;
    }

    loadLeaderboard() {
        const saved = localStorage.getItem('leaderboard2048');
        return saved ? JSON.parse(saved) : [];
    }

    updateLeaderboardDisplay() {
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';
        
        this.leaderboard.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.name}</td>
                <td>${record.score}</td>
                <td>${record.date}</td>
            `;
            tbody.appendChild(row);
        });
        
        if (this.leaderboard.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3" style="text-align: center;">Нет записей</td>';
            tbody.appendChild(row);
        }
    }

    showLeaderboard() {
        document.getElementById('leaderboardModal').classList.add('active');
        this.hideControls();
        this.updateLeaderboardDisplay();
    }

    hideLeaderboard() {
        document.getElementById('leaderboardModal').classList.remove('active');
        if (!this.gameOver) {
            this.showControls();
        }
    }

    hideControls() {
        document.getElementById('controlButtons').style.display = 'none';
    }

    showControls() {
        if (window.innerWidth <= 480 && !this.gameOver && !document.querySelector('.modal.active') && !document.querySelector('.game-overlay.active')) {
            document.getElementById('controlButtons').style.display = 'grid';
        }
    }
}


const game = new Game2048();


window.addEventListener('resize', () => {
    game.showControls();
});