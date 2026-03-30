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

    const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (data.message === "Signup success") {
        showLogin();
        document.getElementById("loginEmail").value = email;
    }
}

async function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        alert("Fill all fields");
        return;
    }

    const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (data.message === "Login success") {
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        window.location.href = "dashboard.html";
    }
}