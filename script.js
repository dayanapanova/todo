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

const login = () => {
    localStorage.setItem(LOCALSTORAGE_KEYS.isAuthentificated, "true");
    // TODO:redirect to list screen
}

const checkUser = (ev) => {
    ev.preventDefault();
    const usersData = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.userData)) ?? [];
    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    const selectedUser = usersData.filter((user) => user.email === loginEmail)[0] ?? {};
    if(loginPassword === selectedUser.password) {
        login();
    } else {
        console.log("did not success");
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
    //TODO: check if user exist
    const userIsExist = localStorageCurrentUsers.filter((user) =>user.email === newUserEmail).length
    if(!userIsExist) {
        const usersData = [...localStorageCurrentUsers,newUser];
        localStorage.setItem(LOCALSTORAGE_KEYS.userData,JSON.stringify(usersData));
    }  else {
        alert("User exist!")
    }
};

loginBtn.onclick = setLoginTab;
registerBtn.onclick = setRegisterTab;
submitRegisterBtn.onclick = createUser;
submitLoginBtn.onclick = checkUser;


