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
let KeywordsArray = [];
let taskIds = [];
let taskIdsSuggestions = [];
let lineNames = [];

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
const elements = ["lijst-1", "lijst-2", "lijst-3", "optional-list-mix", "optional-list-2", "optional-list-3"];
elements.forEach(function(element) {
    let el = document.getElementById(element);
    if (el instanceof HTMLInputElement) {
        el.addEventListener("input", updateMixer);
    } else {
        el.addEventListener("blur", updateMixer);
    }
});

let SeeNotification = true;

function updateMixer () {
    SeeNotification = true;
    const textArea1 = document.getElementById("lijst-1").value;
    const keywords1 = textArea1 ? textArea1.split("\n").filter(Boolean) : [''];
    const textArea2 = document.getElementById("lijst-2").value;
    const keywords2 = textArea2 ? textArea2.split("\n").filter(Boolean) : [''];
    const textArea3 = document.getElementById("lijst-3").value;
    const keywords3 = textArea3 ? textArea3.split("\n").filter(Boolean) : [''];
    const switchOrder = document.getElementById("optional-list-mix").checked;
    const optional2 = document.getElementById("optional-list-2").checked;
    const optional3 = document.getElementById("optional-list-3").checked;
    let mixedKeywords = [];
    
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
    const KeywordsArray = mixedKeywords.toLowerCase().split('\n');
    const noDuplicates = removeDuplicates(KeywordsArray.filter(isValidKeywordPhrase));
    const length = getLength(noDuplicates);
    resultTextarea.value = noDuplicates.toString();
    resultLength.textContent = length.toString();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({'event': 'zoekwoorden_gegenereerd'});
};

