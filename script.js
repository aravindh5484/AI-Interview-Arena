function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("signupForm").classList.add("hidden");

  document.querySelectorAll(".tabs button")[0].classList.add("active");
  document.querySelectorAll(".tabs button")[1].classList.remove("active");
}

function showSignup() {
  document.getElementById("signupForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");

  document.querySelectorAll(".tabs button")[1].classList.add("active");
  document.querySelectorAll(".tabs button")[0].classList.remove("active");
}