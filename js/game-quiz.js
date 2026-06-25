const qEl = document.getElementById('question');
const optEl = document.getElementById('options');
const scoreEl = document.getElementById('score');

let currentQ = 0;
let score = 0;

function loadQuestion() {
    if (currentQ >= quizQuestions.length) {
        qEl.innerText = "Quiz Afgelopen!";
        optEl.innerHTML = "";
        
        // Save to leaderboard
        let saved = JSON.parse(localStorage.getItem('miranda_leaderboard')) || [];
        let existing = saved.find(e => e.game === "Quiz");
        if (!existing || score > existing.score) {
            if(!existing) existing = { game: "Quiz", score: score, name: "Fan" };
            else existing.score = score;
            let pName = prompt(`Nieuwe High Score (${score}/${quizQuestions.length})! Wat is je naam?`, existing.name);
            if(pName) {
                existing.name = pName;
                if(!saved.find(e => e.game === "Quiz")) saved.push(existing);
                localStorage.setItem('miranda_leaderboard', JSON.stringify(saved));
            }
        }
        
        const restartBtn = document.createElement('button');
        restartBtn.className = 'option-btn';
        restartBtn.innerText = "Opnieuw Spelen";
        restartBtn.onclick = () => {
            currentQ = 0; score = 0; scoreEl.innerText = score; loadQuestion();
        };
        optEl.appendChild(restartBtn);
        return;
    }

    const q = quizQuestions[currentQ];
    qEl.innerText = q.question;
    optEl.innerHTML = '';
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (index === q.correct) {
                score++;
                scoreEl.innerText = score;
            }
            currentQ++;
            loadQuestion();
        };
        optEl.appendChild(btn);
    });
}

document.getElementById('btn-start').addEventListener('click', () => {
    currentQ = 0;
    score = 0;
    scoreEl.innerText = score;
    loadQuestion();
});
