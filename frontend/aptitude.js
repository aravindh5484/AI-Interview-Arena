const userName = localStorage.getItem("userName");
const userEmail = localStorage.getItem("userEmail");

if (!userName || !userEmail) {
    window.location.href = "index.html";
}

document.getElementById("topUserName").innerText = userName;
document.getElementById("avatarLetter").innerText = userName.charAt(0).toUpperCase();

let usage = JSON.parse(localStorage.getItem("dashboardUsage")) || null;

if (!usage) {
    window.location.href = "dashboard.html";
}

document.getElementById("streamName").innerText = usage.stream;
document.getElementById("difficultyName").innerText = usage.difficulty;

const questionContainer = document.getElementById("questionContainer");
const resultPanel = document.getElementById("resultPanel");
const resultSummary = document.getElementById("resultSummary");
const answerReview = document.getElementById("answerReview");
const scoreBadge = document.getElementById("scoreBadge");

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function pushScore(arr, val) {
    arr.shift();
    arr.push(Math.min(val, 100));
}

function makeQuestion(question, options, answer) {
    return { question, options, answer };
}

function generateGeneralQuantQuestions() {
    const bank = [];

    for (let i = 1; i <= 25; i++) {
        const a = 10 + i;
        const b = 5 + i;
        bank.push(makeQuestion(
            `What is ${a} + ${b}?`,
            [`${a + b}`, `${a + b + 1}`, `${a + b - 1}`, `${a + b + 2}`],
            `${a + b}`
        ));
    }

    for (let i = 1; i <= 20; i++) {
        const a = 12 + i;
        const b = 3 + i;
        bank.push(makeQuestion(
            `What is ${a * b} ÷ ${b}?`,
            [`${a}`, `${b}`, `${a + b}`, `${a - 1}`],
            `${a}`
        ));
    }

    for (let i = 1; i <= 15; i++) {
        const base = 100 + i * 10;
        const percent = 10 + i;
        const ans = (base * percent) / 100;
        bank.push(makeQuestion(
            `What is ${percent}% of ${base}?`,
            [`${ans}`, `${ans + 10}`, `${ans - 5}`, `${percent}`],
            `${ans}`
        ));
    }

    return bank;
}

function generateLogicalQuestions() {
    const bank = [
        makeQuestion("Find the next number: 2, 4, 8, 16, ?", ["18", "24", "32", "30"], "32"),
        makeQuestion("Find the next number: 5, 10, 15, 20, ?", ["25", "30", "35", "40"], "25"),
        makeQuestion("Odd one out: Apple, Mango, Carrot, Banana", ["Apple", "Mango", "Carrot", "Banana"], "Carrot"),
        makeQuestion("Odd one out: Circle, Triangle, Square, Table", ["Circle", "Triangle", "Square", "Table"], "Table"),
        makeQuestion("Clock angle at 3:00 is", ["0°", "45°", "90°", "180°"], "90°"),
        makeQuestion("Series: A, C, E, G, ?", ["H", "I", "J", "K"], "I")
    ];

    while (bank.length < 25) {
        const n = bank.length + 1;
        bank.push(makeQuestion(
            `Find the next number: ${n}, ${n + 2}, ${n + 4}, ${n + 6}, ?`,
            [`${n + 8}`, `${n + 9}`, `${n + 10}`, `${n + 7}`],
            `${n + 8}`
        ));
    }

    return bank;
}

function generateVerbalQuestions() {
    const bank = [
        makeQuestion("Choose the synonym of 'Rapid'", ["Slow", "Fast", "Dull", "Weak"], "Fast"),
        makeQuestion("Choose the antonym of 'Strong'", ["Powerful", "Firm", "Weak", "Active"], "Weak"),
        makeQuestion("Fill in the blank: She ___ to college every day.", ["go", "goes", "gone", "going"], "goes"),
        makeQuestion("Choose the correct spelling.", ["Enviroment", "Environment", "Enviornment", "Envirnoment"], "Environment"),
        makeQuestion("Choose the synonym of 'Accurate'", ["Wrong", "Exact", "Lazy", "Loose"], "Exact"),
        makeQuestion("Choose the antonym of 'Expand'", ["Grow", "Shrink", "Increase", "Rise"], "Shrink")
    ];

    while (bank.length < 20) {
        bank.push(makeQuestion(
            "Choose the synonym of 'Brave'",
            ["Coward", "Bold", "Weak", "Shy"],
            "Bold"
        ));
    }

    return bank;
}

function generateBTechSpecific() {
    const bank = [
        makeQuestion("Which data structure follows FIFO?", ["Stack", "Queue", "Tree", "Graph"], "Queue"),
        makeQuestion("Which language is primarily used for web page styling?", ["Python", "CSS", "Java", "SQL"], "CSS"),
        makeQuestion("DBMS stands for", [
            "Database Management System",
            "Data Backup Management System",
            "Digital Base Mapping System",
            "Desktop Base Management System"
        ], "Database Management System"),
        makeQuestion("Which of these is a JavaScript library/framework?", ["React", "Oracle", "Linux", "Mongo"], "React"),
        makeQuestion("Which protocol is used to load web pages?", ["FTP", "HTTP", "SMTP", "SNMP"], "HTTP"),
        makeQuestion("Which database is NoSQL?", ["MySQL", "Oracle", "MongoDB", "PostgreSQL"], "MongoDB")
    ];

    while (bank.length < 30) {
        bank.push(makeQuestion(
            "Which concept is important in programming problem solving?",
            ["Memorizing only", "Logic building", "Ignoring errors", "No testing"],
            "Logic building"
        ));
    }

    return bank;
}

