// JavaScript Code

// Constanten
const resultTextarea = document.getElementById('result-mixer');
const resultLength = document.getElementById('woorden-totaal');
const keywordsInput1 = document.getElementById('lijst-1');
const keywordsInput2 = document.getElementById('lijst-2');
const keywordsInput3 = document.getElementById('lijst-3');

let mixedKeywordsArray = [];
let taskIds = [];
let lineNames = [];
let apiMethodes = [];
let login;
let password;
let api_methode;
let parsed_login_storage;
let login_storage = getLocalStorage("userData");
let email_login = document.getElementById("inputEmail").value;
let api_login = document.getElementById("inputAPI").value;
if (login_storage) {
    parsed_login_storage = JSON.parse(login_storage);
    login = parsed_login_storage.email;
    password = parsed_login_storage.password;
} else {
    login = email_login;
    password = api_login;
}

    
// Alert voor meer dan 10.000 zoekwoorden
let showAlert = true;
function showMaxWordCountAlert(mixedKeywords) {
    const string = mixedKeywords.toString();
    const newlineIndex = string.indexOf('\n');
    const eerste_zoekwoord = string.substring(0, newlineIndex);
    if (showAlert) {
        if (document.documentElement.lang === 'nl') {
            window.alert('In Google Ads kun je maximaal 10.000 woorden plakken, pas de zoekwoordlijst met als eerste zoekwoord "' + eerste_zoekwoord + '" aan!');
        } else if (document.documentElement.lang === 'en') {
            window.alert('You can only paste up to 10.000 keywords in Google Ads, change the keyword list with the first keyword "' + eerste_zoekwoord + '" aan!');
        }
        showAlert = false;
    }
}

// Functie Length
function getLength(mixedKeywords) {
    const string = mixedKeywords.toString();
    if (string.split('\n').length >= 10000) {
        showMaxWordCountAlert(mixedKeywords);
    }
    if (document.documentElement.lang === 'nl') {
        return new String(`${string.split('\n').length} Zoekwoorden`);
    } else if(document.documentElement.lang === 'en') {
        return new String(`${string.split('\n').length} Keywords`);
    }
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
    let keywords = mixedKeywords.toLowerCase().split("\n");
    let uniqueKeywords = new Map();
    for (let keyword of keywords) {
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
    let noDuplicates = removeDuplicates(mixedKeywords);
    var length = getLength(noDuplicates);
    resultTextarea.value = noDuplicates.toString();
    resultLength.textContent = length.toString();
    window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'zoekwoorden_gegenereerd'});
};

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
        if (document.documentElement.lang === 'nl') {
            showNotification('Resultaten gekopieerd naar clipboard!', 3000);
            showAlert = true;
        } else if(document.documentElement.lang === 'en') {
            showNotification('Results copied to clipboard!', 3000);
            showAlert = true;
        }
    }
});

resultTextarea.addEventListener('focus', () => {
    if (resultTextarea.value !== '' && SeeNotification) {
        resultTextarea.select();
        document.execCommand("copy");
        if (document.documentElement.lang === 'nl') {
            showNotification('Resultaten gekopieerd naar clipboard!', 3000);
        } else if(document.documentElement.lang === 'en') {
            showNotification('Results copied to clipboard!', 3000);
        }
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
    lists = JSON.parse(listsStorage);
    updateAccordion();
}

const accordionItems = document.querySelectorAll("#standaard-accordion-item");
accordionItems.forEach((item) => {
    const button = item.querySelector("button");
    const listValues = item.querySelectorAll(".accordion-body li");

    const listName = button.innerText.trim();
    const values = Array.from(listValues).map((li) => li.innerText.trim());

    const existingList = lists.find((list) => list.name === listName);
    if (!existingList) {
        lists.push({ name: listName, values: values });
    }
});

function addList() {
    const list_name = document.getElementById("list-name");
    const list_values = document.getElementById("list-values");
    const listName = list_name.value;
    const listValues = list_values.value.split("\n");

    const listExists = lists.some((list) => list.name === listName);
    if (listExists) {
        window.alert(`Rijtje ${listName} bestaat al, pas de naam aan :)`);
        return;
    }

    lists.push({ name: listName, values: listValues });
    updateAccordion();
    setSessionStorage("lists", lists);

    list_name.value = "";
    list_values.value = "";
}

function bulkaddList() {
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
            window.alert(`Rijtje ${listName} bestaat al, pas de naam aan :)`);
            continue;
        }

        lists.push(list);
    }
    updateAccordion();
    setSessionStorage("lists", lists);
    textarea.value = "";
}     

// Verwijderen van alle lijsten
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

