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
const registerButton = document.querySelector("#register-btn");

const getFormData = (e) => {
    let formData = {
        firstname:document.getElementById('firstName').value,
        lastname:document.getElementById('lastName').value,
        email:document.getElementById('email').value,
        password:document.getElementById('password').value
    }
    localStorage.setItem('formedData',JSON.stringify(formData));
    console.log(localStorage.getItem('formedData')); 
};
registerButton.onclick = event => {
    event.preventDefault();
    getFormData();   
}


