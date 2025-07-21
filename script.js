// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// Game settings
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const GRID_COUNT = CANVAS_SIZE / GRID_SIZE;

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed = 150;

// Snake and food
let snake = [
    { x: 10, y: 10 }
];
let direction = { x: 0, y: 0 };
let food = { x: 15, y: 15 };

// Initialize game
function init() {
    highScoreElement.textContent = highScore;
    setupEventListeners();
    drawGame();
}

// Event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Button controls
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    
    // Mobile controls
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const direction = e.target.getAttribute('data-direction');
            handleMobileControl(direction);
        });
    });
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning || gamePaused) return;
    
    const key = e.key.toLowerCase();
    
    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction.y !== 1) {
                direction = { x: 0, y: -1 };
            }
            break;
        case 'arrowdown':
        case 's':
            if (direction.y !== -1) {
                direction = { x: 0, y: 1 };
            }
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x !== 1) {
                direction = { x: -1, y: 0 };
            }
            break;
        case 'arrowright':
        case 'd':
            if (direction.x !== -1) {
                direction = { x: 1, y: 0 };
            }
            break;
        case ' ':
            e.preventDefault();
            togglePause();
            break;
    }
}

// Handle mobile controls
function handleMobileControl(dir) {
    if (!gameRunning || gamePaused) return;
    
    switch (dir) {
        case 'up':
            if (direction.y !== 1) {
                direction = { x: 0, y: -1 };
            }
            break;
        case 'down':
            if (direction.y !== -1) {
                direction = { x: 0, y: 1 };
            }
            break;
        case 'left':
            if (direction.x !== 1) {
                direction = { x: -1, y: 0 };
            }
            break;
        case 'right':
            if (direction.x !== -1) {
                direction = { x: 1, y: 0 };
            }
            break;
    }
}

// Start game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    gameOverElement.classList.add('hidden');
    
    // Start game loop
    gameLoop();
}

// Toggle pause
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
    
    if (!gamePaused) {
        gameLoop();
    }
}

// Restart game
function restartGame() {
    // Reset game state
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    score = 0;
    gameSpeed = 150;
    scoreElement.textContent = score;
    
    // Generate new food
    generateFood();
    
    // Hide game over screen
    gameOverElement.classList.add('hidden');
    
    // Start game
    startGame();
}

// Game loop
function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    setTimeout(() => {
        update();
        drawGame();
        
        if (gameRunning) {
            gameLoop();
        }
    }, gameSpeed);
}

// Update game state
function update() {
    // Move snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        
        // Increase speed slightly
        if (gameSpeed > 100) {
            gameSpeed -= 2;
        }
        
        // Add visual feedback
        canvas.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            canvas.style.filter = 'brightness(1)';
        }, 100);
    } else {
        snake.pop();
    }
}

// Generate food
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// Draw game
function drawGame() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        if (index === 0) {
            // Head
            const gradient = ctx.createRadialGradient(
                x + GRID_SIZE/2, y + GRID_SIZE/2, 0,
                x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/2
            );
            gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(1, '#44a08d');
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4, 8);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x + 6, y + 6, 2, 0, Math.PI * 2);
            ctx.arc(x + 14, y + 6, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x + 6, y + 6, 1, 0, Math.PI * 2);
            ctx.arc(x + 14, y + 6, 1, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Body
            const gradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
            gradient.addColorStop(0, '#6dd5ed');
            gradient.addColorStop(1, '#2193b0');
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4);
            ctx.fill();
        }
    });
    
    // Draw food
    const foodX = food.x * GRID_SIZE;
    const foodY = food.y * GRID_SIZE;
    
    const foodGradient = ctx.createRadialGradient(
        foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, 0,
        foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, GRID_SIZE/2
    );
    foodGradient.addColorStop(0, '#ff6b6b');
    foodGradient.addColorStop(1, '#ee5a52');
    
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Add sparkle effect to food
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(foodX + GRID_SIZE/2 - 3, foodY + GRID_SIZE/2 - 3, 2, 0, Math.PI * 2);
    ctx.fill();
}

// Game over
function gameOver() {
    gameRunning = false;
    gamePaused = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    // Show game over screen
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
    
    // Show start button, hide pause button
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    pauseBtn.textContent = 'Pause';
}

// Add roundRect method if not available
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', init);