// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const paddleSpeed = 6;
const ballSpeed = 5;
const maxBallSpeed = 7;

// Player paddle (left)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Computer paddle (right)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5,
    score: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: ballSpeed,
    dy: ballSpeed,
    speed: ballSpeed
};

// Keyboard state
const keys = {};

// Event listeners for keyboard input
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse control for player paddle
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Only update if mouse is over the canvas
    if (mouseY >= 0 && mouseY <= canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }
});

// Update player paddle position with keyboard
function updatePlayerPaddle() {
    if (keys['ArrowUp'] || keys['w']) {
        player.y = Math.max(0, player.y - paddleSpeed);
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y = Math.min(canvas.height - paddleHeight, player.y + paddleSpeed);
    }
    
    // Constrain player paddle to canvas
    player.y = Math.max(0, Math.min(canvas.height - paddleHeight, player.y));
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    // AI follows the ball with some difficulty adjustment
    if (computerCenter < ballCenter - 35) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
    } else if (computerCenter > ballCenter + 35) {
        computer.y = Math.max(0, computer.y - computer.speed);
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }
    
    // Paddle collision detection
    checkPaddleCollision(player);
    checkPaddleCollision(computer);
    
    // Scoring
    if (ball.x - ball.size < 0) {
        computer.score++;
        resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        player.score++;
        resetBall();
    }
}

// Check collision between ball and paddle
function checkPaddleCollision(paddle) {
    if (ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y) {
        
        // Reverse ball direction
        ball.dx = -ball.dx;
        
        // Calculate collision point on paddle
        const collidePoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        
        // Apply angle based on where ball hit the paddle
        ball.dy = collidePoint * maxBallSpeed;
        
        // Prevent ball from getting stuck
        if (paddle === player) {
            ball.x = paddle.x + paddle.width + ball.size;
        } else {
            ball.x = paddle.x - ball.size;
        }
        
        // Gradually increase ball speed (but cap it)
        ball.speed = Math.min(maxBallSpeed, ball.speed + 0.1);
        ball.dx = (ball.dx > 0 ? 1 : -1) * Math.sqrt(ball.speed ** 2 - ball.dy ** 2);
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = ballSpeed;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    ball.dy = (Math.random() - 0.5) * ballSpeed;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 15;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = 'transparent';
    
    // Draw game elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
    
    // Update scores
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

// Game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
