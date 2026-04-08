const API_URL = "https://ai-interview-backend-230t.onrender.com";

function showSignup() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("signupBox").classList.remove("hidden");

    document.getElementById("loginTab").classList.remove("active");
    document.getElementById("signupTab").classList.add("active");
}

function showLogin() {
    document.getElementById("signupBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");

    document.getElementById("signupTab").classList.remove("active");
    document.getElementById("loginTab").classList.add("active");
}

async function signup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!name || !email || !password) {
        alert("Fill all fields");
        return;
    }

    try {
        console.log("Sending signup request...");

        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        console.log("Signup status:", res.status);
        console.log("Signup data:", data);

        if (res.ok) {
            alert("Signup successful");

            document.getElementById("signupName").value = "";
            document.getElementById("signupEmail").value = "";
            document.getElementById("signupPassword").value = "";

            showLogin();
            document.getElementById("loginEmail").value = email;
            document.getElementById("loginPassword").value = password;
        } else {
            alert(data.message || "Signup failed");
        }
    } catch (err) {
        console.error("Signup fetch error:", err);
        alert("Server not working");
    }
}

async function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        alert("Fill all fields");
        return;
    }

    try {
        console.log("Sending login request...");

        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log("Login status:", res.status);
        console.log("Login data:", data);

        if (res.ok) {
            localStorage.setItem("userName", data.name || "");
            localStorage.setItem("userEmail", data.email || "");
            localStorage.setItem("isLoggedIn", "true");

            console.log("Redirecting to dashboard...");
            window.location.href = "./dashboard.html";
        } else {
            alert(data.message || "Login failed");
        }
    } catch (err) {
        console.error("Login fetch error:", err);
        alert("Server not working");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    showLogin();
});