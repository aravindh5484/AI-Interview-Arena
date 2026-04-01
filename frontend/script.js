const API_URL = "https://ai-interview-backend-230t.onrender.com";

// 🔁 SWITCH UI
function showSignup() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("signupBox").style.display = "block";
}

function showLogin() {
    document.getElementById("signupBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
}

// 📝 SIGNUP
async function signup() {
    const name = document.getElementById("signupName")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim();
    const password = document.getElementById("signupPassword")?.value.trim();

    if (!name || !email || !password) {
        alert("Fill all fields");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Signup successful");
            showLogin();

            document.getElementById("loginEmail").value = email;
            document.getElementById("loginPassword").value = password;
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Server not working");
    }
}

// 🔐 LOGIN
async function login() {
    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value.trim();

    if (!email || !password) {
        alert("Fill all fields");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("userName", data.name);
            localStorage.setItem("userEmail", data.email);

            alert("Login successful");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Server not working");
    }
}