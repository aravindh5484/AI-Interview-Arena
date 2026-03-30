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
    interviewType: "Technical",
    difficulty: "Easy",
    interviewsStarted: 0,
    resumeUploads: 0,

    technicalScores: [0, 0, 0, 0, 0],
    communicationScores: [0, 0, 0, 0, 0],
    confidenceScores: [0, 0, 0, 0, 0]
};

let usage = JSON.parse(localStorage.getItem("dashboardUsage")) || defaultUsage;

function saveUsage() {
    localStorage.setItem("dashboardUsage", JSON.stringify(usage));
}

function getFocusByStream(stream) {
    const map = {
        "B.Tech": ["DSA", "Projects", "System Design", "OOPs", "Communication"],
        "BBA": ["Business Communication", "Leadership", "Presentation", "Marketing", "Case Handling"],
        "MBA": ["Strategy", "Leadership", "Analytics", "Business Cases", "HR Rounds"],
        "BCA": ["Programming", "Web Development", "DBMS", "Projects", "Communication"],
        "MCA": ["Advanced Programming", "System Design", "Database", "Architecture", "Projects"],
        "B.Sc": ["Core Concepts", "Problem Solving", "Research Thinking", "Aptitude", "Communication"],
        "BA": ["Communication", "Critical Thinking", "Presentation", "Confidence", "HR Answers"]
    };

    return map[stream] || ["Communication", "Confidence", "Projects"];
}

function getRecommendation(stream, type) {
    if (stream === "B.Tech" && type === "Technical") {
        return "Focus on DSA, projects, and technical problem solving.";
    }
    if (stream === "BBA" && type === "HR") {
        return "Focus on business communication, confidence, and situational answers.";
    }
    if (stream === "MBA" && type === "Startup Founder") {
        return "Focus on leadership, ownership, and strategic thinking.";
    }
    if (type === "Friendly Mentor") {
        return "Focus on structured answers and confidence building.";
    }
    return "Focus on communication, clarity, and practical examples.";
}

function updateDifficultyByInterviewType() {
    const type = document.getElementById("interviewType").value;
    const difficultySelect = document.getElementById("difficultyLevel");

    let allowed = [];

    if (type === "Technical") {
        allowed = ["Easy", "Medium", "Hard"];
    } else if (type === "HR") {
        allowed = ["Easy", "Medium"];
    } else if (type === "Startup Founder") {
        allowed = ["Medium", "Hard"];
    } else {
        allowed = ["Easy", "Medium"];
    }

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

function updateDashboardPreferences() {
    usage.stream = document.getElementById("streamSelect").value;
    usage.interviewType = document.getElementById("interviewType").value;
    usage.difficulty = document.getElementById("difficultyLevel").value;
    saveUsage();
    renderDashboard();
    renderPerformanceChart();
}

function renderDashboard() {
    document.getElementById("streamSelect").value = usage.stream;
    document.getElementById("interviewType").value = usage.interviewType;
    document.getElementById("difficultyLevel").value = usage.difficulty;

    document.getElementById("currentStream").innerText = usage.stream;
    document.getElementById("statInterviews").innerText = usage.interviewsStarted;
    document.getElementById("statUploads").innerText = usage.resumeUploads;
    document.getElementById("statType").innerText = usage.interviewType;
    document.getElementById("statDifficulty").innerText = usage.difficulty;

    document.getElementById("insightStream").innerText = usage.stream;
    document.getElementById("insightType").innerText = usage.interviewType;
    document.getElementById("recommendedFocus").innerText = getRecommendation(usage.stream, usage.interviewType);

    const tags = getFocusByStream(usage.stream);
    const tagsBox = document.getElementById("focusTags");
    tagsBox.innerHTML = "";

    tags.forEach(tag => {
        const span = document.createElement("span");
        span.textContent = tag;
        tagsBox.appendChild(span);
    });
}

function getIncrementValues() {
    let technical = 8;
    let communication = 7;
    let confidence = 6;

    if (usage.interviewType === "HR") {
        technical = 4;
        communication = 9;
        confidence = 8;
    } else if (usage.interviewType === "Startup Founder") {
        technical = 7;
        communication = 8;
        confidence = 9;
    } else if (usage.interviewType === "Friendly Mentor") {
        technical = 5;
        communication = 8;
        confidence = 8;
    }

    if (usage.difficulty === "Medium") {
        technical += 4;
        communication += 3;
        confidence += 3;
    } else if (usage.difficulty === "Hard") {
        technical += 8;
        communication += 6;
        confidence += 5;
    }

    return { technical, communication, confidence };
}

function pushScore(array, value) {
    array.shift();
    array.push(Math.min(value, 100));
}

function startInterview() {
    usage.interviewsStarted += 1;
    usage.stream = document.getElementById("streamSelect").value;
    usage.interviewType = document.getElementById("interviewType").value;
    usage.difficulty = document.getElementById("difficultyLevel").value;

    const inc = getIncrementValues();

    const lastTechnical = usage.technicalScores[usage.technicalScores.length - 1];
    const lastCommunication = usage.communicationScores[usage.communicationScores.length - 1];
    const lastConfidence = usage.confidenceScores[usage.confidenceScores.length - 1];

    pushScore(usage.technicalScores, lastTechnical + inc.technical);
    pushScore(usage.communicationScores, lastCommunication + inc.communication);
    pushScore(usage.confidenceScores, lastConfidence + inc.confidence);

    saveUsage();
    renderDashboard();
    renderPerformanceChart();

    alert(`Starting ${usage.interviewType} interview for ${usage.stream} at ${usage.difficulty} level`);
}

function simulateResumeUpload() {
    usage.resumeUploads += 1;
    saveUsage();
    renderDashboard();
}

function renderPerformanceChart() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas) return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

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
                    labels: {
                        color: "#ffffff"
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: "#ffffff"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.08)"
                    }
                },
                y: {
                    ticks: {
                        color: "#ffffff"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.08)"
                    },
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