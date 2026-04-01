const API_URL = "https://ai-interview-backend-230t.onrender.com";

const userName = localStorage.getItem("userName");
const userEmail = localStorage.getItem("userEmail");

if (!userName || !userEmail) {
    window.location.href = "index.html";
}

document.getElementById("topUserName").innerText = userName;
document.getElementById("heroUserName").innerText = `Welcome, ${userName}`;
document.getElementById("profileName").innerText = userName;
document.getElementById("profileEmail").innerText = userEmail;
document.getElementById("avatarLetter").innerText = userName.charAt(0).toUpperCase();

const defaultUsage = {
    stream: "B.Tech",
    interviewType: "",
    difficulty: "Easy",
    interviewsStarted: 0,
    resumeUploads: 0,
    atsScore: 0,
    resumeUploaded: false,
    resumeKeywords: [],
    generatedQuestions: [],
    lastInterviewScore: 0,
    lastInterviewAverage: 0,
    lastInterviewSuggestion: "Upload your resume to unlock AI questions.",
    technicalScores: [0, 0, 0, 0, 0],
    communicationScores: [0, 0, 0, 0, 0],
    confidenceScores: [0, 0, 0, 0, 0]
};

let usage = JSON.parse(localStorage.getItem("dashboardUsage")) || defaultUsage;

if (!usage || usage.resumeUploaded === undefined) {
    usage = { ...defaultUsage };
    localStorage.setItem("dashboardUsage", JSON.stringify(usage));
}

function saveUsage() {
    localStorage.setItem("dashboardUsage", JSON.stringify(usage));
}

function updateDashboardPreferences() {
    usage.stream = document.getElementById("streamSelect").value;
    usage.interviewType = document.getElementById("interviewType").value;
    usage.difficulty = document.getElementById("difficultyLevel").value;
    saveUsage();
    renderDashboard();
    renderPerformanceChart();
}

function updateDifficultyByInterviewType() {
    const type = document.getElementById("interviewType").value;
    const difficultySelect = document.getElementById("difficultyLevel");

    let allowed = [];

    if (type === "Technical") allowed = ["Easy", "Medium", "Hard"];
    else if (type === "HR") allowed = ["Easy", "Medium"];
    else if (type === "Startup Founder") allowed = ["Medium", "Hard"];
    else if (type === "Friendly Mentor") allowed = ["Easy", "Medium"];
    else if (type === "Virtual Interview") allowed = ["Medium", "Hard"];
    else if (type === "Aptitude Test") allowed = ["Easy", "Medium", "Hard"];
    else allowed = ["Easy", "Medium"];

    difficultySelect.innerHTML = "";
    allowed.forEach(level => {
        const option = document.createElement("option");
        option.value = level;
        option.textContent = level;
        difficultySelect.appendChild(option);
    });

    usage.interviewType = type;
    usage.difficulty = allowed[0];
    saveUsage();
    renderDashboard();
    renderPerformanceChart();
}

function openFilePicker() {
    document.getElementById("resumeInput").click();
}

document.addEventListener("DOMContentLoaded", () => {
    const resumeInput = document.getElementById("resumeInput");

    if (resumeInput) {
        resumeInput.addEventListener("change", async function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("resume", file);
            formData.append("stream", usage.stream);
            formData.append("difficulty", usage.difficulty);

            try {
                const res = await fetch(`${API_URL}/upload-resume`, {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Could not upload the PDF");
                    return;
                }

                usage.resumeUploaded = true;
                usage.resumeUploads += 1;
                usage.atsScore = data.atsScore;
                usage.resumeKeywords = data.keywords || [];
                usage.generatedQuestions = data.questions || [];
                usage.lastInterviewSuggestion = "Resume analyzed. Your personalized questions are ready.";

                saveUsage();
                renderDashboard();
                renderPerformanceChart();

                alert(`Resume uploaded successfully.\nATS Score: ${usage.atsScore}%`);
            } catch (err) {
                console.error(err);
                alert("Could not upload the PDF");
            }
        });
    }
});

