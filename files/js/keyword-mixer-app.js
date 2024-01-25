// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {getFirestore, collection, addDoc, updateDoc, doc} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCaTODMga4jcKR1Xwo1H7XVhSzyfBwCfRc",
    authDomain: "app-thijsvanhal-nl.firebaseapp.com",
    projectId: "app-thijsvanhal-nl",
    storageBucket: "app-thijsvanhal-nl.appspot.com",
    messagingSenderId: "437337351675",
    appId: "1:437337351675:web:0c273400b65e1f6a7ad75e",
    measurementId: "G-L57H7E26H3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let user;

onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
        user = currentUser;
    } else {
        user = null;
    }
});

// Constanten
const resultTextarea = document.getElementById('result-mixer');
const resultLength = document.getElementById('woorden-totaal');
const keywordsInput1 = document.getElementById('lijst-1');
const keywordsInput2 = document.getElementById('lijst-2');
const keywordsInput3 = document.getElementById('lijst-3');

const statusElement = document.querySelector('.bulk-mixer-status');

let mixedKeywordsArray = [];
let taskIds = [];
let taskIdsSuggestions = [];
let lineNames = [];
let apiMethodes = [];
let api_methode;

// Functie Length
function getLength(mixedKeywords) {
    const string = mixedKeywords.toString();
    return new String(`${string.split('\n').length} Zoekwoorden`);
}

// Functie mixKeywords
function mixKeywords(...lists) {
    let result = lists.reduce((acc, list) => {
        return acc.map((el) => list.map((listEl) => el + (el && listEl ? ' ' : '') + listEl)).flat(Infinity);
    }, ['']);
    return result.join("\n").trim();
}

// Functie voor verwijderen van dubbele zoekwoorden
function removeDuplicates(mixedKeywords) {
    let uniqueKeywords = new Map();
    for (let keyword of mixedKeywords) {
        uniqueKeywords.set(keyword, keyword);
    }
    return Array.from(uniqueKeywords.values()).join("\n");
}

// Code voor automatisch updaten van mixer
var elements = ["lijst-1", "lijst-2", "lijst-3", "optional-list-mix", "optional-list-2", "optional-list-3"];
for (var i = 0; i < elements.length; i++) {
    var el = document.getElementById(elements[i]);
    if (el instanceof HTMLInputElement) {
        el.addEventListener("input", updateMixer);
    } else {
        el.addEventListener("blur", updateMixer);
    }
}

let SeeNotification = true;

function updateMixer () {
    SeeNotification = true;
    var textArea1 = document.getElementById("lijst-1").value;
    var keywords1 = textArea1 ? textArea1.split("\n").filter(Boolean) : [''];
    var textArea2 = document.getElementById("lijst-2").value;
    var keywords2 = textArea2 ? textArea2.split("\n").filter(Boolean) : [''];
    var textArea3 = document.getElementById("lijst-3").value;
    var keywords3 = textArea3 ? textArea3.split("\n").filter(Boolean) : [''];
    var switchOrder = document.getElementById("optional-list-mix").checked;
    var optional2 = document.getElementById("optional-list-2").checked;
    var optional3 = document.getElementById("optional-list-3").checked;
    var mixedKeywords = [];
    
    if (switchOrder) {
        // lijsten wisselen
        if (optional2 && optional3) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords2),
                mixKeywords(keywords1, keywords3),
                mixKeywords(keywords1),
                mixKeywords(keywords1, keywords3, keywords2),
                mixKeywords(keywords2, keywords1, keywords3),
                mixKeywords(keywords2, keywords1),
                mixKeywords(keywords2, keywords3, keywords1),
                mixKeywords(keywords3, keywords1),
                mixKeywords(keywords3, keywords1, keywords2),
                mixKeywords(keywords3, keywords2, keywords1),
            ].join("\n");
        } else if (optional3) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords2),
                mixKeywords(keywords1, keywords3, keywords2),
                mixKeywords(keywords2, keywords1, keywords3),
                mixKeywords(keywords2, keywords1),
                mixKeywords(keywords2, keywords3, keywords1),
                mixKeywords(keywords3, keywords1, keywords2),
                mixKeywords(keywords3, keywords2, keywords1),
            ].join("\n");
        } else if (optional2) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords3),
                mixKeywords(keywords1, keywords3, keywords2),
                mixKeywords(keywords2, keywords1, keywords3),
                mixKeywords(keywords2, keywords3, keywords1),
                mixKeywords(keywords3, keywords1),
                mixKeywords(keywords3, keywords1, keywords2),
                mixKeywords(keywords3, keywords2, keywords1),
            ].join("\n");
        } else {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords3, keywords2),
                mixKeywords(keywords2, keywords1, keywords3),
                mixKeywords(keywords2, keywords3, keywords1),
                mixKeywords(keywords3, keywords1, keywords2),
                mixKeywords(keywords3, keywords2, keywords1),
            ].join("\n");
        }
    } else {
        // lijsten niet wisselen
        if (optional2 && optional3) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords2),
                mixKeywords(keywords1, keywords3),
                mixKeywords(keywords1),
            ].join("\n");
        } else if (optional3) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords2),
            ].join("\n");
        } else if (optional2) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords3),
            ].join("\n");
        } else {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
            ].join("\n");
        }
    }
    let KeywordsArray = mixedKeywords.toLowerCase().split('\n');
    let noDuplicates = removeDuplicates(KeywordsArray.filter(isValidKeywordPhrase));
    var length = getLength(noDuplicates);
    resultTextarea.value = noDuplicates.toString();
    resultLength.textContent = length.toString();
    window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'zoekwoorden_gegenereerd'});
};

