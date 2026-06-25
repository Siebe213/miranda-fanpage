// js/games.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Global function to update leaderboard score
    const updateHighScore = (gameName, score) => {
        let savedLeaderboard = JSON.parse(localStorage.getItem('miranda_leaderboard')) || [];
        
        // Find existing entry for this game
        let existing = savedLeaderboard.find(e => e.game === gameName);
        
        let isNewHigh = false;
        if (!existing) {
            existing = { game: gameName, score: score, name: "New Legend" };
            savedLeaderboard.push(existing);
            isNewHigh = true;
        } else if (score > existing.score) {
            existing.score = score;
            isNewHigh = true;
        }

        if (isNewHigh) {
            let playerName = prompt(`Nieuwe High Score voor ${gameName}! Vul je naam in:`, "Miranda Fan");
            if (playerName) {
                existing.name = playerName;
                localStorage.setItem('miranda_leaderboard', JSON.stringify(savedLeaderboard));
                if (window.loadLeaderboard) window.loadLeaderboard();
            }
        }
    };

    // ==========================================
    // Game 1: Multiplayer Snake
    // ==========================================
    const canvasSnake = document.getElementById('snakeCanvas');
    const ctxSnake = canvasSnake.getContext('2d');
    const gridSize = 10;
    
    let snake1, snake2, food, snakeInterval;
    let snakeP1Score = 0, snakeP2Score = 0;
    const p1ScoreEl = document.getElementById('snake-p1-score');
    const p2ScoreEl = document.getElementById('snake-p2-score');

    const resetSnake = () => {
        snake1 = { x: 50, y: 150, dx: gridSize, dy: 0, cells: [], maxCells: 4, color: '#ff007f' }; // P1 (Pink)
        snake2 = { x: 350, y: 150, dx: -gridSize, dy: 0, cells: [], maxCells: 4, color: '#00f0ff' }; // P2 (Cyan)
        food = { x: 200, y: 150 };
        snakeP1Score = 0;
        snakeP2Score = 0;
        p1ScoreEl.innerText = snakeP1Score;
        p2ScoreEl.innerText = snakeP2Score;
    };

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

    const gameLoopSnake = () => {
        ctxSnake.clearRect(0, 0, canvasSnake.width, canvasSnake.height);

        // Move snakes
        snake1.x += snake1.dx;
        snake1.y += snake1.dy;
        snake2.x += snake2.dx;
        snake2.y += snake2.dy;

        // Wrap walls
        if (snake1.x < 0) snake1.x = canvasSnake.width - gridSize;
        else if (snake1.x >= canvasSnake.width) snake1.x = 0;
        if (snake1.y < 0) snake1.y = canvasSnake.height - gridSize;
        else if (snake1.y >= canvasSnake.height) snake1.y = 0;

        if (snake2.x < 0) snake2.x = canvasSnake.width - gridSize;
        else if (snake2.x >= canvasSnake.width) snake2.x = 0;
        if (snake2.y < 0) snake2.y = canvasSnake.height - gridSize;
        else if (snake2.y >= canvasSnake.height) snake2.y = 0;

        snake1.cells.unshift({x: snake1.x, y: snake1.y});
        if (snake1.cells.length > snake1.maxCells) snake1.cells.pop();
        
        snake2.cells.unshift({x: snake2.x, y: snake2.y});
        if (snake2.cells.length > snake2.maxCells) snake2.cells.pop();

        // Draw Food
        ctxSnake.fillStyle = 'white';
        ctxSnake.fillRect(food.x, food.y, gridSize-1, gridSize-1);

        // Draw and check collision for P1
        ctxSnake.fillStyle = snake1.color;
        snake1.cells.forEach((cell, index) => {
            ctxSnake.fillRect(cell.x, cell.y, gridSize-1, gridSize-1);
            if (cell.x === food.x && cell.y === food.y) {
                snake1.maxCells++;
                snakeP1Score++;
                p1ScoreEl.innerText = snakeP1Score;
                food.x = getRandomInt(0, canvasSnake.width / gridSize) * gridSize;
                food.y = getRandomInt(0, canvasSnake.height / gridSize) * gridSize;
            }
            // Collision with self
            for (let i = index + 1; i < snake1.cells.length; i++) {
                if (cell.x === snake1.cells[i].x && cell.y === snake1.cells[i].y) endGameSnake("Speler 2 (Cyan) Wint!");
            }
        });

        // Draw and check collision for P2
        ctxSnake.fillStyle = snake2.color;
        snake2.cells.forEach((cell, index) => {
            ctxSnake.fillRect(cell.x, cell.y, gridSize-1, gridSize-1);
            if (cell.x === food.x && cell.y === food.y) {
                snake2.maxCells++;
                snakeP2Score++;
                p2ScoreEl.innerText = snakeP2Score;
                food.x = getRandomInt(0, canvasSnake.width / gridSize) * gridSize;
                food.y = getRandomInt(0, canvasSnake.height / gridSize) * gridSize;
            }
            // Collision with self
            for (let i = index + 1; i < snake2.cells.length; i++) {
                if (cell.x === snake2.cells[i].x && cell.y === snake2.cells[i].y) endGameSnake("Speler 1 (Pink) Wint!");
            }
        });

        // Collision between snakes
        for(let i = 0; i < snake1.cells.length; i++) {
            for(let j = 0; j < snake2.cells.length; j++) {
                if(snake1.cells[i].x === snake2.cells[j].x && snake1.cells[i].y === snake2.cells[j].y) {
                    endGameSnake("Gelijkspel / Crash!");
                }
            }
        }
    };

    const endGameSnake = (msg) => {
        clearInterval(snakeInterval);
        snakeInterval = null;
        alert("Game Over: " + msg);
        alert("TikTok Queen Energy"); // Easter egg
        updateHighScore("Snake", Math.max(snakeP1Score, snakeP2Score));
    };

    document.addEventListener('keydown', (e) => {
        // P1 WASD
        if (e.key === 'a' && snake1.dx === 0) { snake1.dx = -gridSize; snake1.dy = 0; }
        else if (e.key === 'w' && snake1.dy === 0) { snake1.dy = -gridSize; snake1.dx = 0; }
        else if (e.key === 'd' && snake1.dx === 0) { snake1.dx = gridSize; snake1.dy = 0; }
        else if (e.key === 's' && snake1.dy === 0) { snake1.dy = gridSize; snake1.dx = 0; }

        // P2 Arrows
        if (e.key === 'ArrowLeft' && snake2.dx === 0) { snake2.dx = -gridSize; snake2.dy = 0; e.preventDefault(); }
        else if (e.key === 'ArrowUp' && snake2.dy === 0) { snake2.dy = -gridSize; snake2.dx = 0; e.preventDefault(); }
        else if (e.key === 'ArrowRight' && snake2.dx === 0) { snake2.dx = gridSize; snake2.dy = 0; e.preventDefault(); }
        else if (e.key === 'ArrowDown' && snake2.dy === 0) { snake2.dy = gridSize; snake2.dx = 0; e.preventDefault(); }
    });

    document.getElementById('btn-start-snake').addEventListener('click', () => {
        if (!snakeInterval) {
            resetSnake();
            snakeInterval = setInterval(gameLoopSnake, 100);
        }
    });

    // ==========================================
    // Game 2: Miranda Reaction Clicker
    // ==========================================
    const reactionWord = document.getElementById('reaction-word');
    let reactionP1 = 0, reactionP2 = 0;
    const rp1El = document.getElementById('reaction-p1-score');
    const rp2El = document.getElementById('reaction-p2-score');
    let reactionState = 'idle'; // idle, waiting, ready
    let reactionTimeout;

    const resetReaction = () => {
        reactionWord.innerText = "WAIT...";
        reactionWord.style.color = "white";
        reactionState = 'idle';
    };

    const startReactionRound = () => {
        resetReaction();
        reactionState = 'waiting';
        const delay = Math.random() * 3000 + 1000;
        reactionTimeout = setTimeout(() => {
            reactionState = 'ready';
            reactionWord.innerText = "MIRANDA!";
            reactionWord.style.color = "var(--primary-color)";
        }, delay);
    };

    document.addEventListener('keydown', (e) => {
        if(reactionState === 'idle') return;

        if (e.key.toLowerCase() === 'f') {
            if (reactionState === 'ready') {
                reactionP1++; rp1El.innerText = reactionP1;
                reactionWord.innerText = "P1 SCORES!";
                checkReactionWin();
            } else if (reactionState === 'waiting') {
                reactionP1--; rp1El.innerText = reactionP1;
                reactionWord.innerText = "P1 TE VROEG!";
                clearTimeout(reactionTimeout);
                setTimeout(startReactionRound, 1000);
            }
        }
        if (e.key.toLowerCase() === 'j') {
            if (reactionState === 'ready') {
                reactionP2++; rp2El.innerText = reactionP2;
                reactionWord.innerText = "P2 SCORES!";
                checkReactionWin();
            } else if (reactionState === 'waiting') {
                reactionP2--; rp2El.innerText = reactionP2;
                reactionWord.innerText = "P2 TE VROEG!";
                clearTimeout(reactionTimeout);
                setTimeout(startReactionRound, 1000);
            }
        }
    });

    const checkReactionWin = () => {
        reactionState = 'idle';
        if (reactionP1 >= 5) {
            alert("Speler 1 wint!");
            updateHighScore("Reaction", reactionP1);
            reactionP1 = 0; reactionP2 = 0; rp1El.innerText=0; rp2El.innerText=0;
        } else if (reactionP2 >= 5) {
            alert("Speler 2 wint!");
            updateHighScore("Reaction", reactionP2);
            reactionP1 = 0; reactionP2 = 0; rp1El.innerText=0; rp2El.innerText=0;
        } else {
            setTimeout(startReactionRound, 1500);
        }
    };

    document.getElementById('btn-start-reaction').addEventListener('click', () => {
        reactionP1 = 0; reactionP2 = 0; rp1El.innerText=0; rp2El.innerText=0;
        startReactionRound();
    });

    // ==========================================
    // Game 3: Cheerio Catch
    // ==========================================
    const canvasCatch = document.getElementById('cheerioCanvas');
    const ctxCatch = canvasCatch.getContext('2d');
    let catchScore = 0, catchLives = 3;
    const cScoreEl = document.getElementById('cheerio-score');
    const cLivesEl = document.getElementById('cheerio-lives');
    
    let basket = { x: 175, y: 270, width: 50, height: 20, dx: 0, speed: 5 };
    let cheerios = [];
    let catchInterval, cheerioSpawner;

    const gameLoopCatch = () => {
        ctxCatch.clearRect(0, 0, canvasCatch.width, canvasCatch.height);

        // Move Basket
        basket.x += basket.dx;
        if (basket.x < 0) basket.x = 0;
        if (basket.x + basket.width > canvasCatch.width) basket.x = canvasCatch.width - basket.width;

        // Draw Basket
        ctxCatch.fillStyle = 'var(--secondary-color)';
        ctxCatch.fillRect(basket.x, basket.y, basket.width, basket.height);

        // Move & Draw Cheerios
        ctxCatch.fillStyle = 'orange';
        for (let i = 0; i < cheerios.length; i++) {
            let c = cheerios[i];
            c.y += c.speed;
            
            // Draw circle
            ctxCatch.beginPath();
            ctxCatch.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            ctxCatch.fill();
            ctxCatch.closePath();

            // Check Catch
            if (c.y + c.radius >= basket.y && c.y - c.radius <= basket.y + basket.height && 
                c.x >= basket.x && c.x <= basket.x + basket.width) {
                catchScore += 10;
                cScoreEl.innerText = catchScore;
                cheerios.splice(i, 1);
                i--;
            } 
            // Check Miss
            else if (c.y > canvasCatch.height) {
                catchLives--;
                cLivesEl.innerText = catchLives;
                cheerios.splice(i, 1);
                i--;
                if (catchLives <= 0) {
                    endGameCatch();
                }
            }
        }
    };

    const spawnCheerio = () => {
        let speed = 2 + (catchScore / 50); // Gets faster
        cheerios.push({
            x: Math.random() * (canvasCatch.width - 20) + 10,
            y: -10,
            radius: 8,
            speed: speed
        });
    };

    const endGameCatch = () => {
        clearInterval(catchInterval);
        clearInterval(cheerioSpawner);
        catchInterval = null;
        alert("Game Over! Je score was: " + catchScore);
        updateHighScore("Cheerio", catchScore);
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') basket.dx = -basket.speed;
        if (e.key === 'ArrowRight') basket.dx = basket.speed;
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') basket.dx = 0;
    });

    document.getElementById('btn-start-cheerio').addEventListener('click', () => {
        if (!catchInterval) {
            catchScore = 0; catchLives = 3;
            cScoreEl.innerText = catchScore; cLivesEl.innerText = catchLives;
            cheerios = [];
            basket.x = 175;
            catchInterval = setInterval(gameLoopCatch, 20);
            cheerioSpawner = setInterval(spawnCheerio, 1000);
        }
    });

    // ==========================================
    // Game 4: Quiz
    // ==========================================
    let currentQ = 0;
    let quizScore = 0;
    const qEl = document.getElementById('quiz-question');
    const optEl = document.getElementById('quiz-options');
    const qScoreEl = document.getElementById('quiz-score');

    const loadQuestion = () => {
        if (currentQ >= quizQuestions.length) {
            qEl.innerText = "Quiz Afgelopen!";
            optEl.innerHTML = "";
            if (quizScore === quizQuestions.length) {
                alert("Official Lore Master"); // Easter egg
            }
            updateHighScore("Quiz", quizScore);
            return;
        }

        const q = quizQuestions[currentQ];
        qEl.innerText = q.question;
        optEl.innerHTML = '';
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.innerText = opt;
            btn.onclick = () => {
                if (index === q.correct) {
                    quizScore++;
                    qScoreEl.innerText = quizScore;
                }
                currentQ++;
                loadQuestion();
            };
            optEl.appendChild(btn);
        });
    };

    document.getElementById('btn-start-quiz').addEventListener('click', () => {
        currentQ = 0;
        quizScore = 0;
        qScoreEl.innerText = quizScore;
        loadQuestion();
    });

    // ==========================================
    // Game 5: Button Battle
    // ==========================================
    let battleP1 = 0, battleP2 = 0;
    let battleTime = 10.0;
    let battleInterval;
    let battleActive = false;
    const bP1El = document.getElementById('battle-p1-score');
    const bP2El = document.getElementById('battle-p2-score');
    const bTimerEl = document.getElementById('battle-timer');

    document.addEventListener('keydown', (e) => {
        if (!battleActive) return;
        
        if (e.key.toLowerCase() === 'a') {
            battleP1++;
            bP1El.innerText = battleP1;
        }
        if (e.key.toLowerCase() === 'l') {
            battleP2++;
            bP2El.innerText = battleP2;
        }
    });

    document.getElementById('btn-start-battle').addEventListener('click', () => {
        if (battleActive) return;
        
        battleP1 = 0; battleP2 = 0;
        bP1El.innerText = 0; bP2El.innerText = 0;
        battleTime = 10.0;
        battleActive = true;
        
        battleInterval = setInterval(() => {
            battleTime -= 0.1;
            bTimerEl.innerText = battleTime.toFixed(1);
            
            // Chaos effect
            if(Math.random() > 0.8) {
                document.getElementById('game-button-battle').classList.add('shake');
                setTimeout(() => document.getElementById('game-button-battle').classList.remove('shake'), 100);
            }

            if (battleTime <= 0) {
                clearInterval(battleInterval);
                battleActive = false;
                bTimerEl.innerText = "0.0";
                
                let winner = "Gelijkspel";
                if (battleP1 > battleP2) winner = "Speler 1 wint!";
                if (battleP2 > battleP1) winner = "Speler 2 wint!";
                alert("Tijd om! " + winner);
                updateHighScore("Button Battle", Math.max(battleP1, battleP2));
            }
        }, 100);
    });
});
