const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const scoreEl = document.getElementById('score');

const gridSize = 20;
let snake, food, particles, score, gameInterval;

function resetGame() {
    snake = { x: 400, y: 300, dx: gridSize, dy: 0, cells: [], maxCells: 5 };
    food = { x: 200, y: 200 };
    particles = [];
    score = 0;
    scoreEl.innerText = score;
    spawnFood();
}

function spawnFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

function spawnParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x + gridSize/2, y: y + gridSize/2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: color
        });
    }
}

function drawGradientRect(x, y, w, h, color1, color2) {
    let grad = ctx.createRadialGradient(x + w/2, y + h/2, 2, x + w/2, y + h/2, w);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 5);
    ctx.fill();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update particles
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) { particles.splice(i, 1); i--; continue; }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    snake.x += snake.dx;
    snake.y += snake.dy;

    // Wrap around
    if (snake.x < 0) snake.x = canvas.width - gridSize;
    else if (snake.x >= canvas.width) snake.x = 0;
    if (snake.y < 0) snake.y = canvas.height - gridSize;
    else if (snake.y >= canvas.height) snake.y = 0;

    snake.cells.unshift({x: snake.x, y: snake.y});
    if (snake.cells.length > snake.maxCells) snake.cells.pop();

    // Draw Food
    drawGradientRect(food.x, food.y, gridSize-2, gridSize-2, '#fff', '#ff007f');

    // Draw Snake
    snake.cells.forEach((cell, index) => {
        let color1 = index === 0 ? '#fff' : '#00f0ff';
        let color2 = index === 0 ? '#00f0ff' : '#0055ff';
        drawGradientRect(cell.x, cell.y, gridSize-2, gridSize-2, color1, color2);

        // Check food collision
        if (cell.x === food.x && cell.y === food.y) {
            snake.maxCells++;
            score += 10;
            scoreEl.innerText = score;
            spawnParticles(food.x, food.y, '#ff007f');
            spawnFood();
        }

        // Self collision
        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                gameOver();
            }
        }
    });
}

function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    startScreen.style.display = 'block';
    startScreen.innerHTML = `<h2>Game Over!</h2><p>Je score: ${score}</p><button class="btn btn-primary" id="btn-restart">Opnieuw Spelen</button>`;
    
    // Save to leaderboard
    let saved = JSON.parse(localStorage.getItem('miranda_leaderboard')) || [];
    let existing = saved.find(e => e.game === "Snake");
    if (!existing || score > existing.score) {
        if(!existing) existing = { game: "Snake", score: score, name: "Fan" };
        else existing.score = score;
        let pName = prompt("Nieuwe High Score! Wat is je naam?", existing.name);
        if(pName) {
            existing.name = pName;
            if(!saved.find(e => e.game === "Snake")) saved.push(existing);
            localStorage.setItem('miranda_leaderboard', JSON.stringify(saved));
        }
    }

    document.getElementById('btn-restart').addEventListener('click', startGame);
}

function startGame() {
    startScreen.style.display = 'none';
    resetGame();
    gameInterval = setInterval(gameLoop, 80); // Fast!
}

document.getElementById('btn-start').addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if ((e.key === 'ArrowLeft' || e.key === 'a') && snake.dx === 0) { snake.dx = -gridSize; snake.dy = 0; }
    else if ((e.key === 'ArrowUp' || e.key === 'w') && snake.dy === 0) { snake.dy = -gridSize; snake.dx = 0; }
    else if ((e.key === 'ArrowRight' || e.key === 'd') && snake.dx === 0) { snake.dx = gridSize; snake.dy = 0; }
    else if ((e.key === 'ArrowDown' || e.key === 's') && snake.dy === 0) { snake.dy = gridSize; snake.dx = 0; }
});