function isValidKeywordPhrase(phrase) {
    const words = phrase.split(/\s+/);
    if (words.length > 10) {
        return false;
    }
    for (const word of words) {
        if (word.length > 80) {
            return false;
        }
        const disallowedSymbols = /[^\w\s'-]/;
        if (disallowedSymbols.test(word)) {
            return false;
        }
    }

    return true;
}

// Functie notificatie
function showNotification(message, duration) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Zorg dat alles automatisch geselecteerd wordt
resultTextarea.addEventListener('click', () => {
    if (resultTextarea.value !== '') {
        resultTextarea.select();
        document.execCommand("copy");
        showNotification('Resultaten gekopieerd naar clipboard!', 3000);
        SeeNotification = true;
    }
});

resultTextarea.addEventListener('focus', () => {
    if (resultTextarea.value !== '' && SeeNotification) {
        resultTextarea.select();
        document.execCommand("copy");
        showNotification('Resultaten gekopieerd naar clipboard!', 3000);
        SeeNotification = false;
    }
});
keywordsInput1.addEventListener('click', () => {
    keywordsInput1.select();
});
keywordsInput1.addEventListener('focus', () => {
    keywordsInput1.select();
});
keywordsInput2.addEventListener('click', () => {
    keywordsInput2.select();
});
keywordsInput2.addEventListener('focus', () => {
    keywordsInput2.select();
});
keywordsInput3.addEventListener('click', () => {
    keywordsInput3.select();
});
keywordsInput3.addEventListener('focus', () => {
    keywordsInput3.select();
});
document.getElementsByTagName('div')[0].focus();

// Ophalen van localstorage
function getLocalStorage(name) {
    const localStorageValue = localStorage.getItem(name);
    return localStorageValue ? localStorageValue : '';
}

// Maken van lijsten , ophalen van lijsten in cookies and updaten van accordions en standaard lijsten in lists pushen.
function getSessionStorage(name) {
    const sessionStorageValue = sessionStorage.getItem(name);
    return sessionStorageValue ? JSON.parse(sessionStorageValue) : null;
}

function setSessionStorage(name, value) {
    sessionStorage.setItem(name, JSON.stringify(value));
}

let lists = [];
const listsStorage = getSessionStorage("lists");
if (listsStorage) {
    lists = listsStorage;
    updateAccordion();
}

const addListButton = document.getElementById("add-list-button");
addListButton.addEventListener("click", function() {
    addList();
});

async function addList() {
    const list_name = document.getElementById("list-name");
    const list_values = document.getElementById("list-values");
    const listName = list_name.value;
    const listValues = list_values.value.split("\n");

    const listExists = lists.some((list) => list.name === listName);
    if (listExists) {
        error_modal.show();
        document.getElementById("error-message").innerHTML = `<p class="body-text">Rijtje <b>${listName}</b> bestaat al, pas de naam aan :)</p>`;
        const modalClosedPromise = new Promise((resolve) => {
            error_modal._element.addEventListener("hidden.bs.modal", function () {
                resolve();
            }, { once: true });
        });
        await modalClosedPromise;
        return;
    }

    lists.push({ name: listName, values: listValues });
    updateAccordion();
    setSessionStorage("lists", lists);

    list_name.value = "";
    list_values.value = "";
}

const bulkAddListButton = document.getElementById("bulk-add-list-button");
bulkAddListButton.addEventListener("click", function() {
    bulkaddList();
});

async function bulkaddList() {
    const textarea = document.getElementById('bulk-list-values');
    const rawRows = textarea.value.split('\n');
    const filteredRows = rawRows.filter(row => row.trim() !== "");
    const maxNumCols = Math.max(...filteredRows.map(row => row.split('\t').length));

    for (let col = 0; col < maxNumCols; col++) {
        const listName = filteredRows[0].split('\t')[col];
        const listValues = filteredRows.slice(1).map(row => {
            const columns = row.split('\t');
            return col < columns.length ? columns[col].trim() : "";
        });

        const isEmptyColumn = listValues.every(value => value.trim() === "");
        if (isEmptyColumn) {
            continue;
        }

        const list = { name: listName, values: listValues };
        const listExists = lists.some(list => list.name === listName);

        if (listExists) {
            const error_modal = new bootstrap.Modal(document.getElementById("error-modal"));
            error_modal.show();
            document.getElementById("error-message").innerHTML = `<p class="body-text">Rijtje <b>${listName}</b> bestaat al, pas de naam aan :)</p>`;
            const modalClosedPromise = new Promise((resolve) => {
                error_modal._element.addEventListener("hidden.bs.modal", function () {
                    resolve();
                }, { once: true });
            });
            await modalClosedPromise;
            return;
        }

        lists.push(list);
    }
    updateAccordion();
    setSessionStorage("lists", lists);
    textarea.value = "";
}     



// Verwijderen van alle lijsten
const removeListsButton = document.getElementById("remove-lists-button");
removeListsButton.addEventListener("click", function() {
    removeLists();
});

function removeLists() {
    lists = [];
    sessionStorage.removeItem("lists");
    
    const container = document.querySelector("#alle-lijsten");
    container.innerHTML = "";
}

// Maken en updaten van alle rijtjes als accordions
function updateAccordion() {
    const accordionLists = document.getElementById("alle-lijsten");
    accordionLists.innerHTML = "";

    let rowContainer = document.createElement("div");
    rowContainer.classList.add("row");
    rowContainer.id = "alle-lijsten-row";

    const existingListNames = Array.from(document.querySelectorAll(".accordion-item button")).map((button) => button.innerText.trim());
    const newLists = lists.filter((list) => !existingListNames.includes(list.name));

    for (let i = 0; i < newLists.length; i++) {
        let list = newLists[i];

        let colElement = document.createElement("div");
        colElement.classList.add("col");

        let accordionElement = document.createElement("div");
        accordionElement.classList.add("accordion");
        accordionElement.id = "accordion-list";

        let accordionItem = document.createElement("div");
        accordionItem.classList.add("accordion-item");
        accordionItem.id = list.name;

        let listHeader = document.createElement("h4");
        listHeader.classList.add("accordion-header");
        listHeader.id = "heading" + (i+1);

        let listHeaderButton = document.createElement("button");
        listHeaderButton.classList.add("accordion-button", "collapsed");
        listHeaderButton.type = "button";
        listHeaderButton.setAttribute("data-bs-toggle", "collapse");
        listHeaderButton.setAttribute("data-bs-target", "#collapse" + (i+1));
        listHeaderButton.setAttribute("aria-expanded", "false");
        listHeaderButton.setAttribute("aria-controls", "collapse" + (i+1));
        listHeaderButton.textContent = list.name;

        listHeader.appendChild(listHeaderButton);

        let listContent = document.createElement("div");
        listContent.classList.add("accordion-collapse", "collapse");
        listContent.id = "collapse" + (i+1);
        listContent.setAttribute("aria-labelledby", "heading" + (i+1));
        listContent.setAttribute("data-bs-parent", "#accordion");

        let listContentBody = document.createElement("div");
        listContentBody.classList.add("accordion-body");
        let listValuesUL = document.createElement("ul");
        listValuesUL.classList.add("accordion-unsorted-list");

        for (let j = 0; j < list.values.length; j++) {
            let listValueLI = document.createElement("li");
            listValueLI.style.display = "block";
            listValueLI.textContent = list.values[j];
            listValuesUL.appendChild(listValueLI);
        }
        listContentBody.appendChild(listValuesUL);

        // Edit Option
        let editButton = document.createElement("button");
        editButton.classList.add("btn", "btn-primary");
        editButton.textContent = "Bewerk";
        editButton.addEventListener("click", () => {
            let editTextArea = document.createElement("textarea");
            editTextArea.value = list.values.join("\n");
        
            let editModal = document.createElement("div");
            editModal.classList.add("modal");
            editModal.tabIndex = "-1";
            editModal.role = "dialog";
        
            let editModalDialog = document.createElement("div");
            editModalDialog.classList.add("modal-dialog");
            editModalDialog.role = "document";
        
            let editModalContent = document.createElement("div");
            editModalContent.classList.add("modal-content");
        
            let editModalHeader = document.createElement("div");
            editModalHeader.classList.add("modal-header");
        
            let editModalTitle = document.createElement("h5");
            editModalTitle.classList.add("modal-title");
            editModalTitle.textContent = "Bewerk rijtje";
        
            let editModalBody = document.createElement("div");
            editModalBody.classList.add("modal-body");
            editModalBody.textContent = "Pas de zoekwoorden van het rijtje aan en klik op opslaan";
        
            let editModalFooter = document.createElement("div");
            editModalFooter.classList.add("modal-footer");
        
            let saveButton = document.createElement("button");
            saveButton.classList.add("btn", "btn-primary");
            saveButton.textContent = "Opslaan";
            saveButton.addEventListener("click", () => {
                const newContent = editTextArea.value.split("\n");
                list.values = newContent;
                updateAccordion();
                setSessionStorage("lists", lists);
                closeModal();
            });
        
            let cancelButton = document.createElement("button");
            cancelButton.classList.add("btn", "btn-primary", "secondbutton");
            cancelButton.textContent = "Terug";
            cancelButton.addEventListener("click", closeModal);
        
            editModalHeader.appendChild(editModalTitle);
            editModalBody.appendChild(editTextArea);
            editModalFooter.appendChild(saveButton);
            editModalFooter.appendChild(cancelButton);
        
            editModalContent.appendChild(editModalHeader);
            editModalContent.appendChild(editModalBody);
            editModalContent.appendChild(editModalFooter);
        
            editModalDialog.appendChild(editModalContent);
            editModal.appendChild(editModalDialog);
        
            document.body.appendChild(editModal);
        
            function closeModal() {
                editModal.remove();
                document.body.classList.remove("modal-open");
                document.body.style.paddingRight = "";
                document.body.style.overflow = "";
                const backdrop = document.getElementsByClassName("modal-backdrop");
                if (backdrop.length > 0) {
                    backdrop[0].remove();
                }
            }
        
            const bootstrapModal = new bootstrap.Modal(editModal);
            bootstrapModal.show();
        });
        listContentBody.appendChild(editButton);

        let removeButton = document.createElement("button");
        removeButton.classList.add("btn", "btn-primary", "secondbutton");
        removeButton.textContent = "Verwijder";
        removeButton.addEventListener("click", () => {
            const confirmation = confirm("Weet je zeker dat je dit rijtje wilt verwijderen?");
            if (confirmation) {
                lists = lists.filter((item) => item.name !== list.name);
                setSessionStorage("lists", lists);
                updateAccordion();
            }
        });
        listContentBody.appendChild(removeButton);

        listContent.appendChild(listContentBody);

        accordionItem.appendChild(listHeader);
        accordionItem.appendChild(listContent);
        accordionElement.appendChild(accordionItem);

        colElement.appendChild(accordionElement);
        rowContainer.appendChild(colElement);
        
    }
    accordionLists.appendChild(rowContainer);
}

function addRow() {
    const table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(table.rows.length);
    newRow.id = 'waarde';
    const columns = ['name1', 'name2', 'name3', 'suggestions', 'swapLists', 'optionalList2', 'optionalList3'];

    for (const col of columns) {
        const cell = newRow.insertCell();
        const input = document.createElement('input');
        if (col.includes('List')) {
            input.type = 'checkbox';
            input.className = 'form-check-input';
        } else {
            input.type = 'text';
            input.className = 'form-control';
        }
        input.name = col;
        cell.appendChild(input);
    }

    const actionCell = newRow.insertCell();
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger';
    deleteButton.textContent = 'Verwijder';
    deleteButton.onclick = function () {
        deleteRow(this);
    };
    actionCell.appendChild(deleteButton);
}

function deleteRow(button) {
    const row = button.closest('tr');
    row.parentNode.removeChild(row);
}

const columnOrder = ['suggestions', 'swapLists', 'name1', 'name2', 'optionalList2', 'name3', 'optionalList3'];

function buildTable() {
    const tableRows = document.querySelectorAll('table#dataTable tbody tr#waarde');
    let result = '';

    for (const row of tableRows) {
        const columns = row.querySelectorAll('input');
        result += columnOrder.map((col, index) => {
            const input = Array.from(columns).find(input => input.name === col);
            
            if (col === 'optionalList2' && columns[index - 3].value.trim() === '') {
                return null;
            } else if (col === 'optionalList3' && columns[index - 4].value.trim() === '') {
                return null;
            } else if (input.type === 'checkbox') {
                return input.checked ? 1 : 0;
            } else {
                const value = input.value.trim();
                if (value === '') {
                    return null;
                }
                return value;
            }
        }).filter(value => value !== null).join(',') + '\n';
    }

    document.getElementById('afhankelijk').checked = true;    
    document.getElementById('bulk-input').innerText = result;
}


// Functie voor ophalen van waardes van de lijst op basis van de lijst naam
function getListValues(listName) {
    for (let i = 0; i < lists.length; i++) {
        if (lists[i].name === listName) {
            return lists[i].values.join('\n');
        }
    }
    return '';
}

// Login met DataForSEO
let login;
let password;
let parsed_login_storage;
let login_storage = getLocalStorage("userData");
let email_login = document.getElementById("inputEmail").value;
let api_login = document.getElementById("inputAPI").value;
if (login_storage) {
    parsed_login_storage = JSON.parse(login_storage);
    login = parsed_login_storage.email;
    password = parsed_login_storage.password;
    fetchLanguageData();
    fetchLocationData();
} else {
    login = email_login;
    password = api_login;
    fetchLanguageData();
    fetchLocationData();
}

let modal;
let error_modal;
document.addEventListener('DOMContentLoaded', function() {
    modal = new bootstrap.Modal(document.getElementById("loginModal"));
    error_modal = new bootstrap.Modal(document.getElementById("error-modal"));
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
});
const loginLink = document.getElementById("loginLink");
const loginButton = document.getElementById("loginButton");
const deleteButton = document.getElementById("deleteButton");
const rememberme = document.getElementById("rememberMe");
const logoutButtonContainer = document.getElementById("logoutButtonContainer");

loginLink.onclick = function () {
    modal.show();
    if (login) {
        document.getElementById("inputEmail").value = login;
        document.getElementById("inputAPI").value = password;
        if (login_storage) {
            rememberme.checked = true;
        }
        deleteButton.style.display = 'block';
    } else {
        deleteButton.style.display = 'none';
    }
};

loginButton.onclick = function() {
    if (rememberme.checked) {
        var userData = {
            email: document.getElementById("inputEmail").value,
            password: document.getElementById("inputAPI").value
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        login_storage = getLocalStorage("userData");
        parsed_login_storage = JSON.parse(login_storage);
        login = parsed_login_storage.email;
        password = parsed_login_storage.password;
    } else {
        login = document.getElementById("inputEmail").value;
        password = document.getElementById("inputAPI").value;
    }
};

deleteButton.onclick = function() {
    localStorage.removeItem('userData');
    login = '';
    password = '';
    rememberme.checked = false;
    document.getElementById("inputEmail").value = '';
    document.getElementById("inputAPI").value = '';
    modal.hide();
};

let checkbox = document.getElementById("standaard-data-switch");
checkbox.addEventListener("click", function() {
    if (checkbox.checked) {
        localStorage.setItem("checkbox-KM", "checked");
    } else {
        localStorage.removeItem("checkbox-KM");
    }
});

let checkbox_checked = localStorage.getItem("checkbox-KM");
if (checkbox_checked === "checked") {
    checkbox.checked = true;
}

const error_sluiten_knop = document.querySelector("#error-modal .btn-close");
error_sluiten_knop.onclick = function() {
    document.getElementById("error-modal").style.display = "none";
};

// Filter
let filter_zoekvolume = document.getElementById("filter-zoekvolume");
let filter_zoekvolume_waarde = document.getElementById("filter-zoekvolume-waarde");
let filter_zoekvolume_label = document.getElementById("filter-zoekvolume-label");
filter_zoekvolume.addEventListener("click", function() {
    if (filter_zoekvolume.checked) {
        filter_zoekvolume_waarde.style = "display: inline-flex;height: 40px !important;width: 60px;margin-top: -8px;margin-left: 10px;";
        filter_zoekvolume_label.innerText = "Vul een waarde in. Alles boven deze waarde wordt meegenomen in het Excel document.";
    } else {
        filter_zoekvolume_label.innerText = "Filter output op basis van zoekvolume?";
        filter_zoekvolume_waarde.style = "display: none;";
    }
});

// Mixen van bulk lijsten
const mixListsButton = document.getElementById("zoekvolumes-ophalen");
mixListsButton.addEventListener("click", function() {
    mixLists();
});

async function mixLists() {
    // verwijder huidige waardes
    document.getElementById("save-button").style = "width: auto; display:none;";
    document.querySelector('.bulk-mixer-status').innerHTML = '';
    mixedKeywordsArray = [];
    taskIds = [];
    taskIdsSuggestions = [];
    lineNames = [];
    apiMethodes = [];

    let totalCost = 0;

    const inputTextarea = document.getElementById("bulk-input");
    const lines = inputTextarea.value.split("\n");

    if (!api_login && login_storage === "") {
        error_modal.show();
        document.getElementById("error-message").innerHTML = `<p class="body-text">Je hebt geen DataForSEO API waarden ingesteld.<br><br> Voeg deze eerst toe!</p>`;
        const modalClosedPromise = new Promise((resolve) => {
            error_modal._element.addEventListener("hidden.bs.modal", function () {
                resolve();
            }, { once: true });
            
        });
        await modalClosedPromise;
        modal.show();
        return;
    } else {
        for (const line of lines) {
            const checkvalues = line.split(",");
            const checknonEmptyValues = checkvalues.filter((value, index) => [0, 2, 3, 5].includes(index) && value.trim() !== "" && value.trim() !== "0" && value.trim() !== "1");
            const checkExist = checknonEmptyValues.every(value => {
                return lists.some(list => list.name === value);
            });
            
            if (!checkExist) {
                error_modal.show();
                document.getElementById("error-message").innerHTML = `<p class="body-text">De naam <b>${checknonEmptyValues.join(" + ")}</b> komt niet overeen met de naam van het rijtje.<br> Pas deze aan en probeer opnieuw!</p>`;
                const modalClosedPromise = new Promise((resolve) => {
                    error_modal._element.addEventListener("hidden.bs.modal", function () {
                        resolve();
                    }, { once: true });
                });
                await modalClosedPromise;
                return;
            }
        }

        statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p>De tool begint met het ophalen van de zoekvolumes...</p></div>`);
    
        for (const line of lines) {
            const values = line.split(",");
            const nonEmptyValues = values.filter((value, index) => [0, 2, 3, 5].includes(index) && value.trim() !== "" && value.trim() !== "0" && value.trim() !== "1");
            document.getElementById("optional-list-mix").checked = values[1] === "1";
            if (values[0] !== "0" && values[0] !== "1") {
                document.getElementById("lijst-1").value = getListValues(values[0]);
            } else {
                document.getElementById("lijst-1").value = getListValues(values[2]);
            }
            document.getElementById("lijst-2").value = getListValues(values[3]);
            document.getElementById("optional-list-2").checked = values[4] === "1";
            document.getElementById("lijst-3").value = getListValues(values[5]);
            document.getElementById("optional-list-3").checked = values[6] === "1";
            updateMixer();
            const mixedKeywords = document.getElementById("result-mixer").value.split("\n");
            if (values[0] === "1" || document.getElementById('suggesties').checked == true) {
                var max_keywords = 20;
            } else {
                var max_keywords = 1000;
            }

            const defaultSearchVolumes = mixedKeywords.map(keyword => keyword.trim() !== "" ? 0 : null);

            mixedKeywordsArray.push({
                line: nonEmptyValues.join(" + "),
                maxKeywords: max_keywords,
                mixedKeywords: mixedKeywords,
                searchVolume: defaultSearchVolumes
            });
        }

        const selectedCountry = document.getElementById('search-location').value;
        const selectedLanguage = document.getElementById('search-language').value;

        const SearchVolumeKeywords = mixedKeywordsArray.filter(obj => obj.maxKeywords === 1000).flatMap(obj => obj.mixedKeywords);
        if (SearchVolumeKeywords.length !== 0) {
            const SearchVolumeRequests = Math.ceil(SearchVolumeKeywords.length / 1000);
            totalCost += SearchVolumeRequests * 0.05;
        }
        const SuggestionsKeywords = mixedKeywordsArray.filter(obj => obj.maxKeywords === 20);
        if (SuggestionsKeywords.length !== 0) {
            for (const obj of SuggestionsKeywords) {
                const keywords = obj.mixedKeywords;
                const SuggestionsRequests = Math.ceil(keywords.length / 20);
                totalCost += SuggestionsRequests * 0.05;
            }
        }

        await new Promise((resolve) => {
            const confirmPopup = document.getElementById("popup");
            const costSpan = document.getElementById("cost");

            costSpan.textContent = `$${totalCost.toFixed(2)}`;
            confirmPopup.style.display = "block";

            const hideConfirmation = () => {
                confirmPopup.style.display = "none";
            };

            const cancelButton = document.getElementById("cancel");
            cancelButton.addEventListener("click", async () => {
                hideConfirmation();
                location.reload();
            });

            const confirm = document.getElementById("confirm");
            confirm.removeEventListener("click", hideConfirmation);
            confirm.addEventListener("click", async () => {
                hideConfirmation();
                resolve();
            });
        });

        await Promise.all([
            SearchVolumeData(SearchVolumeKeywords, selectedCountry, selectedLanguage),
            SuggestionsData(SuggestionsKeywords, selectedCountry, selectedLanguage)
        ]);

        if (checkbox.checked) {
            saveData();
        } else {
            document.getElementById("save-button").style = "width: auto;";
        }
        statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p><b>Alles</b> is klaar! Je vindt het Excel bestand in je downloads map!</p></div>`);
        try {
            generateExcel();
        } catch (error) {
            error_modal.show();
            document.getElementById("error-message").innerHTML = `<p class="body-text">De volgende error heeft zich plaatsgevonden: <br><br> ${error}</p>`;
            const modalClosedPromise = new Promise((resolve) => {
                error_modal._element.addEventListener("hidden.bs.modal", function () {
                    resolve();
                }, { once: true });
            });
            await modalClosedPromise;
        }
    }
}

async function SearchVolumeData(keywords, country, language) {
    const numRequests = Math.ceil(keywords.length / 1000);
        
    for (let i = 0; i < numRequests; i++) {
        const startIndex = i * 1000;
        const endIndex = Math.min(startIndex + 1000, keywords.length);
        const keywordsSlice = keywords.slice(startIndex, endIndex);

        const post_array = [{
            "location_name": country,
            "language_name": language,
            "keywords": keywordsSlice,
        }];

        const post_url = `https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_post`;
        const requestPostOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(login + ':' + password)
            }
        };

        // POST request
        const post_response = await fetch(post_url, { ...requestPostOptions, body: JSON.stringify(post_array) });
        const post_result = await post_response.json();
        console.log(post_result.tasks);
        const status = post_result.tasks[0].status_code;
        if (status === 20100) {
            taskIds.push(post_result.tasks[0].id);
        } else {
            error_modal.show();
            document.getElementById("error-message").innerHTML = `<p class="body-text">De volgende error heeft zich plaatsgevonden: <b>${post_result.tasks[0].status_message}</b>. Dit gebeurde tijdens het ophalen van de lijst met als eerste zoekwoord <b>${keywordsSlice[0]}</b> en als laatste <b>${keywordsSlice[keywordsSlice.length - 1]}</b> <br><br> De tool gaat verder maar je zult die zoekwoorden moeten controleren en later opnieuw moeten ophalen!</p>`;
            const modalClosedPromise = new Promise((resolve) => {
                error_modal._element.addEventListener("hidden.bs.modal", function () {
                    resolve();
                }, { once: true });
            });
            await modalClosedPromise;
        }
    }
    
    for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const getApiMethode = "search_volume";
        const results = await fetchData(taskId, login, password, getApiMethode);
        for (const result of results) {
            const keyword = result.keyword;
            let NewSearchVolume;
            if (result.search_volume !== null) {
                NewSearchVolume = result.search_volume
            } else {
                NewSearchVolume = 0;
            }
            
            for (const obj of mixedKeywordsArray) {
                const keywordIndices = [];
                for(let i = 0; i < obj.mixedKeywords.length; i++) {
                    if(obj.mixedKeywords[i] === keyword) keywordIndices.push(i);
                }
                for(const index of keywordIndices) {
                    if(NewSearchVolume < filter_zoekvolume_waarde.value) {
                        obj.mixedKeywords.splice(index, 1);
                        obj.searchVolume.splice(index, 1);
                    } else {
                        obj.searchVolume[index] = NewSearchVolume;
                    }
                }
            }
        }
        statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p>Er zijn zoekvolumes voor de DataForSEO taak met ID <b>${taskId}</b> opgehaald.</p></div>`);
    }
}

async function SuggestionsData(array, country, language) {
    for (const obj of array) {
        const line = obj.line;
        const keywords = obj.mixedKeywords;
        const numRequests = Math.ceil(keywords.length / 20);
            
        for (let i = 0; i < numRequests; i++) {
            const startIndex = i * 20;
            const endIndex = Math.min(startIndex + 20, keywords.length);
            const keywordsSlice = keywords.slice(startIndex, endIndex);

            const post_array = [{
                "location_name": country,
                "language_name": language,
                "keywords": keywordsSlice,
            }];

            const post_url = `https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/task_post`;
            const requestPostOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(login + ':' + password)
                }
            };

            // POST request
            const post_response = await fetch(post_url, { ...requestPostOptions, body: JSON.stringify(post_array) });
            const post_result = await post_response.json();
            console.log(post_result.tasks);
            const status = post_result.tasks[0].status_code;
            if (status === 20100) {
                lineNames.push(line);
                taskIdsSuggestions.push(post_result.tasks[0].id);
            } else {
                error_modal.show();
                document.getElementById("error-message").innerHTML = `<p class="body-text">De volgende error heeft zich plaatsgevonden: <b>${post_result.tasks[0].status_message}</b> <br><br> De tool gaat verder maar je zult rijtje <b>${line}</b> moeten controleren en later opnieuw moeten ophalen!</p>`;
                const modalClosedPromise = new Promise((resolve) => {
                    error_modal._element.addEventListener("hidden.bs.modal", function () {
                        resolve();
                    }, { once: true });
                });
                await modalClosedPromise;
            }
        }
    }

    for (let i = 0; i < taskIdsSuggestions.length; i++) {
        const taskId = taskIdsSuggestions[i];
        const line_name = lineNames[i];
        const getApiMethode = "keywords_for_keywords";
        const results = await fetchData(taskId, login, password, getApiMethode);
        for (const result of results) {
            const keyword = result.keyword;
            let NewSearchVolume;
            if (result.search_volume !== null) {
                NewSearchVolume = result.search_volume
            } else {
                NewSearchVolume = 0;
            }

            const existingObject = mixedKeywordsArray.find(obj => obj.line === line_name);
            if (existingObject) {
                const matchingKeywordIndex = existingObject.mixedKeywords.findIndex((k) =>
                    k === keyword
                );
                if (matchingKeywordIndex !== -1) {
                    if(NewSearchVolume < filter_zoekvolume_waarde.value) {
                        console.log(keyword, NewSearchVolume, filter_zoekvolume_waarde.value);
                        existingObject.mixedKeywords.splice(matchingKeywordIndex, 1);
                        existingObject.searchVolume.splice(matchingKeywordIndex, 1);
                    } else {
                        existingObject.searchVolume[matchingKeywordIndex] = NewSearchVolume;
                    }
                } else {
                    if(NewSearchVolume < filter_zoekvolume_waarde.value) {
                        console.log(keyword, NewSearchVolume, filter_zoekvolume_waarde.value);
                        continue;
                    } else {
                        existingObject.mixedKeywords.push(keyword);
                        existingObject.searchVolume.push(NewSearchVolume);
                    }
                }
            }
            
        }
        statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p>Er zijn zoekvolumes voor de DataForSEO taak met ID <b>${taskId}</b> opgehaald.</p></div>`);
    }
}

