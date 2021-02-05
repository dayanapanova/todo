const LOCALSTORAGE_KEYS = {
    USERS_DATA: 'userData',
    CURRENT_USER: 'currentUser',
    LISTS: 'lists',
    TASKS: 'tasks'
}

// DOM Elements
const tabBtnEls = document.querySelectorAll(".tab-btn");
const allTabsItemsEls = document.querySelectorAll(".tab-item");
const loginFormEl = document.getElementById("login-form");
const registerFormEl = document.getElementById("register-form");
const submitRegisterBtnEl = document.getElementById("submit-register-btn");
const submitLoginBtnEl = document.getElementById("submit-login-btn");
const submitTaskBtnEl = document.getElementById("submit-task-btn");
const dashboardScreenEl = document.getElementById("dashboard-screen");
const modalEls = document.querySelectorAll(".modal");
const modalOpenBtnEls = document.querySelectorAll(".modal-open-btn");
const modalCloseBtnEls = document.querySelectorAll(".modal-close-btn");
const authScreenEl = document.getElementById("auth-screen");
const logOutBtnEl = document.getElementById("log-out");
const userInfoEl = document.getElementById("user-info");
const createListBtnEl = document.getElementById("create-list-btn");
const listNameInputEl = document.getElementById("list-name-input");
const listsEl = document.getElementById("lists");

const isAuthentificated = Boolean(localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER));

let selectedListID = "";

const generateUUID = () => {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

const calculatePercentage = (particalValue, totalValue) => {
    return (particalValue * 100) / totalValue;
};

// Local storage helpers
const getLocalStorage = (key, defaultValue = null) => JSON.parse(localStorage.getItem(key)) ?? defaultValue;
const setLocalStorage = (key, data) => localStorage.setItem(key,JSON.stringify(data)); 

// Returns lists for the current user that is logged in
const filterCurrentUserLists = (lists) => {
    const currentUserEmail = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    return lists.filter((list) => list.userEmail === currentUserEmail) ?? [];
};

const getCurrentUser = (email) => {
    const usersData = getLocalStorage(LOCALSTORAGE_KEYS.USERS_DATA, []);
    return usersData.filter((user) => user.email === email)[0] ?? {};
};

//Tab content 
const changeTab = (currentTab) => {
    const setActiveClassName = (tabs) => {
        tabs.forEach((tabItem) => {
            const tabID = tabItem.getAttribute("data-tab");
            if(tabID === currentTab) {
                tabItem.classList.add("active");
            } else {
                tabItem.classList.remove("active");
            }
        });
    } 
    setActiveClassName(allTabsItemsEls);
    setActiveClassName(tabBtnEls);
};

const handleTabClick = (ev) => {
    const currentTab = ev.target.getAttribute("data-tab");
    changeTab(currentTab);
};

//Modal function
const toggleModal = (currentModalName, action) => {
    const addOrRemoveClass = action === "open" ? "add" : "remove";
    modalEls.forEach((modal) => {
        const modalName = modal.getAttribute("data-name");
        if(modalName === currentModalName) {
            modal.classList[addOrRemoveClass]("is-open");
        };
    });
};

const openModal = (currentModalName) => toggleModal(currentModalName, "open");

const closeModal = (currentModalName) => toggleModal(currentModalName, "close");

const handleModalOpenClick = (ev) => {
    const currentModalName = ev.target.getAttribute("data-name");
    openModal(currentModalName);
};

const handleModalCloseClick = (ev) => {
    const currentModalName = ev.target.getAttribute("data-name");
    closeModal(currentModalName);
}

// Function to create a user
const register = (ev) => {
    ev.preventDefault();
    const newUserEmail = document.getElementById('register-email').value;
    const localStorageCurrentUsers = getLocalStorage(LOCALSTORAGE_KEYS.USERS_DATA, []);
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

const login = (ev) => {
    ev.preventDefault();
    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    const selectedUser = getCurrentUser(loginEmail);
    if (loginPassword === selectedUser.password) {
        authentificate(loginEmail);
    } else {
        alert("Wrong password");
    }
};

// Get the current user email and creates a new list 
const createList = () => {
    const currentUserEmail = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    const listName = listNameInputEl.value;
    const localStorageLists = getLocalStorage(LOCALSTORAGE_KEYS.LISTS, []);
    const newList = {
        id: generateUUID(),
        name: listName,
        userEmail: currentUserEmail,
    };
    const listsData = [...localStorageLists, newList];
    setLocalStorage(LOCALSTORAGE_KEYS.LISTS,listsData);
    appendLists(listsData);
    closeModal("create-list-modal");
};

const createTask = (ev) => {
    ev.preventDefault();
    const localStorageTasks = getLocalStorage(LOCALSTORAGE_KEYS.TASKS, []);
    const newTask = {
        id: generateUUID(),
        listID: selectedListID,
        name: 'test',
    };
    const taskData = [...localStorageTasks, newTask];
    setLocalStorage(LOCALSTORAGE_KEYS.TASKS,taskData);
    renderLists();
};

const listItem = (id, name) => {
    const localStoragetTasks = getLocalStorage(LOCALSTORAGE_KEYS.TASKS, []);
    const currentListTasks = localStoragetTasks.filter((task) => task.listID === id);
    const totalTasks = currentListTasks.length;
    // TODO : calculate the done tasks after the logic about adding tasks
    const doneTasks = 0;
    return (
        `<div class="list-item-column">
            <div class="list-item-content">
                <h1 class="title">${name}</h1>
                <div class="task-progress">
                    <p class="progress-label"><strong>${doneTasks}</strong> of ${totalTasks} tasks  is <span>done</span></p>
                    <div class="progress-bar">
                        <div class="indicator" style="width:${doneTasks ? calculatePercentage(doneTasks, totalTasks) : 0}%"></div>
                    </div>
                </div>
                <button data-list-id="${id}" class="btn small task-detail-btn">View list tasks (${totalTasks})</button>
            </div>
        </div>`)
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

const handleTaskDetailBtnClick = (ev) => {
    const listID = ev.target.getAttribute("data-list-id");
    selectedListID = listID;
    openModal("tasks-list-modal");
};

const renderLists = () => {
    const localStorageLists = getLocalStorage(LOCALSTORAGE_KEYS.LISTS, []);
    appendLists(localStorageLists);
    const detailButtons = document.querySelectorAll(".task-detail-btn");
    detailButtons.forEach((button) =>(
        button.onclick = handleTaskDetailBtnClick
    ));
};

const renderDashboard = () => {
    renderHeader();
    renderLists();
};

const goToDashboard = () => {
    authScreenEl.style.display = "none";
    dashboardScreenEl.style.display = "block";
    renderDashboard();
};

const goToAuthScreen = () => {
    dashboardScreenEl.style.display = "none";
    authScreenEl.style.display = "block";
    changeTab("login-tab");
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

tabBtnEls.forEach(tab => tab.onclick = handleTabClick);
modalOpenBtnEls.forEach(modalToggleBtn => modalToggleBtn.onclick = handleModalOpenClick);
modalCloseBtnEls.forEach(modalCloseBtn => modalCloseBtn.onclick = handleModalCloseClick); 
submitRegisterBtnEl.onclick = register;
submitLoginBtnEl.onclick = login;
submitTaskBtnEl.onclick = createTask;
logOutBtnEl.onclick = logOut;
createListBtnEl.onclick = createList;
window.onload = () => {
    if (isAuthentificated) {
        goToDashboard();
    } else {
        goToAuthScreen();
    }
};



