const box = document.getElementById('reflex-box');
const text = document.getElementById('reflex-text');

let state = 'idle'; // idle, waiting, ready
let timeoutId;
let startTime;

function startRound() {
    state = 'waiting';
    box.className = 'reflex-container';
    text.innerText = "Wacht op MIRANDA...";
    
    let delay = Math.random() * 3000 + 1000;
    timeoutId = setTimeout(() => {
        state = 'ready';
        box.className = 'reflex-container ready';
        text.innerText = "MIRANDA! (KLIK)";
        startTime = Date.now();
    }, delay);
}

function handleInput() {
    if (state === 'idle' || state === 'done') {
        startRound();
    } else if (state === 'waiting') {
        clearTimeout(timeoutId);
        state = 'done';
        box.className = 'reflex-container wrong';
        text.innerText = "TE VROEG! Klik om opnieuw te proberen.";
    } else if (state === 'ready') {
        let reactionTime = Date.now() - startTime;
        state = 'done';
        box.className = 'reflex-container';
        text.innerText = `${reactionTime} ms! Klik om opnieuw te proberen.`;
        
        let saved = JSON.parse(localStorage.getItem('miranda_leaderboard')) || [];
        let existing = saved.find(e => e.game === "Reaction");
        if (!existing || reactionTime < existing.score) {
            if(!existing) existing = { game: "Reaction", score: reactionTime, name: "Fan" };
            else existing.score = reactionTime;
            let pName = prompt(`Nieuwe High Score (${reactionTime}ms)! Wat is je naam?`, existing.name);
            if(pName) {
                existing.name = pName;
                if(!saved.find(e => e.game === "Reaction")) saved.push(existing);
                localStorage.setItem('miranda_leaderboard', JSON.stringify(saved));
            }
        }
    }
}

box.addEventListener('mousedown', handleInput);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') handleInput();
});
