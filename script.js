const LOCALSTORAGE_KEYS = {
    USERS_DATA: 'userData',
    CURRENT_USER: 'currentUser'
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
const isAuthentificated = Boolean(localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER));
let currentUserData = {};

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

const renderDashboard = () => {
    const currentUserEmail = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    currentUserData = getCurrentUser(currentUserEmail);
    console.log(currentUserData);
};

const goToDashboard = () => {
    authScreen.style.display = "none";
    dashboardScreen.style.display = "block";
    renderDashboard();
};

const goToAuthScreen = () => {
    dashboardScreen.style.display = "none";
    authScreen.style.display = "block"
};

const getCurrentUser = (email) => {
    const usersData = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.USERS_DATA)) ?? [];
    return usersData.filter((user) => user.email === email)[0] ?? {};
};

const authentificate = (email) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.CURRENT_USER, email);
    goToDashboard();
};

const logOut = () => {
    localStorage.removeItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    goToAuthScreen();
};


//check in the login if the user exist and if the password is the user password. if not we create a new user.
const checkUser = (ev) => {
    ev.preventDefault();
    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    const selectedUser = getCurrentUser(loginEmail);
    if(loginPassword === selectedUser.password) {
        authentificate(loginEmail);
    } else {
        alert("Wrong password");
    }
}

const createUser = (ev) => {
    ev.preventDefault();
    const newUserEmail = document.getElementById('register-email').value;
    const localStorageCurrentUsers = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.USERS_DATA)) ?? [];
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
        localStorage.setItem(LOCALSTORAGE_KEYS.USERS_DATA,JSON.stringify(usersData));
        authentificate(newUserEmail);
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