// login form
var modal = document.getElementById("loginModal");
var button = document.querySelector("#inlog_knop");
var span = document.getElementsByClassName("btn-close")[0];
var loginButton = document.getElementById("loginButton");
var logoutButton = document.getElementById("logoutButton");
var rememberme = document.getElementById("rememberMe");
window.onload = inlogUpdate(login_storage, login, password, email_login, api_login);

function inlogUpdate(login_storage, login, password, email_login, api_login) {
    var ingelogd = document.getElementById("ingelogd");
    var ingelogd_text = document.getElementById("ingelogd_text");
    const login_email_veld = document.getElementById("inputEmail");
    const login_api_veld = document.getElementById("inputAPI");
    if (login_storage) {
        ingelogd.textContent = "Je bent op dit moment ingelogd met e-mail: " + login;
        ingelogd_text.textContent = "Je bent op dit moment ingelogd met e-mail: " + login;
        login_email_veld.value = login;
        login_api_veld.value = password;
        rememberme.checked = true;
        fetchLocationLanguageData(login, password);
    } else if (email_login != "") {
        ingelogd.textContent = "Je bent op dit moment ingelogd met e-mail: " + email_login;
        ingelogd_text.textContent = "Je bent op dit moment ingelogd met e-mail: " + email_login;
        login_email_veld.value = email_login;
        login_api_veld.value = api_login;
    } else {
        ingelogd.textContent = "Je bent op dit moment nog niet ingelogd!";
        ingelogd_text.textContent = "Je bent op dit moment nog niet ingelogd!";
    }
}

button.onclick = function() {
    modal.style.display = "block";
};

span.onclick = function() {
    modal.style.display = "none";
};

// Store login and password in cookie
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
        email_login = login;
        api_login = password;
    }
    inlogUpdate(login_storage, login, password, email_login, api_login);
    fetchLocationLanguageData(login, password);
};

logoutButton.onclick = function() {
    document.getElementById("inputEmail").value = '';
    document.getElementById("inputAPI").value = '';
    document.getElementById("ingelogd_text").textContent = '';
    rememberme.checked = false;
    localStorage.removeItem('userData');
    login_storage = '';
    inlogUpdate(login_storage, login, password, email_login, api_login);
};