async function fetchData(taskId, login, password, getApiMethode) {
    let status = '';
    let fetchResults = [];
    while (status !== 'Ok.') {
        const requestGetOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(login + ':' + password)
            }
        };
        const get_url = `https://api.dataforseo.com/v3/keywords_data/google_ads/${getApiMethode}/task_get/${taskId}`;
        const get_response = await fetch(get_url, requestGetOptions);
        const get_result = await get_response.json();
        console.log(get_result.tasks);
        status = get_result.tasks[0].status_message;
        if (status === 'Ok.') {
            fetchResults = get_result.tasks[0].result;
        } else {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return fetchResults;
}

async function generateExcel() {
    mixedKeywordsArray.forEach(function (keywordObj) {
        const mixedKeywords = keywordObj.mixedKeywords;
        const searchVolume = keywordObj.searchVolume;
    
        if (mixedKeywords.length !== searchVolume.length) {
          const minLength = Math.min(mixedKeywords.length, searchVolume.length);
          keywordObj.mixedKeywords = mixedKeywords.slice(0, minLength);
          keywordObj.searchVolume = searchVolume.slice(0, minLength);
        }
    
        if (keywordObj.searchVolume.length > 0) {
            const combined = keywordObj.searchVolume.map((value, index) => ({
                value,
                index,
                mixedKeyword: keywordObj.mixedKeywords[index],
            }));
            combined.sort((a, b) => b.value - a.value || keywordObj.mixedKeywords.indexOf(a.mixedKeyword) - keywordObj.mixedKeywords.indexOf(b.mixedKeyword));
    
            for (let i = 0; i < keywordObj.mixedKeywords.length; i++) {
                keywordObj.mixedKeywords[i] = combined[i].mixedKeyword;
                keywordObj.searchVolume[i] = combined[i].value;
            }
        }
    });
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);

    const headers = [];
    for (let i = 0; i < mixedKeywordsArray.length; i++) {
        headers.push(mixedKeywordsArray[i].line);
        headers.push("Volume");
        headers.push(null);
    }
    XLSX.utils.sheet_add_aoa(worksheet, [headers], {origin: 'A1'});
  
    const data = [];
    let maxMixedKeywords = 0;
    mixedKeywordsArray.forEach(function (item) {
        if (item.mixedKeywords.length > maxMixedKeywords) {
            maxMixedKeywords = item.mixedKeywords.length;
        }
    });
  
    for (let i = 0; i < maxMixedKeywords; i++) {
        const row = [];
        mixedKeywordsArray.forEach(function (item) {
            row.push(item.mixedKeywords[i]);
            row.push(item.searchVolume[i] !== undefined ? String(item.searchVolume[i]) : null);
            row.push(null);
        });
        data.push(row);
    }

    XLSX.utils.sheet_add_aoa(worksheet, data, {origin: 'A2'});
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bulk-zoekwoordlijsten.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Language & location
let typingTimer;
const Interval = 500;
document.getElementById("search-location").addEventListener("input", function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function() {
        fetchLocationData();
    }, Interval);
});

