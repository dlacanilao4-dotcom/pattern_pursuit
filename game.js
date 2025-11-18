const colors = ["Red","Blue","Green","Yellow","Purple"];
const shapes = ["Circle","Square","Star","Triangle","Hexagon"];
const patterns = ["Solid","Striped","Dotted"];

let items = [];
let targetIndex = null;
let clues = [];
let currentClueIndex = 0;
let lives = 3;

let score = 0;
let timer = 30; // seconds
let timerInterval = null;

const board = document.getElementById("board");
const clueBox = document.getElementById("clueBox");
const livesText = document.getElementById("lives");

// Difficulty settings
const difficulties = {
    Easy: {tiles: 16, timer: 45},
    Moderate: {tiles: 36, timer: 30},
    Hard: {tiles: 56, timer: 20}
};

let currentDifficulty = "Easy";

// --- Update UI ---
function updateLives() {
    livesText.textContent = `Lives: ${lives} | Score: ${score} | Time: ${timer}s | Level: ${currentDifficulty}`;
}

function updateLevel() {
    clueBox.innerHTML = `${currentDifficulty} - ${clues[currentClueIndex].text}`;
}

// --- Timer ---
function startTimer() {
    clearInterval(timerInterval);
    timer = difficulties[currentDifficulty].timer;
    updateLives();
    timerInterval = setInterval(() => {
        timer--;
        updateLives();
        if (timer <= 0) {
            clearInterval(timerInterval);
            clueBox.innerHTML = "⏰ Time's up! Game Over.";
            revealCorrectAnswer();
            disableAll();
        }
    }, 1000);
}

// --- Disable all cards ---
function disableAll() {
    document.querySelectorAll(".item").forEach(card => {
        card.classList.add("disabled");
    });
}

// --- Reveal correct target ---
function revealCorrectAnswer() {
    const correctCard = document.querySelector(`[data-index='${targetIndex}']`);
    if(correctCard) correctCard.classList.add("correct");
}

// --- Generate grid for current difficulty ---
function generateGrid() {
    board.innerHTML = "";
    items = [];
    let tiles = difficulties[currentDifficulty].tiles;

    let columns = Math.ceil(Math.sqrt(tiles));
    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    for (let i = 0; i < tiles; i++) {
        let obj = {
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            pattern: patterns[Math.floor(Math.random() * patterns.length)],
            index: i
        };
        items.push(obj);

        let div = document.createElement("div");
        div.className = `item ${obj.color} ${obj.pattern} ${obj.shape}`;
        div.dataset.index = i;

        let shapeEl = document.createElement("div");
        shapeEl.className = "shape"; // fixed to show shapes
        div.appendChild(shapeEl);

        div.onclick = () => selectItem(i);
        board.appendChild(div);
    }
}

// --- Generate clues for target ---
function generateCluesForTarget(target) {
    let t = items[target];
    let generated = [];

    generated.push({
        text: `The target is a <b>${t.color}</b> item.`,
        rule: item => item.color === t.color
    });
    generated.push({
        text: `The target has the <b>${t.shape}</b> shape.`,
        rule: item => item.shape === t.shape
    });
    generated.push({
        text: `The target has a <b>${t.pattern}</b> pattern.`,
        rule: item => item.pattern === t.pattern
    });

    return shuffleArray(generated).slice(0, 3);
}

function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function applyClue() {
    clueBox.innerHTML = `${currentDifficulty} - ${clues[currentClueIndex].text}`;
}

// --- Start Level ---
function startLevel() {
    generateGrid();
    targetIndex = Math.floor(Math.random() * items.length);
    clues = generateCluesForTarget(targetIndex);
    currentClueIndex = 0;
    lives = 3;
    updateLives();
    applyClue();
    startTimer();
}

// --- Click logic ---
function selectItem(i) {
    if (lives <= 0 || timer <= 0) return;

    let card = document.querySelector(`[data-index='${i}']`);

    if (i === targetIndex) {
        card.classList.add("correct");
        score += timer * 10; // bonus points for remaining time
        clueBox.innerHTML = `🎉 Correct!`;

        clearInterval(timerInterval);

        // advance difficulty
        if (currentDifficulty === "Easy") currentDifficulty = "Moderate";
        else if (currentDifficulty === "Moderate") currentDifficulty = "Hard";
        else {
            clueBox.innerHTML = `🏆 You completed all levels! Final Score: ${score}`;
            disableAll();
            return;
        }

        setTimeout(startLevel, 1000);
        return;
    }

    // wrong guess
    card.classList.add("disabled");
    lives--;
    score = Math.max(score - 5, 0);
    updateLives();

    if (lives <= 0) {
        clearInterval(timerInterval);
        clueBox.innerHTML = `💀 GAME OVER — The correct item is highlighted.`;
        revealCorrectAnswer();
        disableAll();
        return;
    }

    clueBox.innerHTML = "❌ Wrong! Try again.";
    currentClueIndex++;
    if (currentClueIndex < clues.length) {
        setTimeout(applyClue, 900);
    } else {
        clueBox.innerHTML += "<br><i>No more clues!</i>";
    }
}

// --- Start button ---
document.getElementById("startBtn").onclick = () => {
    currentDifficulty = "Easy";
    score = 0;
    startLevel();
};