// Mixen van bulk lijsten
async function mixLists(login_storage, login, password, api_login) {
    // verwijder huidige waardes
    document.querySelector('.bulk-mixer-status').innerHTML = '';
    mixedKeywordsArray = [];
    taskIds = [];
    lineNames = [];
    apiMethodes = [];

    const inputTextarea = document.getElementById("bulk-input");
    const statusElement = document.querySelector('.bulk-mixer-status');
    const lines = inputTextarea.value.split("\n");

    if (!api_login && login_storage === "") {
        window.alert('Je bent niet ingelogd! Log in en probeer het opnieuw!');
    } else {
        const confirmed = confirm("Weet je zeker dat je een API call gaat maken? Dit kost geld!");
  
        if (!confirmed) {
        return;
        }

        for (const line of lines) {
            const checkvalues = line.split(",");
            const checknonEmptyValues = checkvalues.filter((value, index) => [0, 2, 3, 5].includes(index) && value.trim() !== "" && value.trim() !== "0" && value.trim() !== "1");
            const checkExist = checknonEmptyValues.every(value => {
                return lists.some(list => list.name === value);
            });
            
            if (!checkExist) {
                window.alert(`De naam ${checknonEmptyValues.join(" + ")} komt niet overeen met de naam van het rijtje. Pas deze aan en probeer opnieuw!`);
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
            mixedKeywordsArray.push({
                line: nonEmptyValues.join(" + "),
                mixedKeywords: mixedKeywords,
                searchVolume: []
            });

            if (values[0] === "1" || document.getElementById('suggesties').checked == true) {
                var max_keywords = 20;
            } else {
                var max_keywords = 1000;
            }

            const numRequests = Math.ceil(mixedKeywords.length / max_keywords);
            for (let i = 0; i < numRequests; i++) {
                const startIndex = i * max_keywords;
                const endIndex = Math.min(startIndex + max_keywords, mixedKeywords.length);
                const keywordsSlice = mixedKeywords.slice(startIndex, endIndex);

                const selectedCountry = document.getElementById('location-option').value;
                const selectedLanguage = document.getElementById('language-option').value;

                const post_array = [{
                    "location_name": selectedCountry,
                    "language_name": selectedLanguage,
                    "keywords": keywordsSlice,
                }];

                if (values[0] === "1" || document.getElementById('suggesties').checked == true) {
                    api_methode = "keywords_for_keywords";
                } else {
                    api_methode = "search_volume";
                }
                apiMethodes.push(api_methode);
                const post_url = `https://api.dataforseo.com/v3/keywords_data/google_ads/${api_methode}/task_post`;
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
                lineNames.push(nonEmptyValues.join(" + "));
                taskIds.push(post_result.tasks[0].id);
            }
        }

        for (let i = 0; i < taskIds.length; i++) {
            const taskId = taskIds[i];
            const line_name = lineNames[i];
            const getApiMethode = apiMethodes[i];
            const results = await fetchData(taskId, login, password, getApiMethode);
            for (const result of results) {
                const keyword = result.keyword;
                if (result.search_volume !== null) {
                    var NewSearchVolume = result.search_volume;
                } else {
                    var NewSearchVolume = 0;
                }
                const existingObject = mixedKeywordsArray.find(obj => obj.line === line_name);
                if (existingObject) {
                    const matchingKeywordIndex = existingObject.mixedKeywords.findIndex((k) =>
                        k === keyword
                    );
                    if (matchingKeywordIndex !== -1) {
                        existingObject.searchVolume[matchingKeywordIndex] = NewSearchVolume;
                    } else {
                        existingObject.mixedKeywords.push(keyword);
                        existingObject.searchVolume.push(NewSearchVolume);
                    }
                }
                
            }
            statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p>Er zijn zoekvolumes voor <b>${line_name}</b> opgehaald.</p></div>`);
        }
        statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p><b>Alles</b> is klaar! Je vindt het Excel bestand in je downloads map!</p></div>`);
        generateExcel();
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
            await new Promise(resolve => setTimeout(resolve, 2000));
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

// Functie voor ophalen van waardes van de lijst op basis van de lijst naam
function getListValues(listName) {
    for (let i = 0; i < lists.length; i++) {
        if (lists[i].name === listName) {
            return lists[i].values.join('\n');
        }
    }
    return '';
}

// Language & location
async function fetchLocationLanguageData(login, password) {   
    const locationRequestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(login + ':' + password)
        }
    };
    const locationUrl = 'https://api.dataforseo.com/v3/keywords_data/google_ads/locations';
    const locationResponse = await fetch(locationUrl, locationRequestOptions);
    const locationData = await locationResponse.json();
    const locationEntries = locationData.tasks[0].result;

    const desiredCountries = ['Netherlands', 'Belgium'];
    const filteredLocationEntries = locationEntries.filter(location => {
        return desiredCountries.some(country => location.location_name.toLowerCase().includes(country.toLowerCase()));
      });

    const locationOptions = filteredLocationEntries.map(location => location.location_name);
    const locationSelect = document.getElementById('location-option');
    locationOptions.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.text = location;
        locationSelect.appendChild(option);
    });
  
    const languageRequestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(login + ':' + password)
        }
    };
    const languageUrl = 'https://api.dataforseo.com/v3/keywords_data/google_ads/languages';
    const languageResponse = await fetch(languageUrl, languageRequestOptions);
    const languageData = await languageResponse.json();
    const languageOptions = languageData.tasks[0].result.map(language => language.language_name);
  
    const languageSelect = document.getElementById('language-option');
    languageOptions.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.text = language;
        languageSelect.appendChild(option);
    });

    var locationOptionsForm = document.getElementById('location-option').getElementsByTagName('option');
    var originalLocationOptions = [...locationOptionsForm];

    var searchLocationInput = document.getElementById('search-location');
    searchLocationInput.addEventListener('input', function () {
        var filter = searchLocationInput.value.toLowerCase();

        locationOptionsForm = [...originalLocationOptions]; // Reset options

        var matchedLocationOptions = locationOptionsForm.filter(function (option) {
            return option.text.toLowerCase().indexOf(filter) > -1;
        });

        var locationSelect = document.getElementById('location-option');
        locationSelect.innerHTML = '';

        matchedLocationOptions.forEach(function (option) {
            locationSelect.appendChild(option);
        });
    });

    var languageOptionsForm = document.getElementById('language-option').getElementsByTagName('option');
    var originalLanguageOptions = [...languageOptionsForm];

    var searchLanguageInput = document.getElementById('search-language');
    searchLanguageInput.addEventListener('input', function () {
        var filter = searchLanguageInput.value.toLowerCase();

        languageOptionsForm = [...originalLanguageOptions];

        var matchedLanguageOptions = languageOptionsForm.filter(function (option) {
            return option.text.toLowerCase().indexOf(filter) > -1;
        });

        var languageSelect = document.getElementById('language-option');
        languageSelect.innerHTML = '';

        matchedLanguageOptions.forEach(function (option) {
            languageSelect.appendChild(option);
        });
    });
}