async function fetchLocationData() {
    const searchInput = document.getElementById("search-location").value;
    const locationResponse = await fetch ('/files/locations.json');
    const locationData = await locationResponse.json();
    const desiredCountries = [searchInput];
    const filteredLocationEntries = locationData.filter(location => {
        return desiredCountries.some(country => location.location_name.toLowerCase().includes(country.toLowerCase()));
    });
  
    const locationOptions = filteredLocationEntries.map(location => location.location_name);
    const locationDropdown = document.getElementById('location-dropdown');
    createCustomDropdown(locationDropdown, 'location-options', 'search-location', locationOptions);
}

async function fetchLanguageData() {
    const languageResponse = await fetch("/files/languages.json");
    const languageData = await languageResponse.json();
    const languageOptions = languageData.map(language => language.language_name);

    const languageDropdown = document.getElementById('language-dropdown');
    createCustomDropdown(languageDropdown, 'language-options', 'search-language', languageOptions);
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.custom-dropdown')) {
        closeOptions();
    }
});

function closeOptions () {
    const dropdowns = document.querySelectorAll('.custom-dropdown .dropdown-options');
    dropdowns.forEach((dropdown) => {
        dropdown.classList.remove('open');
    });
}

function createCustomDropdown(dropdown, optionsId, searchInputId, data) {
    const dropdownOptions = document.getElementById(optionsId);
    const searchInput = document.getElementById(searchInputId);
  
    data.forEach(optionText => {
        const option = document.createElement('li');
        option.textContent = optionText;
        option.dataset.value = optionText;
        dropdownOptions.appendChild(option);
    
        option.addEventListener('click', () => {
            document.querySelector(`#${dropdown.id} input`).value = optionText;
            closeOptions();
        });
    });
  
    // Show/hide dropdown on input focus
    searchInput.addEventListener('focus', () => {
        document.getElementById(searchInputId).value = '';
        const options = document.getElementById(optionsId);
        options.classList.add('open');
        filterOptions(optionsId, '')
    });
  
    searchInput.addEventListener('input', () => {
      filterOptions(optionsId, searchInput.value.toLowerCase());
    });
}
  
