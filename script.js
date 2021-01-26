const LOCALSTORAGE_KEYS = {
    userData: 'userData',   
}

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const activeMarker = document.getElementById("active-marker");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const submitRegisterBtn = document.getElementById("submit-register-btn");
const submitLoginBtn = document.getElementById("submit-login-btn");

const login = () => {
    registerForm.style.left = "-400px";
    loginForm.style.left = "50px";
    activeMarker.style.left = "0px";
}

const register = () => {
    registerForm.style.left = "50px";
    loginForm.style.left = "450px";
    activeMarker.style.left = "110px";
}

const checkUser = (ev) => {
    ev.preventDefault();
    const userData = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.userData));
    console.log(userData);
    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    if(loginEmail === userData.email && loginPassword === userData.password) {
        console.log("success login")
    } else {
        console.log("did not success");
    }
}

const setUserData = (ev) => {
    ev.preventDefault();
    const userData = {
        firstname:document.getElementById('register-firstName').value,
        lastname:document.getElementById('register-lastName').value,
        email:document.getElementById('register-email').value,
        password:document.getElementById('register-password').value
    }
    localStorage.setItem(LOCALSTORAGE_KEYS.userData,JSON.stringify(userData)); 
};

loginBtn.onclick = login;
registerBtn.onclick = register;
submitRegisterBtn.onclick = setUserData;
submitLoginBtn.onclick = checkUser;


