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
const formId = "register";
const url = location.href;
const formIdentifier = `${url} ${formId}`;
const registerButton = document.querySelector("#register-btn");
let form = document.querySelector(`#${formId}`);
let formElements = form.getElementsByClassName;


const getFormData = () => {
    let data = {[formIdentifier] : {}}
    for(const element in formElements) {
        if(element.name.lenght > 0) {
            data[formIdentifier][element.name] = element.value;
        }
    }
    return data;
};
registerButton.onclick = event => {
    event.preventDefault();
    data = getFormData();
    let stringifiedData = JSON.stringify(data[formIdentifier]);
    localStorage.setItem(formIdentifier, stringifiedData);
    console.log(stringifiedData);
}