function filterOptions(optionsId, filter) {
    const options = document.querySelectorAll(`#${optionsId} li[data-value]`);
    options.forEach(option => {
      const optionText = option.dataset.value.toLowerCase();
      if (optionText.includes(filter)) {
        option.style.display = 'block';
      } else {
        option.style.display = 'none';
      }
    });
}

// Disabled
const disabled = document.getElementById("bulk-input");
const disabled1 = document.getElementById("zoekvolumes");
const disabled2 = document.getElementById("suggesties");
const disabled3 = document.getElementById("afhankelijk");
const radioButtons = document.querySelectorAll('input[name="flexRadioDefault"]');
const afhankelijkRadio = document.getElementById("afhankelijk");

disabled.addEventListener("input", function() {
    if (disabled.value != '' && disabled1.checked == true || disabled2.checked == true || disabled3.checked == true) {
        mixListsButton.removeAttribute("disabled");
        checkErrors();
    } else {
        mixListsButton.setAttribute("disabled", "disabled");
    }
});

disabled1.addEventListener("change", function() {
    if (disabled.value != '' && disabled1.checked == true || disabled2.checked == true || disabled3.checked == true) {
        mixListsButton.removeAttribute("disabled");
        checkErrors();
    } else {
        mixListsButton.setAttribute("disabled", "disabled");
    }
});

