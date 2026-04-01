const video = document.getElementById("cameraFeed");
const cameraStatus = document.getElementById("cameraStatus");
const questionText = document.getElementById("questionText");
const answerText = document.getElementById("answerText");
const questionCount = document.getElementById("questionCount");
const currentScoreEl = document.getElementById("currentScore");
const interviewStatus = document.getElementById("interviewStatus");
const startRoundBtn = document.getElementById("startRoundBtn");
const listenBtn = document.getElementById("listenBtn");
const nextBtn = document.getElementById("nextBtn");

const userName = localStorage.getItem("userName");
const userEmail = localStorage.getItem("userEmail");

if (!userName || !userEmail) {
    window.location.href = "index.html";
}

let usage = JSON.parse(localStorage.getItem("dashboardUsage")) || null;

if (!usage || !usage.generatedQuestions || usage.generatedQuestions.length === 0) {
    alert("No generated interview questions found. Please upload a resume again.");
    window.location.href = "dashboard.html";
}

const questions = usage.generatedQuestions;
const resumeKeywords = usage.resumeKeywords || [];

let currentQuestionIndex = -1;
let interviewScore = 0;
let recognition = null;

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        video.srcObject = stream;
        cameraStatus.innerText = "Camera and microphone are active";
    } catch (err) {
        console.error(err);
        cameraStatus.innerText = "Camera/Mic access denied";
    }
}

startCamera();

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function beginInterviewRound() {
    currentQuestionIndex = 0;
    interviewScore = 0;
    currentScoreEl.innerText = interviewScore;
    interviewStatus.innerText = "Question active";
    startRoundBtn.disabled = true;
    listenBtn.disabled = false;
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        finishInterview();
        return;
    }

    const q = questions[currentQuestionIndex];
    questionText.innerText = q;
    answerText.innerText = "Your spoken answer will appear here...";
    questionCount.innerText = `${currentQuestionIndex + 1} / ${questions.length}`;
    nextBtn.disabled = true;
    speak(q);
}

function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser. Use Chrome or Edge.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    interviewStatus.innerText = "Listening...";
    answerText.innerText = "Listening to your answer...";

    recognition.start();

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        answerText.innerText = transcript;

        const score = evaluateAnswer(transcript);
        interviewScore += score;

        currentScoreEl.innerText = interviewScore;
        interviewStatus.innerText = `Answer evaluated (+${score})`;
        nextBtn.disabled = false;
    };

    recognition.onerror = function () {
        interviewStatus.innerText = "Mic error";
        answerText.innerText = "Could not capture answer. Please try again.";
    };
}

function evaluateAnswer(answer) {
    let score = 0;
    const cleaned = answer.toLowerCase().trim();
    const words = cleaned.split(/\s+/).filter(Boolean).length;

    if (words >= 40) score += 8;
    else if (words >= 20) score += 6;
    else if (words >= 10) score += 4;
    else if (words >= 5) score += 2;

    let keywordHits = 0;
    resumeKeywords.forEach(keyword => {
        if (cleaned.includes(keyword.toLowerCase())) {
            keywordHits += 1;
        }
    });

    score += Math.min(keywordHits, 6);

    if (cleaned.includes("project")) score += 1;
    if (cleaned.includes("team")) score += 1;
    if (cleaned.includes("challenge")) score += 1;
    if (cleaned.includes("solution")) score += 1;

    return Math.min(score, 15);
}

function nextQuestion() {
    currentQuestionIndex += 1;
    interviewStatus.innerText = "Next question";
    loadQuestion();
}

function getSuggestionFromScore(avg) {
    if (avg >= 11) {
        return "Excellent performance. Your answers were strong, structured, and confident.";
    }
    if (avg >= 8) {
        return "Good performance. Improve answer depth and add more project-specific details.";
    }
    if (avg >= 5) {
        return "Average performance. Work on confidence, clarity, and giving complete answers.";
    }
    return "Needs improvement. Practice structured answers, key resume points, and communication clarity.";
}

function pushScore(arr, val) {
    arr.shift();
    arr.push(Math.min(val, 100));
}

function applyScoresToDashboard() {
    usage.interviewsStarted += 1;
    usage.interviewType = "Virtual Interview";

    const avgQuestionScore = Math.round(interviewScore / questions.length);

    const technicalGain = Math.min(avgQuestionScore + 4, 18);
    const communicationGain = Math.min(avgQuestionScore + 5, 18);
    const confidenceGain = Math.min(avgQuestionScore + 3, 18);

    const currentTechnical = usage.technicalScores[usage.technicalScores.length - 1];
    const currentCommunication = usage.communicationScores[usage.communicationScores.length - 1];
    const currentConfidence = usage.confidenceScores[usage.confidenceScores.length - 1];

    pushScore(usage.technicalScores, currentTechnical + technicalGain);
    pushScore(usage.communicationScores, currentCommunication + communicationGain);
    pushScore(usage.confidenceScores, currentConfidence + confidenceGain);

    usage.lastInterviewScore = interviewScore;
    usage.lastInterviewAverage = avgQuestionScore;
    usage.lastInterviewSuggestion = getSuggestionFromScore(avgQuestionScore);

    localStorage.setItem("dashboardUsage", JSON.stringify(usage));
}

function finishInterview() {
    questionText.innerText = "Interview Completed 🎉";
    answerText.innerText = "Your performance has been recorded and sent to the dashboard.";
    interviewStatus.innerText = "Completed";
    listenBtn.disabled = true;
    nextBtn.disabled = true;

    applyScoresToDashboard();

    setTimeout(() => {
        alert("Interview completed. Returning to dashboard.");
        window.location.href = "dashboard.html";
    }, 1200);
}

function endInterview() {
    window.location.href = "dashboard.html";
}