const btn = document.getElementById('mash-btn');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');

let score = 0;
let timeLeft = 10.0;
let active = false;
let intervalId;

function startGame() {
    score = 0;
    timeLeft = 10.0;
    scoreEl.innerText = score;
    active = true;
    btn.innerText = "MASH!";
    
    intervalId = setInterval(() => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) {
            timeLeft = 0;
            endGame();
        }
        timerEl.innerText = timeLeft.toFixed(1);
    }, 100);
}

function endGame() {
    active = false;
    clearInterval(intervalId);
    timerEl.innerText = "0.0";
    btn.innerText = "START";
    
    let saved = JSON.parse(localStorage.getItem('miranda_leaderboard')) || [];
    let existing = saved.find(e => e.game === "Button Battle");
    if (!existing || score > existing.score) {
        if(!existing) existing = { game: "Button Battle", score: score, name: "Fan" };
        else existing.score = score;
        let pName = prompt(`Nieuwe High Score (${score} clicks)! Wat is je naam?`, existing.name);
        if(pName) {
            existing.name = pName;
            if(!saved.find(e => e.game === "Button Battle")) saved.push(existing);
            localStorage.setItem('miranda_leaderboard', JSON.stringify(saved));
        }
    }
}

function handleMash() {
    if (!active) {
        startGame();
    } else {
        score++;
        scoreEl.innerText = score;
        // visual shake
        document.body.style.transform = `translate(${(Math.random()-0.5)*5}px, ${(Math.random()-0.5)*5}px)`;
        setTimeout(() => document.body.style.transform = 'translate(0,0)', 50);
    }
}

btn.addEventListener('mousedown', handleMash);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        handleMash();
        btn.style.transform = 'scale(0.95)';
    }
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') btn.style.transform = 'scale(1)';
});
