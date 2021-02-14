const LOCALSTORAGE_KEYS = {
    USERS_DATA: 'userData',
    CURRENT_USER: 'currentUser',
    LISTS: 'lists',
    TASKS: 'tasks'
};

const appEl = document.getElementById('app');
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

const getLocalStorage = (key, defaultValue = null) => JSON.parse(localStorage.getItem(key)) ?? defaultValue;

const setLocalStorage = (key, data) => localStorage.setItem(key,JSON.stringify(data));

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

const getTaskByID = (id) => {
    const localStorageLists = getLocalStorage(LOCALSTORAGE_KEYS.TASKS, []);
    const selectedTask = localStorageLists.filter((list) => list.id === id)[0];
    return selectedTask;
};

const getTasksByListID = (id) => {
    const localStorageTasks = getLocalStorage(LOCALSTORAGE_KEYS.TASKS, []);
    const currentListTasks = localStorageTasks.filter((task) => task.listID === id);
    return currentListTasks;
};

const getCurrentUserLists = () => {
    const localStorageLists = getLocalStorage(LOCALSTORAGE_KEYS.LISTS, []);
    const currentUserLists = filterCurrentUserLists(localStorageLists);
    return currentUserLists;
};

const authentificate = (email) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.CURRENT_USER, email);
    renderDashboard();
};

const dashboardTemplate = () => {
    return (`
        <div class="dashboard-screen">
            <div class="header">
                <a class="logo">TODO LIST</a>
                <div class="user-info">
                    <div id="user-info" class="user-name"></div>
                    <button id="log-out" class="log-out">Log out</button>
                </div>
            </div>
            <div data-name="create-list-form-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-head">
                        <h1 class="title">Create a new list</h1>
                        <span data-name="create-list-form-modal" class="modal-close-btn">✕</span>
                    </div>
                    <div class="modal-body">
                        <form id="create-list-form" class="list-form form">
                            <div class="form-field">
                                <input class="input" id="create-list-name-input" placeholder="Enter list name" type="text"/>
                            </div>
                            <div class="form-btn">
                                <button id="create-list-btn" class="btn">Create a new todo list</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div data-name="edit-list-form-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-head">
                        <h1 class="title">Edit list</h1>
                        <span data-name="edit-list-form-modal" class="modal-close-btn">✕</span>
                    </div>
                    <div class="modal-body">
                        <form id="edit-list-form" class="list-form form">
                            <div class="form-field">
                                <input class="input" id="edit-list-name-input" placeholder="Enter list name" type="text"/>
                            </div>
                            <div class="form-btn">
                                <button id="edit-list-btn" class="btn">Edit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div data-name="tasks-list-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-head">
                        <h1 class="title" id="current-list-name"></h1>
                        <span data-name="tasks-list-modal" class="modal-close-btn">✕</span>
                    </div>
                    <div class="modal-body">
                        <form id="create-task-form" class="create-task-form">
                            <div class="input-wrapper">
                                <input id="task-name-field" placeholder="Create a new task" class="input small" type="text"/>
                            </div>
                            <div>
                                <button id="submit-task-btn" class="btn small">Create</button>
                            </div>
                        </form>
                        <div id="tasks-list" class="tasks-list">

                        </div>
                    </div>
                </div>
            </div>
            <div id="lists" class="list-items"></div>
            <button data-name="create-list-form-modal" class="modal-open-btn circle-add-btn">+</button>
        </div>
    `)
};

const authScreenTemplate = () => {
    return (`
        <div class="auth-screen">
            <div class="card">
                <div class="tab-buttons">
                    <button data-tab="login-tab" type="button" class="tab-btn">Login</button>
                    <button data-tab="register-tab" type="button" class="tab-btn">Register</button>
                </div>
                <div class="card-content">
                    <div class="tab-content">
                        <div data-tab="login-tab" class="tab-item">
                            <form id="login-form" class="form">
                                <div class="form-field">
                                    <input class="input" id="login-email" type="email" placeholder="EMAIL">
                                </div>
                                <div class="form-field">
                                    <input class="input" id="login-password" type="password" placeholder="ENTER PASSWORD">
                                </div>
                                <div class="form-btn">
                                    <button id="submit-login-btn"type="submit" class="btn">Log in</button>
                                </div>
                            </form>
                        </div>
                        <div data-tab="register-tab" class="tab-item">
                            <form id="register-form" class="form">
                                <div class="form-field">
                                    <input class="input" id="register-firstName" type="text" placeholder="First name">
                                </div>
                                <div class="form-field">
                                    <input class="input" id="register-lastName" type="text" placeholder="Last name">
                                </div>
                                <div class="form-field">
                                    <input class="input" id="register-email"type="email" placeholder="EMAIL">
                                </div>
                                <div class="form-field">
                                    <input class="input" id="register-password"type="password" placeholder="ENTER PASSWORD">
                                </div>
                                <div class="form-field">
                                    <label for="agree" class="checkbox">
                                        <input id="register-agree" type="checkbox"/>
                                        <span class="label-text">I agree with the terms of use</span>
                                    </label>
                                </div>
                                <div class="form-btn">
                                    <button id="submit-register-btn" type="submit" class="btn">Register</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `)
};