function isValidKeywordPhrase(phrase) {
    const modifiedPhrase = phrase.replace(/(site:|search:)/g, '');

    if (modifiedPhrase.length > 80) {
        return false;
    }

    if (modifiedPhrase !== modifiedPhrase.trim()) {
        return false;
    }    

    const objectReplacementCharacterRegex = /\uFFFC/;
    if (objectReplacementCharacterRegex.test(modifiedPhrase)) {
        return false;
    }

    const invalidSymbolsRegex = /[,!@%^()={}~`'’´×®❤*<>–;?\\|―]/; 
    if (invalidSymbolsRegex.test(modifiedPhrase)) {
        return false;
    }

    const fourByteUnicodeRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u{10000}-\u{10FFFF}]/u;
    if (fourByteUnicodeRegex.test(modifiedPhrase)) {
        return false;
    }

    const words = modifiedPhrase.split(/\s+/);
    if (words.length > 10) {
        return false;
    }
    for (const word of words) {
        if (word === '0') {
            return false;
        }
        if (!/^(C\+\+)$/.test(word) && /[\.\-\+]/.test(word)) {
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
            removeLists();
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
async function updateAccordion() {
    const accordionLists = document.getElementById("alle-lijsten");
    accordionLists.innerHTML = "";

    let rowContainer = document.createElement("div");
    rowContainer.classList.add("row");
    rowContainer.id = "alle-lijsten-row";

    const existingListNames = Array.from(document.querySelectorAll(".accordion-item button")).map((button) => button.innerText.trim());
    const newLists = lists.filter((list) => !existingListNames.includes(list.name));

    const fragment = document.createDocumentFragment();

    newLists.forEach((list, i) => {
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

        list.values.forEach(value => {
            let listValueLI = document.createElement("li");
            listValueLI.style.display = "block";
            listValueLI.textContent = value;
            listValuesUL.appendChild(listValueLI);
        })

        listContentBody.appendChild(listValuesUL);

        // Edit Option
        let editButton = document.createElement("button");
        editButton.classList.add("btn", "btn-primary");
        editButton.textContent = "Bewerk";
        editButton.addEventListener("click", () => {
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

            let formElement = document.createElement("div");
            formElement.className = "form-floating";

            let inputElement = document.createElement("input");
            inputElement.className = "form-control";
            inputElement.placeholder = "Vul naam van rijtje in";
            inputElement.type = "text";
            inputElement.id = "edit-modal-list";
            inputElement.value = list.name;
            let inputLabel = document.createElement("label");
            inputLabel.setAttribute("for", "edit-modal-list");
            inputLabel.textContent = "Naam rijtje";

            formElement.appendChild(inputElement);
            formElement.appendChild(inputLabel);

            let divTextarea = document.createElement("div");
            divTextarea.className = "form-floating";
            divTextarea.style.marginTop = "1rem";

            let textareaElement = document.createElement("textarea");
            textareaElement.className = "form-control";
            textareaElement.placeholder = "Plaats zoekwoorden hier";
            textareaElement.id = "edit-modal-values"
            textareaElement.value = list.values.join("\n");

            let textareaLabel = document.createElement("label");
            textareaLabel.setAttribute("for", "edit-modal-values");
            textareaLabel.textContent = "Zoekwoorden";

            divTextarea.appendChild(textareaElement);
            divTextarea.appendChild(textareaLabel);

            editModalBody.appendChild(formElement);
            editModalBody.appendChild(divTextarea);
        
            let editModalFooter = document.createElement("div");
            editModalFooter.classList.add("modal-footer");
        
            let saveButton = document.createElement("button");
            saveButton.classList.add("btn", "btn-primary");
            saveButton.textContent = "Opslaan";
            saveButton.addEventListener("click", () => {
                const newTitle = inputElement.value;
                const newKeywords = textareaElement.value.split("\n");
                list.name = newTitle;
                list.values = newKeywords;
                updateAccordion();
                setSessionStorage("lists", lists);
                closeModal();
            });
        
            let cancelButton = document.createElement("button");
            cancelButton.classList.add("btn", "btn-primary", "secondbutton");
            cancelButton.textContent = "Terug";
            cancelButton.addEventListener("click", closeModal);
        
            editModalHeader.appendChild(editModalTitle);
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
        removeButton.addEventListener("click", async () => {
            await new Promise((resolve) => {
                const confirmPopup = document.getElementById("popup");
                const confirmPopupBodyText = document.getElementById("popup-body-text");
    
                confirmPopupBodyText.innerHTML = `Weet je zeker dat je dit rijtje wilt verwijderen?`;
                confirmPopup.style.display = "block";
    
                const hideConfirmation = () => {
                    confirmPopup.style.display = "none";
                };
    
                const cancelButton = document.getElementById("cancel");
                cancelButton.addEventListener("click", async () => {
                    hideConfirmation();
                    resolve();
                });
    
                const confirm = document.getElementById("confirm");
                confirm.removeEventListener("click", hideConfirmation);
                confirm.addEventListener("click", async () => {
                    lists = lists.filter((item) => item.name !== list.name);
                    setSessionStorage("lists", lists);
                    updateAccordion();
                    hideConfirmation();
                    resolve();
                });
            });
        });
        listContentBody.appendChild(removeButton);

        listContent.appendChild(listContentBody);
        accordionItem.appendChild(listHeader);
        accordionItem.appendChild(listContent);
        accordionElement.appendChild(accordionItem);
        colElement.appendChild(accordionElement);
        rowContainer.appendChild(colElement);
        
    });
    rowContainer.appendChild(fragment);
    accordionLists.appendChild(rowContainer);
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
        let userData = {
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

// Standaard Datum selecties
let today = new Date();

const startDate = new Date();
startDate.setMonth(today.getMonth() - 1, 1);

const threeMonthStartDate = new Date(startDate);
threeMonthStartDate.setMonth(startDate.getMonth() - 2);

const twelveMonthStartDate = new Date(startDate);
twelveMonthStartDate.setMonth(startDate.getMonth() - 11);

const twoYearStartDate = new Date(startDate);
twoYearStartDate.setMonth(startDate.getMonth() - 23);

const fourYearStartDate = new Date(startDate);
fourYearStartDate.setMonth(startDate.getMonth() - 47);

//Datepicker
let endDate = new Date(today);
endDate.setDate(0);

const beginDateString = fourYearStartDate.toISOString().split("T")[0];
const endDateString = endDate.toISOString().split("T")[0];

let startDateSelection;
let endDateSelection;

startDateSelection = twelveMonthStartDate;
endDateSelection = endDate;

const defaultDateString = twelveMonthStartDate.toISOString().split("T")[0];
document.getElementById('datepicker').value = `${defaultDateString} - ${endDateString}`;

const picker = new easepick.create({
    element: "#datepicker",
    css: [
        "/files/css/easypick.css",
        "/files/css/styles.css"
    ],
    setup(picker) {
        picker.on('select', (e) => {
            startDateSelection = e.detail.start;
            endDateSelection = e.detail.end;
            console.log(startDateSelection, endDateSelection);
        });
    },
    zIndex: 10,
    LockPlugin: {
        minDate: beginDateString,
        maxDate: endDateString
    },
    PresetPlugin: {
        position: "right",
        customPreset: {
            'Afgelopen maand': [new Date(startDate), new Date(endDate)],
            'Afgelopen 3 maanden': [new Date(threeMonthStartDate), new Date(endDate)],
            'Afgelopen 12 maanden': [new Date(twelveMonthStartDate), new Date(endDate)],
            'Afgelopen 2 jaar': [new Date(twoYearStartDate), new Date(endDate)],
            'Afgelopen 4 jaar': [new Date(fourYearStartDate), new Date(endDate)],
        },
        customLabels: ['Afgelopen maand', 'Afgelopen 3 maanden', 'Afgelopen 12 maanden', 'Afgelopen 2 jaar', 'Afgelopen 4 jaar']
    },
    AmpPlugin: {
        dropdown: {
            months: true,
            years: true,
            minYear: 2020
        },
        darkMode: false
    },
    plugins: [
        "RangePlugin",
        "LockPlugin",
        "PresetPlugin",
        "AmpPlugin"
    ]
})
  
function getAllMonthsBetween(start, end) {
    const monthsArray = [];
    let currentDate = new Date(start.getTime());

    while (currentDate <= end) {
        const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        monthsArray.push(formattedDate);
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
  
    return monthsArray.reverse();
}

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

function levenshtein(a, b) {
    if (a.length === 0) return b.length; 
    if (b.length === 0) return a.length; 
    let matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

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
    KeywordsArray = [];
    taskIds = [];
    taskIdsSuggestions = [];
    lineNames = [];
    let max_keywords;

    KeywordsArray.push({
        line: [],
        mixedKeywords: [],
        Month: [],
        searchVolume: []
    });

    let totalCost = 0;

    const inputTextarea = document.getElementById("bulk-input");
    const lines = inputTextarea.value.split("\n");

    const apiMethodSelected = document.querySelector('input[name="RadioApiMethode"]:checked');
    const exportSelected = document.querySelector('input[name="RadioExport"]:checked');

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
    } else if (!apiMethodSelected || !exportSelected) {
        let missingSelectionMessage = "<p class='body-text'>Je moet een keuze maken voor";
        if (!apiMethodSelected) {
            missingSelectionMessage += " <b>API Methode</b>";
        }
        if (!exportSelected) {
            if (!apiMethodSelected) {
                missingSelectionMessage += " en";
            }
            missingSelectionMessage += " <b>Export</b>";
        }
        missingSelectionMessage += ".</p>";

        error_modal.show();
        document.getElementById("error-message").innerHTML = missingSelectionMessage;
        const modalClosedPromise = new Promise((resolve) => {
            error_modal._element.addEventListener("hidden.bs.modal", function () {
                resolve();
            }, { once: true });
        });
        await modalClosedPromise;
        return;
    } else {
        for (const line of lines) {
            const checkvalues = line.split(",");
            const checknonEmptyValues = checkvalues.filter((value, index) => [0, 2, 3, 5].includes(index) && value.trim() !== "" && value.trim() !== "0" && value.trim() !== "1");
            
            let nonExistingValues = [];
            let typoSuggestions = {};
        
            for (const value of checknonEmptyValues) {
                if (!lists.some(list => list.name === value)) {
                    nonExistingValues.push(value);
                    let closestMatch = lists.reduce((acc, list) => {
                        let distance = levenshtein(value, list.name);
                        if (distance < acc.distance) {
                            return { name: list.name, distance };
                        }
                        return acc;
                    }, { name: "", distance: Infinity });
        
                    if (closestMatch.distance <= 2) {
                        typoSuggestions[value] = closestMatch.name;
                    }
                }
            }
        
            if (nonExistingValues.length > 0) {
                let errorMessage = `<p class="body-text">In het rijtje <b>${checknonEmptyValues.join(" + ")}</b> zijn de volgende namen niet gevonden: <i>${nonExistingValues.join(", ")}</i><br>`;
                for (const [wrong, suggestion] of Object.entries(typoSuggestions)) {
                    errorMessage += `<br>Bedoelde je "${suggestion}" in plaats van "${wrong}" ?<br>`;
                }
                errorMessage += "<br>Voeg de missende rijtjes eerst toe of corrigeer de typfouten en probeer opnieuw!</p>";
        
                error_modal.show();
                document.getElementById("error-message").innerHTML = errorMessage;
        
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
                max_keywords = 20;
            } else {
                max_keywords = 1000;
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
            const confirmPopupBodyText = document.getElementById("popup-body-text");

            confirmPopupBodyText.innerHTML = `<strong>Let op!</strong> Dit gaat in totaal <strong><span id="cost">$${totalCost.toFixed(2)}</span></strong> kosten. Weet je zeker dat je dit geld gaat uitgeven? `;
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
            if (document.getElementById('kolom').checked == true) {
                generateExcel();
            } else {
                generateCSV();
            }
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

        const startDate = startDateSelection.toISOString().split("T")[0];
        const endDate = endDateSelection.toISOString().split("T")[0];
        console.log(startDate, endDate);

        const post_array = [{
            "location_name": country,
            "language_name": language,
            "keywords": keywordsSlice,
            "date_from": startDate,
            "date_to": endDate,
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
        const apiMethode = "search_volume";
        const results = await fetchData(taskId, login, password, apiMethode);
        for (const result of results) {
            const keyword = result.keyword;

            if (document.getElementById('kolom').checked == true) {
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
            } else {
                const searches = result.monthly_searches;
                const AllMonths = getAllMonthsBetween(startDateSelection, endDateSelection);

                for (const obj of mixedKeywordsArray) {
                    for(let i = 0; i < obj.mixedKeywords.length; i++) {
                        if(obj.mixedKeywords[i] === keyword) {
                            const line_name = obj.line;  
                            if (result.monthly_searches !== null) {
                                for (let j = 0; j < searches.length; j++) {
                                    const search_volume = searches[j].search_volume;
                                    const date = `${searches[j].year}-${searches[j].month}-1`;
                                    KeywordsArray[0].line.push(line_name);
                                    KeywordsArray[0].mixedKeywords.push(keyword);
                                    KeywordsArray[0].searchVolume.push(search_volume);
                                    KeywordsArray[0].Month.push(date);
                                } 
                            } else {
                                for (let j = 0; j < AllMonths.length; j++) {
                                    KeywordsArray[0].line.push(line_name);
                                    KeywordsArray[0].mixedKeywords.push(keyword);
                                    KeywordsArray[0].searchVolume.push((0));
                                    KeywordsArray[0].Month.push(AllMonths[j]);
                                }
                            }
                        }
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
        const apiMethode = "keywords_for_keywords";
        const results = await fetchData(taskId, login, password, apiMethode);
        for (const result of results) {
            const keyword = result.keyword;

            if (document.getElementById('kolom').checked == true) {
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
                            existingObject.mixedKeywords.splice(matchingKeywordIndex, 1);
                            existingObject.searchVolume.splice(matchingKeywordIndex, 1);
                        } else {
                            existingObject.searchVolume[matchingKeywordIndex] = NewSearchVolume;
                        }
                    } else {
                        if(NewSearchVolume < filter_zoekvolume_waarde.value) {
                            continue;
                        } else {
                            existingObject.mixedKeywords.push(keyword);
                            existingObject.searchVolume.push(NewSearchVolume);
                        }
                    }
                }
            } else {
                const searches = result.monthly_searches;
                const AllMonths = getAllMonthsBetween(startDateSelection, endDateSelection);
                let keywordFound = false;

                for (const obj of mixedKeywordsArray) {
                    for(let i = 0; i < obj.mixedKeywords.length; i++) {
                        if(obj.mixedKeywords[i] === keyword) {
                            keywordFound = true;

                            const line_name = obj.line;  
                            if (result.monthly_searches !== null) {
                                for (let j = 0; j < searches.length; j++) {
                                    const search_volume = searches[j].search_volume;
                                    const date = `${searches[j].year}-${searches[j].month}-1`;
                                    KeywordsArray[0].line.push(line_name);
                                    KeywordsArray[0].mixedKeywords.push(keyword);
                                    KeywordsArray[0].searchVolume.push(search_volume);
                                    KeywordsArray[0].Month.push(date);
                                } 
                            } else {
                                for (let j = 0; j < AllMonths.length; j++) {
                                    KeywordsArray[0].line.push(line_name);
                                    KeywordsArray[0].mixedKeywords.push(keyword);
                                    KeywordsArray[0].searchVolume.push((0));
                                    KeywordsArray[0].Month.push(AllMonths[j]);
                                }
                            }
                        }
                    }
                    if (keywordFound) break;
                }
                if (!keywordFound) {
                    if (result.monthly_searches !== null) {
                        for (let j = 0; j < searches.length; j++) {
                            const search_volume = searches[j].search_volume;
                            const date = `${searches[j].year}-${searches[j].month}-1`;
                            KeywordsArray[0].line.push(line_name);
                            KeywordsArray[0].mixedKeywords.push(keyword);
                            KeywordsArray[0].searchVolume.push(search_volume);
                            KeywordsArray[0].Month.push(date);
                        }
                    } else {
                        for (let j = 0; j < AllMonths.length; j++) {
                            KeywordsArray[0].line.push(line_name);
                            KeywordsArray[0].mixedKeywords.push(keyword);
                            KeywordsArray[0].searchVolume.push(0);
                            KeywordsArray[0].Month.push(AllMonths[j]);
                        }
                    }
                }
            }
            
        }
        statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p>Er zijn zoekvolumes voor de DataForSEO taak met ID <b>${taskId}</b> opgehaald.</p></div>`);
    }
}

