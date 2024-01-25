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

// JavaScript Code
let taskIds = [];
let keywords = [];

// Ophalen van localstorage
function getLocalStorage(name) {
    const localStorageValue = localStorage.getItem(name);
    return localStorageValue ? localStorageValue : '';
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
        localStorage.setItem("checkbox-CDH", "checked");
    } else {
        localStorage.removeItem("checkbox-CDH");
    }
});

let checkbox_checked = localStorage.getItem("checkbox-CDH");
if (checkbox_checked === "checked") {
    checkbox.checked = true;
}

// Enter
const keywordinput = document.getElementById("zoekwoord-1");
keywordinput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        getData(login_storage, login, password, api_login);
    }
});

const button = document.getElementById("start-button");
button.addEventListener("click", function() {
    getData(login_storage, login, password, api_login)
});

// Ophalen van data
async function getData(login_storage, login, password, api_login) {
    const divs = ['overzicht', 'samenvatting', 'screenshots'];
    divs.forEach(id => {
        document.getElementById(id).innerHTML = '';
    });
    
    const keyword = document.getElementById("zoekwoord-1").value;
    if (keyword === '') {
        const error_modal = new bootstrap.Modal(document.getElementById("error-modal"));
        error_modal.show();
        document.getElementById("error-message").innerHTML = `<p class="body-text">Je moet een zoekwoord invullen om de tool te gebruiken!</p>`;
        const modalClosedPromise = new Promise((resolve) => {
            error_modal._element.addEventListener("hidden.bs.modal", function () {
                resolve();
            }, { once: true });
        });
        await modalClosedPromise;
        return
    }   

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
        document.getElementById("save-button").style = "width: auto; display:none;";
        const container_serps = document.getElementById('serps');
        container_serps.innerHTML = '<p>De tool gaat bezig met het verzamelen van data...</p>';
        for (const keywordObj of keywords) {
            const selectedCountry = document.getElementById('search-location').value;
            const selectedLanguage = document.getElementById('search-language').value;

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

        await getSummary(taskIds[0], login, password);
        
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
        if (checkbox.checked) {
            saveData();
        } else {
            document.getElementById("save-button").style = "width: auto;";
        }
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
            <div class="col-sm" id="col-serp" style="overflow-x: auto">
                <h2>SERP Desktop</h2>
                ${renderPositionResults(results1)}
            </div>
            <div class="col-sm" id="col-serp" style="overflow-x: auto">
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
                <p><strong>Positie ${index + 1}</strong></p>
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

async function getSummary(taskId, login, password) {
    const container = document.getElementById('samenvatting');
    container.innerHTML = '<p>De AI gaat bezig met samenvatten...</p>';

    const post_array = [{
        "task_id": taskId,
        "prompt": "Geef een uitgebreide samenvatting van de SERP. Geef daarnaast antwoord op de volgende vragen: Voor welk segment is deze SERP? Wat is de behoefte van de gebruiker? Welke vragen worden er beantwoord in de SERP? Wat moet er gedaan worden om in deze SERP goed te ranken? Beschrijf daarnaast van de top 5 resultaten voor elk resultaat wat deze pagina uniek maakt.",
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
    const paragraphs = summary.split('\n');
    const pElements = paragraphs.map((paragraphText) => {
        const p = document.createElement('p');
        p.textContent = paragraphText;
        container.appendChild(p);
        return p;
    });
    const summaryContainer = document.createElement('div');
    const summaryh2 = document.createElement('h2');
    summaryh2.textContent = 'SERP Samenvatting';
    pElements.forEach((p) => {
        summaryContainer.appendChild(p);
    });
    container.innerHTML = '';
    container.appendChild(summaryh2);
    container.appendChild(summaryContainer);
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
async function saveData() {
    const dataHTML = document.getElementById("data").innerHTML;
    const titel = document.getElementById("zoekwoord").innerText;

    const newData = { html: dataHTML, titel: titel, timestamp: new Date().toLocaleString(), userId: user.uid };

    try {
        const docRef = await addDoc(collection(db, "historicDataCDH"), newData);

        await updateDoc(doc(db, "historicDataCDH", docRef.id), {
            id: docRef.id
        });
        
        const successToast = document.getElementById("success-toast");
        const bootstrapToast = new bootstrap.Toast(successToast);
        bootstrapToast.show();
        document.getElementById("save-button").style = "width: auto; display:none;";
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

document.getElementById("save-button").addEventListener("click", saveData);