const authForm = document.getElementById("auth_form");
const loginInput = document.getElementById("login");
const passwordInput = document.getElementById("password");
const signinButton = document.getElementById("signin");
const signupButton = document.getElementById("signup");

const handleSignin = () => {
  fetch("http://localhost:3000/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      login: loginInput.value,
      password: passwordInput.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }
      localStorage.setItem("token", data.token);
      authForm.style.visibility = "hidden";
      location.reload();
    })
    .catch((error) => alert(error.message));
};

const handleSignup = () => {
  fetch("http://localhost:3000/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      login: loginInput.value,
      password: passwordInput.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }
      handleSignin();
    })
    .catch((error) => alert(error.message));
};

signinButton.addEventListener("click", handleSignin);
signupButton.addEventListener("click", handleSignup);
