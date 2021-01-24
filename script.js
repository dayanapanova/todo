const getLogin = document.getElementById("login");
const getRegister = document.getElementById("register");
const btn = document.getElementById("btn");

function register() {
    getRegister.style.left = "-400px"
    getLogin.style.left = "50px";
    btn.style.left = "110px";
}
function login() {
    getRegister.style.left = "50px"
    getLogin.style.left = "450px";
    btn.style.left = "0px";
}