disabled2.addEventListener("change", function() {
    if (disabled.value != '' && disabled2.checked == true || disabled1.checked == true || disabled3.checked == true) {
        mixListsButton.removeAttribute("disabled");
        checkErrors();
    } else {
        mixListsButton.setAttribute("disabled", "disabled");
    }
});

disabled3.addEventListener("change", function() {
    if (disabled.value != '' && disabled3.checked == true || disabled1.checked == true || disabled3.checked == true) {
        mixListsButton.removeAttribute("disabled");
        checkErrors();
    } else {
        mixListsButton.setAttribute("disabled", "disabled");
    }
});

function checkErrors() {
    const lines = disabled.value.trim().split('\n');
    const firstLine = lines[0];

    if ((firstLine.startsWith('0') || firstLine.startsWith('1')) && !afhankelijkRadio.checked) {
        afhankelijkRadio.checked = true;
        radioButtons.forEach(radio => {
            if (radio !== afhankelijkRadio) {
                radio.checked = false;
            }
        });
    } else if (!(firstLine.startsWith('0') || firstLine.startsWith('1')) && afhankelijkRadio.checked) {
        error_modal.show();
        document.getElementById("error-message").innerHTML = `<p class="body-text">Je hebt niet de juiste API methode geselecteerd. Je kunt enkel 'verschilt per regel' selecteren als je ook rijtjes gaat mixen. Selecteer voor nu 'Zoekvolumes' of 'Suggesties'</p>`;
        afhankelijkRadio.checked = false;
        radioButtons.forEach(radio => radio.checked = false);
        mixListsButton.setAttribute("disabled", "disabled");
    }
}

