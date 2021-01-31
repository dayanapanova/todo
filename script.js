const LOCALSTORAGE_KEYS = {
    USERS_DATA: 'userData',
    CURRENT_USER: 'currentUser',
    LISTS: 'lists',
    TASKS: 'tasks'
}

// DOM Elements
const loginBtnEl = document.getElementById("login-btn");
const registerBtnEl = document.getElementById("register-btn");
const activeMarkerEl = document.getElementById("active-marker");
const loginFormEl = document.getElementById("login-form");
const registerFormEl = document.getElementById("register-form");
const submitRegisterBtnEl = document.getElementById("submit-register-btn");
const submitLoginBtnEl = document.getElementById("submit-login-btn");
const dashboardScreenEl = document.getElementById("dashboard-screen");
const authScreenEl = document.getElementById("auth-screen");
const logOutBtnEl = document.getElementById("log-out");
const userInfoEl = document.getElementById("user-info");
const createListBtnEl = document.getElementById("create-list-btn");
const listNameInputEl = document.getElementById("list-name-input");
const listsEl = document.getElementById("lists");

const isAuthentificated = Boolean(localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER));

const setLoginTab = () => {
    registerFormEl.style.left = "-400px";
    loginFormEl.style.left = "50px";
    activeMarkerEl.style.left = "0px";
}

const setRegisterTab = () => {
    registerFormEl.style.left = "50px";
    loginFormEl.style.left = "450px";
    activeMarkerEl.style.left = "110px";
};

const generateUUID = () => {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

const getLocalStorageArray = (key) => {
    return JSON.parse(localStorage.getItem(key)) ?? [];
};

const setLocalStorage = (key,data) => localStorage.setItem(key,JSON.stringify(data)); 

const filterCurrentUserLists = (lists) => {
    const currentUserEmail = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    return lists.filter((list) => list.userEmail === currentUserEmail) ?? [];
};

const createTask = (listID) => {
    const localStorageTasks = getLocalStorageArray(LOCALSTORAGE_KEYS.TASKS);
    const newTask = {
        id: generateUUID(),
        listID: listID,
        name: 'test',
    }
    const taskData = [...localStorageTasks, newTask];
    setLocalStorage(LOCALSTORAGE_KEYS.TASKS,taskData);
    renderLists();
};

const taskItem = (id,name) => (
    `<div>
        <h6>${name}</h6>
    </div>`
)

const listItem = (id, name) => {
    const localStoragetTasks = getLocalStorageArray(LOCALSTORAGE_KEYS.TASKS);
    const currentListTasks = localStoragetTasks.filter((task) => task.listID === id);
    return (
        `<div>
            <h1>${name}</h1>
            <input type="text"></input>
            <button id="create-task-btn">Create task</button>
            <div>
                ${currentListTasks.map(({id,name}) => taskItem(id,name))}
            </div>
        </div>`
    )
};


const appendLists = (lists) => {
    const currentUserLists = filterCurrentUserLists(lists);
    const listsDomData = currentUserLists.map(({ id, name }) => listItem(id, name));
    listsEl.innerHTML = listsDomData;
};

const renderHeader = () => {
    const currentUserEmail = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    const { firstname, lastname } = getCurrentUser(currentUserEmail);
    userInfoEl.innerHTML = `${firstname} ${lastname}`;
};

const renderLists = () => {
    const localStorageLists = getLocalStorageArray(LOCALSTORAGE_KEYS.LISTS);
    appendLists(localStorageLists);
}

const renderDashboard = () => {
    renderHeader();
    renderLists();
};

const createList = () => {
    const currentUserEmail = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    const listName = listNameInputEl.value;
    const localStorageLists = getLocalStorageArray(LOCALSTORAGE_KEYS.LISTS);
    const newList = {
        id: generateUUID(),
        name: listName,
        userEmail: currentUserEmail,
    };
    const listsData = [...localStorageLists, newList];
    setLocalStorage(LOCALSTORAGE_KEYS.LISTS,listsData);
    appendLists(listsData);
};

const goToDashboard = () => {
    authScreenEl.style.display = "none";
    dashboardScreenEl.style.display = "block";
    renderDashboard();
};

const goToAuthScreen = () => {
    dashboardScreenEl.style.display = "none";
    authScreenEl.style.display = "block"
};

const getCurrentUser = (email) => {
    const usersData = getLocalStorageArray(LOCALSTORAGE_KEYS.USERS_DATA);
    return usersData.filter((user) => user.email === email)[0] ?? {};
};

const authentificate = (email) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.CURRENT_USER, email);
    goToDashboard();
};

const logOut = () => {
    localStorage.removeItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    userInfoEl.innerHTML = "";
    goToAuthScreen();
};


//check in the login if the user exist and if the password is the user password. if not we create a new user.
const checkUser = (ev) => {
    ev.preventDefault();
    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    const selectedUser = getCurrentUser(loginEmail);
    if (loginPassword === selectedUser.password) {
        authentificate(loginEmail);
    } else {
        alert("Wrong password");
    }
}

const createUser = (ev) => {
    ev.preventDefault();
    const newUserEmail = document.getElementById('register-email').value;
    const localStorageCurrentUsers = getLocalStorageArray(LOCALSTORAGE_KEYS.USERS_DATA);
    const newUser = {
        firstname: document.getElementById('register-firstName').value,
        lastname: document.getElementById('register-lastName').value,
        email: newUserEmail,
        password: document.getElementById('register-password').value
    };
    // check if user exist
    const userIsExist = localStorageCurrentUsers.filter((user) => user.email === newUserEmail).length
    if (!userIsExist) {
        const usersData = [...localStorageCurrentUsers, newUser];
        setLocalStorage(LOCALSTORAGE_KEYS.USERS_DATA,usersData);
        authentificate(newUserEmail);
    } else {
        alert("User exist!");
    }
};

loginBtnEl.onclick = setLoginTab;
registerBtnEl.onclick = setRegisterTab;
submitRegisterBtnEl.onclick = createUser;
submitLoginBtnEl.onclick = checkUser;
logOutBtnEl.onclick = logOut;
createListBtnEl.onclick = createList;
window.onload = () => {
    if (isAuthentificated) {
        goToDashboard();
    } else {
        goToAuthScreen();
    }
};


