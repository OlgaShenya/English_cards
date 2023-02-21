const fragment = `<div class="modal fade " data-bs-backdrop="static" tabindex="-1" id="auth_form" data-bs-keyboard="false" aria-labelledby="staticBackdropLabel"  aria-hidden="true">
  <div class="modal-dialog  modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
          <h2 class="modal-title fs-3 fw-semibold text-center">Sign up/in form</h2>
      </div>
      <div class="modal-body">
          <div class="input-group input-group-lg mb-3 ">
              <span class="input-group-text">Login</span>
              <input type="text" class="form-control" placeholder="your login" id="login" >
          </div>
          <div class="input-group input-group-lg mb-3">
              <span class="input-group-text">Password</span>
              <input type="password" class="form-control" placeholder="your password" id="password">
          </div>  
      </div>
      <div class="modal-footer">
          <button id="signin" type="button " class="btn btn-outline-success text-dark fs-5 fw-semibold">Sign in</button>
          <button id="signup" type="button " class="btn btn-outline-success text-dark fs-5 fw-semibold">Sign up</button>
      </div> 
    </div>
  </div>
</div>`;

const div = document.createElement("div");
div.innerHTML = fragment;
document.body.appendChild(div);

const loginInput = document.getElementById("login");
const passwordInput = document.getElementById("password");
const signinButton = document.getElementById("signin");
const signupButton = document.getElementById("signup");
const authForm = new bootstrap.Modal(document.getElementById("auth_form"));

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
      authForm.hide();
      localStorage.setItem("token", data.token);
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

export const Init = () => {
  if (!localStorage.token) authForm.show();
  signinButton.addEventListener("click", handleSignin);
  signupButton.addEventListener("click", handleSignup);
};