const renderDashboard = () => {
    appEl.innerHTML = dashboardTemplate();

    const currentListNameEl = document.getElementById("current-list-name");
    const tasksListEl = document.getElementById("tasks-list");
    const modalEls = document.querySelectorAll(".modal");
    const userInfoEl = document.getElementById("user-info");
    const listsEl = document.getElementById("lists");
    const logOutBtnEl = document.getElementById("log-out");
    const submitTaskBtnEl = document.getElementById("submit-task-btn");
    const modalOpenBtnEls = document.querySelectorAll(".modal-open-btn");
    const modalCloseBtnEls = document.querySelectorAll(".modal-close-btn");
    const createListBtnEl = document.getElementById("create-list-btn");
    const updateListBtn = document.getElementById("edit-list-btn");

    const toggleModal = (currentModalName, action) => {
        const addOrRemoveClass = action === "open" ? "add" : "remove";
        modalEls.forEach((modal) => {
            const modalName = modal.getAttribute("data-name");
            if(modalName === currentModalName) {
                modal.classList[addOrRemoveClass]("is-open");
            };
        });
    };

    const renderHeader = () => {
        const currentUserEmail = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
        const { firstname, lastname } = getCurrentUser(currentUserEmail);
        userInfoEl.innerHTML = `${firstname} ${lastname}`;
    };

    const listItemTemplate = (id, name) => {
        const currentListTasks = getTasksByListID(id);
        const totalTasks = currentListTasks.length;
        const doneTasks = currentListTasks.filter(({ isDone })=> isDone === true).length;
        return (
            `<div class="list-item-column">
                <div class="list-item-content">
                    <div class="list-item-head">
                        <h1 class="title">${name}</h1>
                        <button data-list-id="${id}" class="btn btn-list-edit extra-small">Edit</button>
                    </div>
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

    const renderLists = () => {
        const currentUserLists = getCurrentUserLists();
        const listsDomData = currentUserLists.map(({ id, name }) => listItemTemplate(id, name));
        listsEl.innerHTML = listsDomData;
        const detailButtons = document.querySelectorAll(".task-detail-btn");
        const editListsButtons = document.querySelectorAll(".btn-list-edit");

        const fillUpdateListForm = () => {
            const editListForm = document.forms["edit-list-form"];
            const selectedlistItemTemplate = getListByID(selectedListID);
            editListForm["edit-list-name-input"].value = selectedlistItemTemplate.name;
        };

        const handleTaskDetailBtnClick = (ev) => {
            const listID = ev.target.getAttribute("data-list-id");
            selectedListID = listID;
            const {name} = getListByID(listID);
            currentListNameEl.innerHTML = name;
            openModal("tasks-list-modal");
            renderTasksByListID(listID);
        };

        const handleOpenListUpdateForm = (ev) => {
            ev.preventDefault();
            const listID = ev.currentTarget.getAttribute("data-list-id");
            selectedListID = listID;
            openModal("edit-list-form-modal");
            fillUpdateListForm();
        };

        detailButtons.forEach((button) =>(
            button.onclick = handleTaskDetailBtnClick
        ));

        editListsButtons.forEach((button) =>(
            button.onclick = handleOpenListUpdateForm
        ));
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

    const logOut = () => {
        localStorage.removeItem(LOCALSTORAGE_KEYS.CURRENT_USER);
        userInfoEl.innerHTML = "";
        renderAuthScreen();
    };

    const handleLogOutClick = (ev) => {
        ev.preventDefault();
        logOut();
    };

    const updateTaskStatus = (taskID, isDone)=> {
        const localStorageTasks = getLocalStorage(LOCALSTORAGE_KEYS.TASKS, []);
        const selectedTask = getTaskByID(taskID);
        const filteredTastks = localStorageTasks.filter((task)=> task.id !== taskID);
        const updatedTask = {
            id: selectedTask.id,
            listID: selectedTask.listID,
            name: selectedTask.name,
            isDone,
        };
        setLocalStorage(LOCALSTORAGE_KEYS.TASKS, [...filteredTastks, updatedTask]);
        renderLists();
    };

    const handleTaskCheck = (ev) => {
        const currentTarget = ev.currentTarget;
        const taskID = currentTarget.getAttribute("data-task-id");
        const isDone = currentTarget.checked
        updateTaskStatus(taskID, isDone);
    };

    const taskItemTemplate = (id, name, isDone) => {
        return (
            `<div class="task-item">
                <input id="task-${id}" data-task-id="${id}" type="checkbox" class="checkbox task-checkbox" ${isDone ? "checked" : ""}>
                <label for="task-${id}">${name}<label>
            </div>`
        )
    };

    const renderTasksByListID = (id) => {
        const currentListTasks = getTasksByListID(id);
        const tasksDomData = currentListTasks.map(({name, isDone, id}) => taskItemTemplate(id, name, isDone));
        tasksListEl.innerHTML = tasksDomData;
        const taskCheckboxes = document.querySelectorAll(".task-checkbox");
        taskCheckboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', handleTaskCheck)
        });
    };

    const checkListNameExist = (listName) => {
        const currentUserLists = getCurrentUserLists();
        const nameIsExist = currentUserLists.filter((list) => list.name.toLowerCase() === listName.toLowerCase()).length
        return nameIsExist;
    };

    const createTask = (taskName) => {
        const localStorageTasks = getLocalStorage(LOCALSTORAGE_KEYS.TASKS, []);
        const newTask = {
            id: generateUUID(),
            isDone: false,
            listID: selectedListID,
            name: taskName,
        };
        const taskData = [...localStorageTasks, newTask];
        setLocalStorage(LOCALSTORAGE_KEYS.TASKS,taskData);
        renderLists();
        renderTasksByListID(selectedListID);
    };

    const createList = (listName) => {
        const listNameIsExist = checkListNameExist(listName);
        if(!listNameIsExist) {
            const currentUserEmail = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
            const localStorageLists = getLocalStorage(LOCALSTORAGE_KEYS.LISTS, []);
            const newList = {
                id: generateUUID(),
                name: listName,
                userEmail: currentUserEmail,
            };
            const listsData = [...localStorageLists, newList];
            setLocalStorage(LOCALSTORAGE_KEYS.LISTS, listsData);
            renderLists();
            closeModal("create-list-form-modal");
        } else {
            alert("This list name already exist!");
        }
    };

    const updateList = (listID, listName) => {
        const listNameIsExist = checkListNameExist(listName);
        if(!listNameIsExist) {
            const localStoragelistItemTemplates = getLocalStorage(LOCALSTORAGE_KEYS.LISTS, []);
            const filteredlistItemTemplates = localStoragelistItemTemplates.filter((list)=> list.id !== listID);
            const selectedlistItemTemplate = getListByID(listID);
            const updatedlistItemTemplate = {
                ...selectedlistItemTemplate,
                name: listName,
            }
            const listsData = [...filteredlistItemTemplates, updatedlistItemTemplate];
            setLocalStorage(LOCALSTORAGE_KEYS.LISTS, listsData);
            renderLists();
            closeModal("edit-list-form-modal");
        } else {
            alert("This list name already exist!")
        }
    };

    const handleCreateListFormSubmit = (ev) => {
        ev.preventDefault();
        const listForm = document.forms["create-list-form"];
        const validations = [
            {
                fieldType: "input",
                field: "create-list-name-input",
                message: "Enter list name",
            }
        ];
        const { isValid } = validate(listForm, validations);
        if(isValid) {
            const listName = listForm["create-list-name-input"].value;
            createList(listName);
        }
    };

    const handleUpdateListFormSubmit = (ev) => {
        ev.preventDefault();
        const listForm = document.forms["edit-list-form"];
        const validations = [
            {
                fieldType: "input",
                field: "edit-list-name-input",
                message: "Enter list name",
            }
        ];
        const { isValid } = validate(listForm, validations);
        if(isValid) {
            const listName = listForm["edit-list-name-input"].value;
            updateList(selectedListID, listName);
        };
    }

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
            const taskName = taskForm["task-name-field"].value;
            createTask(taskName);
        };
    };

    renderHeader();
    renderLists();

    modalOpenBtnEls.forEach(modalToggleBtn => modalToggleBtn.onclick = handleModalOpenClick);
    modalCloseBtnEls.forEach(modalCloseBtn => modalCloseBtn.onclick = handleModalCloseClick);
    createListBtnEl.onclick = handleCreateListFormSubmit;
    updateListBtn.onclick = handleUpdateListFormSubmit;
    submitTaskBtnEl.onclick = handleCreateTaskFormSubmit;
    logOutBtnEl.onclick = handleLogOutClick;
};

const renderAuthScreen = () => {
    appEl.innerHTML = authScreenTemplate();

    const tabBtnEls = document.querySelectorAll(".tab-btn");
    const allTabsItemsEls = document.querySelectorAll(".tab-item");
    const submitRegisterBtnEl = document.getElementById("submit-register-btn");
    const submitLoginBtnEl = document.getElementById("submit-login-btn");

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

    changeTab("login-tab");

    const handleTabClick = (ev) => {
        const currentTab = ev.target.getAttribute("data-tab");
        changeTab(currentTab);
    };

    tabBtnEls.forEach(tab => tab.onclick = handleTabClick);
    submitRegisterBtnEl.onclick = handleRegisterFormSubmit;
    submitLoginBtnEl.onclick = handleLoginFormSubmit;
};

window.onload = () => {
    if (isAuthentificated) {
        renderDashboard();
    } else {
        renderAuthScreen();
    }
};
