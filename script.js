const LOCALSTORAGE_KEYS = {
    userData: 'userData',
    isAuthentificated: "isAuthentificated"
}

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const activeMarker = document.getElementById("active-marker");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const submitRegisterBtn = document.getElementById("submit-register-btn");
const submitLoginBtn = document.getElementById("submit-login-btn");
const dashboardScreen = document.getElementById("dashboard-screen");
const authScreen = document.getElementById("auth-screen");
const logOutBtn = document.getElementById("log-out");
const isAuthentificated = localStorage.getItem(LOCALSTORAGE_KEYS.isAuthentificated) === "true";

const setLoginTab = () => {
    registerForm.style.left = "-400px";
    loginForm.style.left = "50px";
    activeMarker.style.left = "0px";
}

const setRegisterTab = () => {
    registerForm.style.left = "50px";
    loginForm.style.left = "450px";
    activeMarker.style.left = "110px";
}

const goToDashboard = () => {
    authScreen.style.display = "none";
    dashboardScreen.style.display = "block";
}

const goToAuthScreen = () => {
    dashboardScreen.style.display = "none";
    authScreen.style.display = "block"
}

const authentificate = () => {
    localStorage.setItem(LOCALSTORAGE_KEYS.isAuthentificated, "true");
    goToDashboard();
}

const logOut = () => {
    localStorage.removeItem(LOCALSTORAGE_KEYS.isAuthentificated);
    goToAuthScreen();
}

//check in the login if the user exist and if the password is the user password. if not we create a new user.
const checkUser = (ev) => {
    ev.preventDefault();
    const usersData = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.userData)) ?? [];
    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    const selectedUser = usersData.filter((user) => user.email === loginEmail)[0] ?? {};
    if(loginPassword === selectedUser.password) {
        authentificate();
    } else {
        alert("Wrong password");
    }
}

const createUser = (ev) => {
    ev.preventDefault();
    const newUserEmail = document.getElementById('register-email').value;
    const localStorageCurrentUsers = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.userData)) ?? [];
    const newUser = {
        firstname:document.getElementById('register-firstName').value,
        lastname:document.getElementById('register-lastName').value,
        email:newUserEmail,
        password:document.getElementById('register-password').value
    };
    // check if user exist
    const userIsExist = localStorageCurrentUsers.filter((user) =>user.email === newUserEmail).length
    if(!userIsExist) {
        const usersData = [...localStorageCurrentUsers,newUser];
        localStorage.setItem(LOCALSTORAGE_KEYS.userData,JSON.stringify(usersData));
    }  else {
        alert("User exist!");
    }
};

loginBtn.onclick = setLoginTab;
registerBtn.onclick = setRegisterTab;
submitRegisterBtn.onclick = createUser;
submitLoginBtn.onclick = checkUser;
logOutBtn.onclick = logOut;
window.onload = () => {
    if(isAuthentificated) {
        goToDashboard();
    } else {
        goToAuthScreen();
    }
};


