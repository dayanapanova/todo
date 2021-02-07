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
const listsEl = document.getElementById("lists");
const tasksListEl = document.getElementById("tasks-list");
const currentListNameEl = document.getElementById("current-list-name");
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

const validate = (form, validations) => {
    const errors = [];
    validations.map(({ field, message, fieldType })=> {
        const formField = form[field];
        const errorID = `error-${field}-field`;
        const errorContainer = document.getElementById(errorID);
        if(errorContainer) {
            errorContainer.remove();
        }
        const mapFieldTypeValues = {
            input: "value", 
            checkbox: "checked",
        }
        formField.classList.remove('has-error');
        const fieldIsInvalid = !formField[mapFieldTypeValues[fieldType]];
        if(fieldIsInvalid) {
            errors.push({
                field,
                message,
            })
            formField.classList.add('has-error');
            const errorEl = document.createElement('span');
            errorEl.setAttribute('id', errorID);
            errorEl.setAttribute('class', 'error-message');
            errorEl.innerHTML = message;
            formField.after(errorEl);
        }
    });

    const isValid = !errors.length;

    return {
        isValid,
        errors,
    };
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

const getListByID = (id) => {
    const localStorageLists = getLocalStorage(LOCALSTORAGE_KEYS.LISTS, []);
    const selectedList = localStorageLists.filter((list) => list.id === id)[0];
    return selectedList;
};

const getTasksByListID = (id) => {
    const localStorageTasks = getLocalStorage(LOCALSTORAGE_KEYS.TASKS, []);
    const currentListTasks = localStorageTasks.filter((task) => task.listID === id);
    return currentListTasks;
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

const register = (newUserData) => {
    const localStorageCurrentUsers = getLocalStorage(LOCALSTORAGE_KEYS.USERS_DATA, []);
    // check if user exist
    const userIsExist = localStorageCurrentUsers.filter((user) => user.email === newUserData.email).length
    if (!userIsExist) {
        const usersData = [...localStorageCurrentUsers, newUserData];
        setLocalStorage(LOCALSTORAGE_KEYS.USERS_DATA, usersData);
        authentificate(newUserData.email);
    } else {
        alert("User exist!");
    }
};

const login = (userData) => {
    const selectedUser = getCurrentUser(userData.email);
    if (userData.password === selectedUser.password) {
        authentificate(userData.email);
    } else {
        alert("Wrong password");
    }
};

const handleRegisterFormSubmit = (ev) => {
    ev.preventDefault();
    const registerForm = document.forms["register-form"];
    const validations = [
        {
            fieldType: "input",
            field: "register-firstName",
            message: "Enter first name",
        },
        {
            fieldType: "input",
            field: "register-lastName",
            message: "Enter last name",
        },
        {
            fieldType: "input",
            field: "register-email",
            message: "Enter email",
        },
        {
            fieldType: "input",
            field: "register-password",
            message: "Enter password"
        },
        {
            fieldType: "checkbox",
            field: "register-agree",
            message: "Please accept terms of use"
        }
    ]
    const { isValid } = validate(registerForm, validations);

    if(isValid) {
        register({
            firstname: registerForm['register-firstName'].value,
            lastname: registerForm['register-lastName'].value,
            email: registerForm['register-email'].value,
            password: registerForm['register-password'].value
        });
    }
};

const handleLoginFormSubmit = (ev) => {
    ev.preventDefault();
    const loginForm = document.forms["login-form"];
    const validations = [
        {
            fieldType: 'input',
            field: 'login-email',
            message: 'Enter email'
        },
        {
            fieldType: 'input',
            field: 'login-password',
            message: 'Enter password'
        }
    ];

    const { isValid } = validate(loginForm, validations);

    if(isValid) {
        login({
            email: loginForm["login-email"].value,
            password: loginForm["login-password"].value,
        });
    }
};

// Get the current user email and creates a new list 
const createList = (listName) => {
    const currentUserEmail = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    const localStorageLists = getLocalStorage(LOCALSTORAGE_KEYS.LISTS, []);
    const newList = {
        id: generateUUID(),
        name: listName,
        userEmail: currentUserEmail,
    };
    const listsData = [...localStorageLists, newList];
    setLocalStorage(LOCALSTORAGE_KEYS.LISTS, listsData);
    appendLists(listsData);
    closeModal("create-list-modal");
};

const handleCreateListFormSubmit = (ev) => {
    ev.preventDefault();
    const listForm = document.forms["create-list-form"];
    const validations = [
        {
            fieldType: "input",
            field: "list-name-input",
            message: "Enter list name",
        }
    ];
    const { isValid } = validate(listForm, validations);
    if(isValid) {
        const listName = listForm["list-name-input"].value;
        createList(listName);
    }
};

const createTask = (taskName) => {
    const localStorageTasks = getLocalStorage(LOCALSTORAGE_KEYS.TASKS, []);
    const newTask = {
        id: generateUUID(),
        done: false,
        listID: selectedListID,
        name: taskName,
    };
    const taskData = [...localStorageTasks, newTask];
    setLocalStorage(LOCALSTORAGE_KEYS.TASKS,taskData);
    renderLists();
    renderTasksByListID(selectedListID);
};

const handleCreateTaskFormSubmit = (ev) => {
    ev.preventDefault();
    const taskForm = document.forms["create-task-form"];
    const validations = [
        {
            fieldType: "input",
            field: "task-name-field",
            message: "Enter task",
        }
    ];
    const { isValid } = validate(taskForm, validations);
    if(isValid) {
        const taskName = taskForm["create-task-field"].value;
        createTask(taskName);
    };
};

const listItem = (id, name) => {
    const currentListTasks = getTasksByListID(id);
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

const taskItem = (id, name, isDone) => {
    return (
        `<div class="task-item">
            <input id="task-${id}" type="checkbox" class="checkbox task-checkbox" ${isDone ? "checked" : ""}>
            <label for="task-${id}">${name}<label>
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

const handleTaskDetailBtnClick = (ev) => {
    const listID = ev.target.getAttribute("data-list-id");
    selectedListID = listID;
    const {name} = getListByID(listID);
    currentListNameEl.innerHTML = name;
    openModal("tasks-list-modal");
    renderTasksByListID(listID);
};

const renderLists = () => {
    const localStorageLists = getLocalStorage(LOCALSTORAGE_KEYS.LISTS, []);
    appendLists(localStorageLists);
    const detailButtons = document.querySelectorAll(".task-detail-btn");
    detailButtons.forEach((button) =>(
        button.onclick = handleTaskDetailBtnClick
    ));
};

const renderTasksByListID = (id) => {
    const currentListTasks = getTasksByListID(id);
    const tasksDomData = currentListTasks.map(({name, done, id}) => taskItem(id, name, done));
    tasksListEl.innerHTML = tasksDomData;   
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

const handleLogOutClick = (ev) => {
    ev.preventDefault();
    logOut();
};

tabBtnEls.forEach(tab => tab.onclick = handleTabClick);
modalOpenBtnEls.forEach(modalToggleBtn => modalToggleBtn.onclick = handleModalOpenClick);
modalCloseBtnEls.forEach(modalCloseBtn => modalCloseBtn.onclick = handleModalCloseClick); 
submitRegisterBtnEl.onclick = handleRegisterFormSubmit;
submitLoginBtnEl.onclick = handleLoginFormSubmit;
logOutBtnEl.onclick = handleLogOutClick;
createListBtnEl.onclick = handleCreateListFormSubmit;
submitTaskBtnEl.onclick = handleCreateTaskFormSubmit;
window.onload = () => {
    if (isAuthentificated) {
        goToDashboard();
    } else {
        goToAuthScreen();
    }
};



