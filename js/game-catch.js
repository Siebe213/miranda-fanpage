const canvas = document.getElementById('catchCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

let score, lives, gameInterval, spawnerInterval;
let basket = { x: 350, y: 530, width: 100, height: 30, dx: 0, speed: 8 };
let cheerios = [];
let particles = [];

function resetGame() {
    score = 0;
    lives = 3;
    scoreEl.innerText = score;
    livesEl.innerText = lives;
    cheerios = [];
    particles = [];
    basket.x = 350;
}

function spawnCheerio() {
    let speed = 3 + (score / 50); 
    cheerios.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -30,
        radius: 15,
        speed: speed,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 0.2
    });
}

function spawnParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 1.0,
            color: color
        });
    }
}

function drawDonut(x, y, radius, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // Outer donut
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffaa00';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d48800';
    ctx.stroke();

    // Inner hole
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(0, 0, radius/2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.arc(0, 0, radius/2.5, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d48800';
    ctx.stroke();

    ctx.restore();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update Particles
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) { particles.splice(i, 1); i--; continue; }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Move Basket
    basket.x += basket.dx;
    if (basket.x < 0) basket.x = 0;
    if (basket.x + basket.width > canvas.width) basket.x = canvas.width - basket.width;

    // Draw Basket (3D glowing block)
    let bGrad = ctx.createLinearGradient(basket.x, basket.y, basket.x, basket.y + basket.height);
    bGrad.addColorStop(0, '#00f0ff');
    bGrad.addColorStop(1, '#0055ff');
    ctx.fillStyle = bGrad;
    ctx.beginPath(); ctx.roundRect(basket.x, basket.y, basket.width, basket.height, 10); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'white'; ctx.stroke();

    // Move & Draw Cheerios
    for (let i = 0; i < cheerios.length; i++) {
        let c = cheerios[i];
        c.y += c.speed;
        c.rotation += c.rotSpeed;

        drawDonut(c.x, c.y, c.radius, c.rotation);

        // Catch
        if (c.y + c.radius >= basket.y && c.y - c.radius <= basket.y + basket.height && 
            c.x >= basket.x && c.x <= basket.x + basket.width) {
            score += 10;
            scoreEl.innerText = score;
            spawnParticles(c.x, c.y, '#ffaa00');
            cheerios.splice(i, 1);
            i--;
        } 
        // Miss
        else if (c.y > canvas.height + 20) {
            lives--;
            livesEl.innerText = lives;
            spawnParticles(c.x, canvas.height, '#ff0000');
            cheerios.splice(i, 1);
            i--;
            if (lives <= 0) gameOver();
        }
    }
}

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(spawnerInterval);
    gameInterval = null;
    startScreen.style.display = 'block';
    startScreen.innerHTML = `<h2>Game Over!</h2><p>Score: ${score}</p><button class="btn btn-primary" id="btn-restart">Opnieuw Spelen</button>`;
    
    // Save to leaderboard
    let saved = JSON.parse(localStorage.getItem('miranda_leaderboard')) || [];
    let existing = saved.find(e => e.game === "Cheerio");
    if (!existing || score > existing.score) {
        if(!existing) existing = { game: "Cheerio", score: score, name: "Fan" };
        else existing.score = score;
        let pName = prompt("Nieuwe High Score! Wat is je naam?", existing.name);
        if(pName) {
            existing.name = pName;
            if(!saved.find(e => e.game === "Cheerio")) saved.push(existing);
            localStorage.setItem('miranda_leaderboard', JSON.stringify(saved));
        }
    }

    document.getElementById('btn-restart').addEventListener('click', startGame);
}

function startGame() {
    startScreen.style.display = 'none';
    resetGame();
    gameInterval = setInterval(gameLoop, 20);
    spawnerInterval = setInterval(spawnCheerio, 800);
}

document.getElementById('btn-start').addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') basket.dx = -basket.speed;
    if (e.key === 'ArrowRight' || e.key === 'd') basket.dx = basket.speed;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd') basket.dx = 0;
});