// Data ophalen op basis van taskId's in html form.
async function getData (login, password) {
    mixedKeywordsArray = [];
    const taskIdsInput = document.getElementById('bulk-get-data').value.split("\n");
    const taskIds = [];
    const apiMethodes = [];

    for (let i = 0; i < taskIdsInput.length; i++) {
        const line = taskIdsInput[i];
    
        const slash = line.split("/");
        const space = line.split("\t");

        const taskId = space[0];
        const api_methode = slash[3];
        taskIds.push(taskId);
        apiMethodes.push(api_methode);

        const getApiMethode = apiMethodes[i];
        const results = await fetchData(taskId, login, password, getApiMethode);
        console.log(results);
        const keywords = [];
        const searchVolumes = [];
        for (const result of results) {
            keywords.push(result.keyword);
            if (result.search_volume !== null) {
                var SearchVolume = result.search_volume;
            } else {
                var SearchVolume = 0;
            }
            searchVolumes.push(SearchVolume);
        }
        mixedKeywordsArray.push({
            line: taskIds[i],
            mixedKeywords: keywords,
            searchVolume: searchVolumes
        });
    }
    generateExcel();
}

//database
async function saveData() {
    const titel = mixedKeywordsArray[0].line;
    const newData = { data: JSON.stringify(mixedKeywordsArray), titel: titel, timestamp: new Date().toLocaleString(), userId: user.uid };
    
    try {
        const docRef = await addDoc(collection(db, "historicDataKWM"), newData);

        await updateDoc(doc(db, "historicDataKWM", docRef.id), {
            id: docRef.id
        });
        
        const successToast = document.getElementById("success-toast");
        const bootstrapToast = new bootstrap.Toast(successToast);
        bootstrapToast.show();
        document.getElementById("save-button").style = "width: auto; display:none;";
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

document.getElementById("save-button").addEventListener("click", saveData);