function renderDashboard() {
    document.getElementById("streamSelect").value = usage.stream;
    document.getElementById("interviewType").value = usage.interviewType || "Technical";
    document.getElementById("difficultyLevel").value = usage.difficulty;

    document.getElementById("currentStream").innerText = usage.stream;
    document.getElementById("statInterviews").innerText = usage.interviewsStarted;
    document.getElementById("statUploads").innerText = usage.resumeUploads;
    document.getElementById("statATS").innerText = usage.resumeUploaded ? `${usage.atsScore}%` : "--";
    document.getElementById("statDifficulty").innerText = usage.difficulty;

    document.getElementById("insightStream").innerText = usage.stream;
    document.getElementById("insightType").innerText = usage.interviewType || "Not selected";
    document.getElementById("recommendedFocus").innerText = usage.lastInterviewSuggestion || "Upload your resume to unlock AI questions.";

    const tagsBox = document.getElementById("focusTags");
    tagsBox.innerHTML = "";

    if (usage.resumeUploaded && usage.resumeKeywords.length > 0) {
        usage.resumeKeywords.forEach(tag => {
            const span = document.createElement("span");
            span.textContent = tag;
            tagsBox.appendChild(span);
        });
    } else {
        ["Upload", "Resume", "To Begin"].forEach(tag => {
            const span = document.createElement("span");
            span.textContent = tag;
            tagsBox.appendChild(span);
        });
    }

    const uploadBtn = document.getElementById("uploadBtn");
    const virtualBtn = document.getElementById("virtualBtn");
    const aptitudeBtn = document.getElementById("aptitudeBtn");
    const startBtn = document.getElementById("startBtn");

    if (!usage.resumeUploaded) {
        uploadBtn.style.display = "inline-block";
        virtualBtn.style.display = "none";
        aptitudeBtn.style.display = "none";
        startBtn.style.display = "none";
        return;
    }

    uploadBtn.style.display = "none";
    virtualBtn.style.display = "inline-block";
    aptitudeBtn.style.display = "inline-block";
    startBtn.style.display = usage.interviewType ? "inline-block" : "none";
}

function selectMode(type) {
    usage.interviewType = type;
    saveUsage();
    renderDashboard();
}

function pushScore(arr, val) {
    arr.shift();
    arr.push(Math.min(val, 100));
}

function startInterview() {
    if (usage.interviewType === "Virtual Interview") {
        window.location.href = "interview.html";
        return;
    }

    if (usage.interviewType === "Aptitude Test") {
        window.location.href = "aptitude.html";
        return;
    }

    usage.interviewsStarted += 1;
    pushScore(usage.technicalScores, usage.technicalScores.at(-1) + 10);
    pushScore(usage.communicationScores, usage.communicationScores.at(-1) + 8);
    pushScore(usage.confidenceScores, usage.confidenceScores.at(-1) + 7);

    usage.lastInterviewSuggestion = "Interview completed. Continue improving your clarity and project explanations.";

    saveUsage();
    renderDashboard();
    renderPerformanceChart();

    alert(`Starting ${usage.interviewType || "Interview"} 🚀`);
}

function renderPerformanceChart() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas) return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(canvas, {
        type: "line",
        data: {
            labels: ["Session 1", "Session 2", "Session 3", "Session 4", "Session 5"],
            datasets: [
                {
                    label: "Technical",
                    data: usage.technicalScores,
                    borderColor: "#7aa7ff",
                    backgroundColor: "rgba(122,167,255,0.15)",
                    tension: 0.4,
                    fill: true
                },
                {
                    label: "Communication",
                    data: usage.communicationScores,
                    borderColor: "#ffb68c",
                    backgroundColor: "rgba(255,182,140,0.12)",
                    tension: 0.4,
                    fill: true
                },
                {
                    label: "Confidence",
                    data: usage.confidenceScores,
                    borderColor: "#9cf0d0",
                    backgroundColor: "rgba(156,240,208,0.12)",
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: "#ffffff" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#ffffff" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                },
                y: {
                    ticks: { color: "#ffffff" },
                    grid: { color: "rgba(255,255,255,0.08)" },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

function logout() {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}

renderDashboard();
renderPerformanceChart();