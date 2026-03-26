// 1. Data Bank
const quizData = {
    programming: [
        { q: "Which language is used for web styling?", a: ["HTML", "CSS", "Python", "Java"], correct: 1 },
        { q: "What does DOM stand for?", a: ["Document Object Model", "Data Object Mode", "Digital Ordinance Model", "Desktop Object Map"], correct: 0 },
        { q: "Which keyword is used to declare a constant in JS?", a: ["let", "var", "const", "fixed"], correct: 2 },
        { q: "What is the correct syntax for an arrow function?", a: ["() => {}", "function => {}", "[] -> {}", "() -> {}"], correct: 0 },
        { q: "Which array method adds an element to the end?", a: ["pop()", "shift()", "push()", "unshift()"], correct: 2 }
        // Add more questions here to reach 50
    ],
    gk: [
        { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
        { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Picasso", "Da Vinci", "Monet"], correct: 2 },
        { q: "What is the capital of France?", a: ["Berlin", "Madrid", "Rome", "Paris"], correct: 3 },
        { q: "Which ocean is the largest?", a: ["Atlantic", "Indian", "Pacific", "Arctic"], correct: 2 }
    ],
    aptitude: [
        { q: "If 5 apples cost $10, how much do 8 apples cost?", a: ["$12", "$14", "$16", "$18"], correct: 2 },
        { q: "What is the next number: 2, 4, 8, 16, ...?", a: ["24", "30", "32", "64"], correct: 2 },
        { q: "Which is the prime number?", a: ["4", "9", "11", "15"], correct: 2 }
    ]
};

// 2. State Variables
let currentTopic = "";
let questionCount = 5;
let currentQuestions = [];
let userAnswers = [];
let currentIndex = 0;
let timerInterval;
let timeLeft = 0;

// 3. Selectors
const screens = document.querySelectorAll('.screen');
const topicCards = document.querySelectorAll('.topic-card');
const countBtns = document.querySelectorAll('.count-btn');
const startBtn = document.getElementById('start-btn');
const optionsContainer = document.getElementById('options-container');

// 4. Topic & Settings Logic
topicCards.forEach(card => {
    card.addEventListener('click', () => {
        topicCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        currentTopic = card.dataset.topic;
        document.getElementById('settings-area').classList.remove('hidden');
    });
});

countBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        countBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        questionCount = parseInt(btn.dataset.count);
    });
});

startBtn.addEventListener('click', startQuiz);

// 5. Quiz Engine
function startQuiz() {
    // Filter and Shuffle Questions
    let allQuestions = [...quizData[currentTopic]];
    // If we have fewer questions than requested, use all available
    let limit = Math.min(questionCount, allQuestions.length);
    currentQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, limit);
    
    // Set Timer
    const times = { 5: 60, 10: 120, 20: 300, 30: 420, 40: 600, 50: 900 };
    timeLeft = times[questionCount] || 60;
    
    userAnswers = new Array(currentQuestions.length).fill(null);
    currentIndex = 0;
    
    showScreen('quiz-screen');
    startTimer();
    renderQuestion();
}

function renderQuestion() {
    const q = currentQuestions[currentIndex];
    document.getElementById('question-text').innerText = q.q;
    document.getElementById('current-q').innerText = currentIndex + 1;
    document.getElementById('total-q').innerText = currentQuestions.length;
    
    // Progress Bar
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;

    optionsContainer.innerHTML = "";
    q.a.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = `option ${userAnswers[currentIndex] === i ? 'selected' : ''}`;
        div.innerText = opt;
        div.onclick = () => selectOption(i);
        optionsContainer.appendChild(div);
    });

    document.getElementById('prev-btn').disabled = currentIndex === 0;
    document.getElementById('next-btn').innerText = currentIndex === currentQuestions.length - 1 ? "Finish" : "Next";
}

function selectOption(index) {
    // 1. Save the user's choice
    userAnswers[currentIndex] = index;
    
    // 2. Identify correct/wrong for the sound effect
    const correctAnswerIndex = currentQuestions[currentIndex].correct;
    const soundCorrect = document.getElementById('sound-correct');
    const soundWrong = document.getElementById('sound-wrong');

    // 3. Play the appropriate sound
    // We reset currentTime to 0 so the sound plays immediately even on rapid clicks
    if (index === correctAnswerIndex) {
        soundCorrect.currentTime = 0; 
        soundCorrect.play().catch(e => console.log("Playback prevented"));
    } else {
        soundWrong.currentTime = 0;
        soundWrong.play().catch(e => console.log("Playback prevented"));
    }

    // 4. Re-render to show the 'selected' visual state
    renderQuestion();

}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('time-left').innerText = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showResults();
        }
    }, 1000);
}

// 6. Navigation
document.getElementById('next-btn').onclick = () => {
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        showResults();
    }
};

document.getElementById('prev-btn').onclick = () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
};

// 7. Results Logic
function showResults() {
    clearInterval(timerInterval);
    showScreen('result-screen');
    
    let correctCount = 0;
    currentQuestions.forEach((q, i) => {
        if (userAnswers[i] === q.correct) correctCount++;
    });

    const percent = Math.round((correctCount / currentQuestions.length) * 100);
    const passed = percent >= 50;

    document.getElementById('score-percent').innerText = `${percent}%`;
    document.getElementById('stat-total').innerText = currentQuestions.length;
    document.getElementById('stat-correct').innerText = correctCount;
    document.getElementById('stat-wrong').innerText = currentQuestions.length - correctCount;
    
    const msg = document.getElementById('result-message');
    msg.innerText = passed ? "Congratulations!" : "You failed. Try again!";
    msg.style.color = passed ? "var(--success)" : "var(--danger)";

    // Play Sound (Optional)
    const sound = passed ? document.getElementById('sound-correct') : document.getElementById('sound-wrong');
    sound.play().catch(() => {}); // Catch block avoids errors if browser blocks autoplay
}

function showScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

document.getElementById('restart-btn').onclick = () => location.reload();