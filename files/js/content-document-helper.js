// JavaScript Code

let mixedKeywordsArray = [];
let taskIds = [];
let keywords = [];
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

// Ophalen van localstorage
function getLocalStorage(name) {
    const localStorageValue = localStorage.getItem(name);
    return localStorageValue ? localStorageValue : '';
}

// login form
const modal = document.getElementById("loginModal");
const button = document.querySelector("#inlog_knop");
const span = document.getElementsByClassName("btn-close")[0];
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const rememberme = document.getElementById("rememberMe");
window.onload = inlogUpdate(login_storage, login, password, email_login, api_login);

function inlogUpdate(login_storage, login, password, email_login, api_login) {
    const ingelogd = document.getElementById("ingelogd");
    const ingelogd_text = document.getElementById("ingelogd_text");
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
        fetchLocationLanguageData(login, password);
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
        const userData = {
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
    rememberme.checked = false;
    localStorage.removeItem('userData');
    login_storage = '';
    inlogUpdate(login_storage, login, password, email_login, api_login);
};

// Ophalen van data
async function getData(login_storage, login, password, api_login) {
    const container = document.getElementById('serps');
    container.innerHTML = '<p>De tool is de SERPS aan het ophalen...</p>'

    const keyword = document.getElementById("zoekwoord-1").value;

    mixedKeywordsArray = [];
    taskIds = [];

    keywords = [
        {
            "keyword": keyword,
            "device": "desktop"
        },
        {
            "keyword": keyword,
            "device": "mobile"
        }
    ];

    if (!api_login && login_storage === "") {
        window.alert('Je bent niet ingelogd! Log in en probeer het opnieuw!');
    } else {
        for (const keywordObj of keywords) {
            const selectedCountry = document.getElementById('location-option').value;
            const selectedLanguage = document.getElementById('language-option').value;

            const post_array = [{
                "location_name": selectedCountry,
                "language_name": selectedLanguage,
                "keyword": keywordObj.keyword,
                "device": keywordObj.device,
                "depth": 10,
            }];

            const post_url = `https://api.dataforseo.com/v3/serp/google/organic/task_post`;
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
            taskIds.push(post_result.tasks[0].id);
        }
        const fetchPromises = taskIds.map(taskId => fetchData(taskId, login, password));
        const allResults = await Promise.all(fetchPromises);
        const keywordResults = allResults.map(taskResults => taskResults[0].result);
        
        renderResults(keywords[0].keyword, keywordResults[0], keywordResults[1]);

        getSummary(taskIds[0], login, password);
        
        const container = document.getElementById('screenshots');
        (async () => {
            const desktopImage = await getScreenshot(taskIds[0], login, password);
            const mobileImage = await getScreenshot(taskIds[1], login, password);
        
            container.innerHTML = `
                <h2>SERP Resultaten</h2>
                <h3>Screenshot Desktop</h3>
                <img src="${desktopImage}" class="img-fluid"></img>
                <h3>Screenshot Mobiel</h3>
                <img src="${mobileImage}" class="img-fluid" style="width: 30%"></img>
            `;
        })();
    }
}

async function fetchData(taskId, login, password) {
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
        const get_url = `https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/${taskId}`;
        const get_response = await fetch(get_url, requestGetOptions);
        const get_result = await get_response.json();
        console.log(get_result.tasks);
        status = get_result.tasks[0].status_message;
        if (status === 'Ok.') {
            fetchResults.push(get_result.tasks[0]);
        } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    return fetchResults;
}

async function renderResults(keyword, results1, results2) {
    const container = document.getElementById('serps');

    container.innerHTML = `
        <h2>SERP Resultaten</h2>
        <div class="row">
            <div class="col-sm" style="overflow-x: auto">
                <h2>SERP Desktop</h2>
                ${renderPositionResults(results1)}
            </div>
            <div class="col-sm" style="overflow-x: auto">
                <h2>SERP Mobiel</h2>
                ${renderPositionResults(results2)}
            </div>
        </div>
    `;
    document.getElementById('overzicht').innerHTML = `
        <h2 id="zoekwoord">Overzicht: ${keyword}</h2>
    `
}

function renderPositionResults(results) {
    const allItems = results.reduce((acc, result) => acc.concat(result.items), []);

    const filteredItems = allItems.filter(item => item.type !== "paid");
    filteredItems.sort((a, b) => a.rank_absolute - b.rank_absolute);

    const top10Items = allItems.slice(0, 10);

    return top10Items.map((item, index) => {
        return `
            <div class="result-content result-${index + 1}">
                <h3>Positie ${index + 1}</h3>
                <ul class="list-group" data-url="${item.url}">
                    <li class="list-group-item">
                        <strong>${item.title}</strong>
                        <br>
                        <p>${item.description}</p>
                        <a href="${item.url}" target="_blank">${item.url}</a>
                    </li>
                </ul>
            </div>
        `;
    }).join('');
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

    const locationOptionsForm = document.getElementById('location-option').getElementsByTagName('option');
    const originalLocationOptions = [...locationOptionsForm];

    const searchLocationInput = document.getElementById('search-location');
    searchLocationInput.addEventListener('input', function () {
        const filter = searchLocationInput.value.toLowerCase();

        locationOptionsForm = [...originalLocationOptions]; // Reset options

        const matchedLocationOptions = locationOptionsForm.filter(function (option) {
            return option.text.toLowerCase().indexOf(filter) > -1;
        });

        const locationSelect = document.getElementById('location-option');
        locationSelect.innerHTML = '';

        matchedLocationOptions.forEach(function (option) {
            locationSelect.appendChild(option);
        });
    });

    const languageOptionsForm = document.getElementById('language-option').getElementsByTagName('option');
    const originalLanguageOptions = [...languageOptionsForm];

    const searchLanguageInput = document.getElementById('search-language');
    searchLanguageInput.addEventListener('input', function () {
        const filter = searchLanguageInput.value.toLowerCase();

        languageOptionsForm = [...originalLanguageOptions];

        const matchedLanguageOptions = languageOptionsForm.filter(function (option) {
            return option.text.toLowerCase().indexOf(filter) > -1;
        });

        const languageSelect = document.getElementById('language-option');
        languageSelect.innerHTML = '';

        matchedLanguageOptions.forEach(function (option) {
            languageSelect.appendChild(option);
        });
    });
    const defaultLocation = 'Netherlands';
    const defaultLanguage = 'Dutch';
    locationSelect.value = defaultLocation;
    languageSelect.value = defaultLanguage;
}

async function getSummary(taskId, login, password) {
    const container = document.getElementById('samenvatting');
    container.innerHTML = '<p>De AI gaat bezig met samenvatten...</p>'

    const post_array = [{
        "task_id": taskId,
        "prompt": "Geef een uitgebreide samenvatting van de SERP. Geef daarnaast antwoord op de volgende vragen: Voor welk segment is deze SERP? Wat is de behoefte van de gebruiker? Wat doen de resultaten aan expertise op hun pagina? Welke vragen worden er beantwoord in de SERP? Beschrijf van de top 5 resultaat voor elk resultaat wat deze pagina uniek maakt.",
        "include_links": true,
        "fetch_content": true,
        "suport_extra": true
    }];

    const post_url = `https://api.dataforseo.com/v3/serp/ai_summary`;
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
    console.log(post_result);
    const summary = post_result.tasks[0].result[0].items[0].summary;
    container.innerHTML = `
        <h2>SERP Samenvatting</h2>
        <p>${summary}</p>
    `;
}

async function getScreenshot(taskId, login, password) {
    const post_array = [{
        "task_id": taskId
    }];

    const post_url = `https://api.dataforseo.com/v3/serp/screenshot`;
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
    const image = post_result.tasks[0].result[0].items[0].image;
    return image
}

//Database
const dbName = "historicDataCDH";
const dbVersion = 1;

const openDBRequest = indexedDB.open(dbName, dbVersion);

openDBRequest.onupgradeneeded = function (event) {
    const db = event.target.result;
    
    if (!db.objectStoreNames.contains("historicData")) {
        db.createObjectStore("historicData", { keyPath: "id", autoIncrement: true });
    }
};

openDBRequest.onsuccess = function (event) {
    const db = event.target.result;

    document.getElementById("save-button").addEventListener("click", () => {
        const dataHTML = document.getElementById("data").innerHTML;
        
        const transaction = db.transaction(["historicData"], "readwrite");
        const store = transaction.objectStore("historicData");
        const titel = document.getElementById("zoekwoord").innerText;
        
        const newData = { html: dataHTML, titel: titel, timestamp: new Date().toLocaleString() };
        
        store.add(newData);
        
        transaction.oncomplete = () => {
            loadStoredData();
        };
    });
};

// Function to load and display stored data automatically
function loadStoredData() {
    const transaction = openDBRequest.result.transaction(["historicData"], "readonly");
    const store = transaction.objectStore("historicData");

    const getDataRequest = store.getAll();

    getDataRequest.onsuccess = () => {
        const historicData = getDataRequest.result;
        const dataList = document.getElementById("data-list");

        if (getDataRequest.readyState === "done" && historicData.length > 0) {
            dataList.innerHTML = "";

            historicData.reverse();
            historicData.forEach(entry => {
                const listItem = document.createElement("div");
                listItem.innerHTML = `<button type="button" class="btn btn-primary view-button" style="width: auto" data-id="${entry.id}">Bekijk</button> 
                                     <button type="button" class="btn btn-primary delete-button secondbutton" style="width: auto" data-id="${entry.id}">Verwijder</button>
                                     <span>${entry.titel} (${entry.timestamp})</span>`;
                dataList.appendChild(listItem);
            });

            const viewButtons = document.querySelectorAll(".view-button");
            const deleteButtons = document.querySelectorAll(".delete-button");

            viewButtons.forEach(button => {
                button.addEventListener("click", (event) => {
                    const id = Number(event.target.getAttribute("data-id"));
                    viewData(id);
                });
            });

            deleteButtons.forEach(button => {
                button.addEventListener("click", (event) => {
                    const id = Number(event.target.getAttribute("data-id"));
                    deleteData(id);
                });
            });

            console.log("Data loaded from IndexedDB.");
        } else if (getDataRequest.readyState === "done" && historicData.length === 0) {
            dataList.innerHTML = "<p>Op dit moment heb je nog geen data opgeslagen.</p>";
        }
    };
}
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(loadStoredData, 1500);
});

openDBRequest.onerror = function (event) {
    window.alert("Er is een fout in de database, neem contact op met de developer:", event.target.error);
};

function viewData(id) {
    const transaction = openDBRequest.result.transaction(["historicData"], "readonly");
    const store = transaction.objectStore("historicData");
    
    const getDataRequest = store.get(id);
    
    getDataRequest.onsuccess = function () {
        const data = getDataRequest.result;
        if (data) {
            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            const viewDataContent = document.getElementById("view-data-content");
            
            viewDataContent.innerHTML = data.html;

            viewModal.show();
        }
    };
}

function deleteData(id) {
    const transaction = openDBRequest.result.transaction(["historicData"], "readwrite");
    const store = transaction.objectStore("historicData");
    
    const deleteRequest = store.delete(id);
    
    deleteRequest.onsuccess = function () {
        loadStoredData();
    };
}