async function fetchData(taskId, login, password, apiMethode) {
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
        const get_url = `https://api.dataforseo.com/v3/keywords_data/google_ads/${apiMethode}/task_get/${taskId}`;
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

async function generateCSV() {
    const headers = ["Cluster", "Zoekwoord", "Maand", "Volume"];
    const data = [headers];

    for (let i = 0; i < KeywordsArray[0].mixedKeywords.length; i++) {
        KeywordsArray.forEach(function (item) {
            const row = [
                item.line[i],
                item.mixedKeywords[i],
                item.Month[i] !== undefined ? String(item.Month[i]) : null,
                item.searchVolume[i] !== undefined ? String(item.searchVolume[i]) : null
            ];
            data.push(row);
        });
    }

    const csvContent = Papa.unparse(data);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bulk-zoekwoordlijsten.csv';
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
const listInput = document.getElementById('bulk-input');
const radioButtons = document.querySelectorAll('input[name="RadioApiMethode"]');
const afhankelijkRadio = document.getElementById("afhankelijk");

afhankelijkRadio.addEventListener("change", function() {
    const lines = listInput.value.trim().split('\n');
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
});

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

        const apiMethode = apiMethodes[i];
        const results = await fetchData(taskId, login, password, apiMethode);
        console.log(results);
        const keywords = [];
        const searchVolumes = [];
        for (const result of results) {
            let SearchVolume;
            keywords.push(result.keyword);
            if (result.search_volume !== null) {
                SearchVolume = result.search_volume;
            } else {
                SearchVolume = 0;
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