function generateBusinessSpecific() {
    const bank = [
        makeQuestion("ROI stands for", [
            "Return on Investment",
            "Rate of Interest",
            "Revenue on Income",
            "Return of Inventory"
        ], "Return on Investment"),
        makeQuestion("Which function is related to hiring and people management?", ["Finance", "HR", "Marketing", "Operations"], "HR"),
        makeQuestion("SWOT analysis includes", [
            "Strengths, Weaknesses, Opportunities, Threats",
            "Sales, Work, Output, Target",
            "Strategy, Work, Operations, Trade",
            "System, Web, Output, Tools"
        ], "Strengths, Weaknesses, Opportunities, Threats"),
        makeQuestion("Which department focuses on promoting products?", ["Marketing", "HR", "Audit", "Admin"], "Marketing")
    ];

    while (bank.length < 30) {
        bank.push(makeQuestion(
            "Which skill is most important in management roles?",
            ["Communication", "Silence", "Avoidance", "Delay"],
            "Communication"
        ));
    }

    return bank;
}

function generateGenericSpecific() {
    const bank = [
        makeQuestion("Which skill helps in placements across all fields?", [
            "Communication",
            "Ignoring feedback",
            "No preparation",
            "Late submission"
        ], "Communication"),
        makeQuestion("Which is important for problem solving?", [
            "Logical thinking",
            "Guessing always",
            "Avoiding practice",
            "Skipping basics"
        ], "Logical thinking")
    ];

    while (bank.length < 30) {
        bank.push(makeQuestion(
            "Which habit helps in aptitude improvement?",
            ["Regular practice", "No revision", "Random skipping", "No analysis"],
            "Regular practice"
        ));
    }

    return bank;
}

function buildQuestionBank(stream) {
    let bank = [
        ...generateGeneralQuantQuestions(),
        ...generateLogicalQuestions(),
        ...generateVerbalQuestions()
    ];

    if (stream === "B.Tech" || stream === "BCA" || stream === "MCA") {
        bank = [...bank, ...generateBTechSpecific()];
    } else if (stream === "BBA" || stream === "MBA") {
        bank = [...bank, ...generateBusinessSpecific()];
    } else {
        bank = [...bank, ...generateGenericSpecific()];
    }

    return shuffle(bank).slice(0, 100);
}

const fullBank = buildQuestionBank(usage.stream);
const selectedQuestions = shuffle(fullBank).slice(0, 10);

function renderQuestions() {
    questionContainer.innerHTML = "";

    selectedQuestions.forEach((q, index) => {
        const card = document.createElement("div");
        card.className = "question-card";

        const optionsHtml = q.options.map((opt) => {
            return `
              <label class="option-label">
                <input type="radio" name="q${index}" value="${opt}">
                <span>${opt}</span>
              </label>
            `;
        }).join("");

        card.innerHTML = `
          <h3>Q${index + 1}. ${q.question}</h3>
          <div class="option-list">${optionsHtml}</div>
        `;

        questionContainer.appendChild(card);
    });
}

function getSuggestion(scorePercent) {
    if (scorePercent >= 80) {
        return "Excellent aptitude performance. You showed strong accuracy and problem-solving ability.";
    }
    if (scorePercent >= 60) {
        return "Good performance. Improve speed and consistency for better placement readiness.";
    }
    if (scorePercent >= 40) {
        return "Average performance. Practice quant, logic, and accuracy regularly.";
    }
    return "Needs improvement. Focus on fundamentals, timed practice, and review of weak areas.";
}

function submitTest() {
    let score = 0;
    answerReview.innerHTML = "";

    selectedQuestions.forEach((q, index) => {
        const chosen = document.querySelector(`input[name="q${index}"]:checked`);
        const userAnswer = chosen ? chosen.value : "Not Answered";

        if (userAnswer === q.answer) {
            score += 1;
        }

        const review = document.createElement("div");
        review.className = "review-card";
        review.innerHTML = `
          <strong>Q${index + 1}. ${q.question}</strong>
          <p><strong>Your Answer:</strong> ${userAnswer}</p>
          <p><strong>Correct Answer:</strong> ${q.answer}</p>
        `;
        answerReview.appendChild(review);
    });

    const scorePercent = Math.round((score / 10) * 100);
    const technicalGain = Math.round(scorePercent / 10) + 4;
    const communicationGain = Math.round(scorePercent / 20) + 2;
    const confidenceGain = Math.round(scorePercent / 15) + 3;

    usage.interviewsStarted += 1;
    usage.interviewType = "Aptitude Test";
    usage.lastInterviewScore = score;
    usage.lastInterviewAverage = scorePercent;
    usage.lastInterviewSuggestion = getSuggestion(scorePercent);

    pushScore(usage.technicalScores, usage.technicalScores.at(-1) + technicalGain);
    pushScore(usage.communicationScores, usage.communicationScores.at(-1) + communicationGain);
    pushScore(usage.confidenceScores, usage.confidenceScores.at(-1) + confidenceGain);

    localStorage.setItem("dashboardUsage", JSON.stringify(usage));

    scoreBadge.innerText = `${score} / 10`;
    resultSummary.innerText = `You scored ${score} out of 10 (${scorePercent}%). ${usage.lastInterviewSuggestion}`;

    resultPanel.classList.remove("hidden");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function goDashboard() {
    window.location.href = "dashboard.html";
}

renderQuestions();