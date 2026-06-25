// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar & Hamburger
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // 2. Dark/Light Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });

    // 3. Chaos Mode Toggle
    const chaosToggle = document.getElementById('chaos-toggle');
    chaosToggle.addEventListener('click', () => {
        document.body.classList.toggle('chaos-mode');
        // Add random shake to all cards briefly
        const cards = document.querySelectorAll('.neon-card');
        cards.forEach(card => {
            card.classList.add('shake');
            setTimeout(() => card.classList.remove('shake'), 500);
        });
    });

    // 4. Legend Meter
    const legendMeterFill = document.getElementById('legend-meter-fill');
    let legendClicks = 0;
    
    // Add click event to all buttons to fill the meter
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('btn')) {
            legendClicks += 2;
            if (legendClicks > 100) legendClicks = 100;
            legendMeterFill.style.width = legendClicks + '%';
        }
    });

    // 5. Easter Egg: 5 clicks on Title
    const brandTitle = document.getElementById('brand-title');
    let titleClicks = 0;
    brandTitle.addEventListener('click', () => {
        titleClicks++;
        if (titleClicks === 5) {
            alert('MIRANDA LORE UNLOCKED');
            titleClicks = 0; // reset
        }
    });

    // 6. Inject Timeline Data
    const timelineContainer = document.getElementById('timeline-container');
    if (typeof timelineData !== 'undefined') {
        timelineData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <div class="timeline-date">${item.date}</div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            `;
            timelineContainer.appendChild(div);
        });
    }

    // 7. Inject Video Cards
    const videoGrid = document.getElementById('video-grid');
    if (typeof videoCards !== 'undefined') {
        videoCards.forEach(video => {
            const div = document.createElement('div');
            div.className = 'card neon-card';
            div.innerHTML = `
                <h3>${video.title}</h3>
                <p>${video.desc}</p>
                <div class="card-placeholder">${video.thumb}</div>
                <button class="btn btn-small btn-primary" style="margin-top: 1rem;">Bekijk clip</button>
            `;
            videoGrid.appendChild(div);
        });
    }

    // 8. Intersection Observer for Fade-Ins
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    fadeEls.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });

    // 9. Leaderboard UI Loading
    window.loadLeaderboard = () => {
        let savedLeaderboard = JSON.parse(localStorage.getItem('miranda_leaderboard'));
        if (!savedLeaderboard) {
            savedLeaderboard = leaderboardDefaults;
            localStorage.setItem('miranda_leaderboard', JSON.stringify(savedLeaderboard));
        }

        const tbody = document.getElementById('leaderboard-body');
        tbody.innerHTML = '';
        savedLeaderboard.forEach(entry => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${entry.game}</td>
                <td>${entry.score}</td>
                <td>${entry.name}</td>
            `;
            tbody.appendChild(tr);
        });
    };
    
    // Initial load
    window.loadLeaderboard();

    // 10. Fan Zone Logic
    const loadFanMessages = () => {
        let savedMessages = JSON.parse(localStorage.getItem('miranda_fan_messages'));
        if (!savedMessages) {
            savedMessages = defaultFanMessages;
            localStorage.setItem('miranda_fan_messages', JSON.stringify(savedMessages));
        }

        const container = document.getElementById('fan-messages-container');
        container.innerHTML = '';
        savedMessages.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'fan-message-card';
            div.innerHTML = `
                <div class="fan-message-name">${msg.name}</div>
                <div>${msg.message}</div>
            `;
            container.appendChild(div);
        });
    };

    // Initial load
    loadFanMessages();

    document.getElementById('btn-post-message').addEventListener('click', () => {
        const nameInput = document.getElementById('fan-name');
        const msgInput = document.getElementById('fan-message');
        const name = nameInput.value.trim() || 'Anonieme Fan';
        const msg = msgInput.value.trim();

        if (msg) {
            let savedMessages = JSON.parse(localStorage.getItem('miranda_fan_messages')) || [];
            savedMessages.unshift({ name, message: msg });
            localStorage.setItem('miranda_fan_messages', JSON.stringify(savedMessages));
            
            // clear inputs and reload
            nameInput.value = '';
            msgInput.value = '';
            loadFanMessages();
        }
    });
});
