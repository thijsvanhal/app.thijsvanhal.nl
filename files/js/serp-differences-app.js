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
const dataforseo_email = document.getElementById("dataforseo-api-login");
const dataforseo_password = document.getElementById("dataforseo-api-wachtwoord");
const openai_key = document.getElementById("openai-api-key");

let login;
let password;
let key;
let parsed_login_storage;
let login_storage = getLocalStorage("userData");
let email_login = dataforseo_email.value;
let api_login = dataforseo_password.value;
let api_key = openai_key.value;
if (login_storage) {
    parsed_login_storage = JSON.parse(login_storage);
    login = parsed_login_storage.email;
    password = parsed_login_storage.password;
    key = parsed_login_storage.key;
    fetchLanguageData();
    fetchLocationData();
} else {
    login = email_login;
    password = api_login;
    key = api_key;
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
        dataforseo_email.value = login;
        dataforseo_password.value = password;
        openai_key.value = key;
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
        const userData = {
            email: dataforseo_email.value,
            password: dataforseo_password.value,
            key: openai_key.value
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        login_storage = getLocalStorage("userData");
        parsed_login_storage = JSON.parse(login_storage);
        login = parsed_login_storage.email;
        password = parsed_login_storage.password;
        key = parsed_login_storage.key;
    } else {
        localStorage.removeItem('userData');
        login = dataforseo_email.value;
        password = dataforseo_password.value;
        key = openai_key.value;
    }
    modal.hide();
};

deleteButton.onclick = function() {
    localStorage.removeItem('userData');
    login = '';
    password = '';
    key = '';
    rememberme.checked = false;
    dataforseo_email.value = '';
    dataforseo_password.value = '';
    openai_key.value = '';
    modal.hide();
};

let checkbox = document.getElementById("standaard-data-switch");
checkbox.addEventListener("click", function() {
    if (checkbox.checked) {
        localStorage.setItem("checkbox-SDC", "checked");
    } else {
        localStorage.removeItem("checkbox-SDC");
    }
});

let checkbox_checked = localStorage.getItem("checkbox-SDC");
if (checkbox_checked === "checked") {
    checkbox.checked = true;
}

const keyword2input = document.getElementById("zoekwoord-2");
const keyword3input = document.getElementById("zoekwoord-3");
keyword2input.addEventListener("input", function() {
    if (keyword2input.value != '') {
        keyword3input.removeAttribute("disabled");
    } else {
        keyword3input.setAttribute("disabled", "disabled");
    }
});

// Enter
keyword2input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        getData(login_storage, login, password, api_login);
    }
});

keyword3input.addEventListener("keyup", function(event) {
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
    const keyword1 = document.getElementById("zoekwoord-1").value;
    const keyword2 = document.getElementById("zoekwoord-2").value;
    const keyword3 = document.getElementById("zoekwoord-3").value;
    
    if (keyword1 === '' || keyword2 === '') {
        error_modal.show();
        document.getElementById("error-message").innerHTML = `<p class="body-text">Je moet minimaal 2 zoekwoorden invullen om de tool te gebruiken!</p>`;
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
            "keyword": keyword1
        },
        {
            "keyword": keyword2
        }
    ];

    if (keyword3) {
        keywords.push({
            "keyword": keyword3
        });
    }

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
        const container = document.getElementById('serps');
        container.innerHTML = '<p>De tool is de SERPS aan het ophalen...</p>';
    
        for (const keywordObj of keywords) {
            const selectedCountry = document.getElementById('search-location').value;
            const selectedLanguage = document.getElementById('search-language').value;

            const post_array = [{
                "location_name": selectedCountry,
                "language_name": selectedLanguage,
                "keyword": keywordObj.keyword,
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
        if (keyword3) {
            renderResults(keywords[0].keyword, keywords[1].keyword, keywords[2].keyword, keywordResults[0], keywordResults[1], keywordResults[2]);
        } else {
            renderResults(keywords[0].keyword, keywords[1].keyword, null, keywordResults[0], keywordResults[1], null);
        }

        if (key !== '') {
            await getSummary();
        } else {
            const samenvatting_container = document.getElementById('samenvatting');
            samenvatting_container.innerHTML = `
            <h2>Advies van AI</h2>
            <p>Je hebt geen OpenAI Key ingevuld, daarom kan AI geen samenvatting en advies maken.</p>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal" style="width:auto">Invullen</button>
            `;
            samenvatting_container.setAttribute('id', 'witte-container');
        }

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

async function renderResults(keyword1, keyword2, keyword3 = null, results1, results2, results3 = null) {
    const container = document.getElementById('serps');

    const { similarityPercentage: similarityPercentage1, commonResults: commonResults1 } = calculateSimilarity(results1, results2);

    if (keyword3 != null) {
        const { similarityPercentage: similarityPercentage, commonResults: commonResults } = calculateSimilarity(results1, results2, results3);
        const { similarityPercentage: similarityPercentage2, commonResults: commonResults2 } = calculateSimilarity(results1, results3);
        const { similarityPercentage: similarityPercentage3, commonResults: commonResults3 } = calculateSimilarity(results2, results3);
        container.innerHTML = `
            <div id="serps">
                <h2>SERP Resultaten</h2>
                <p>De 3 SERP's komen voor <strong>${similarityPercentage.toFixed(2)}%</strong> met elkaar overeen.</p>
                <ul>
                    <li>SERP ${keyword1} en ${keyword2} komen voor <strong>${similarityPercentage1.toFixed(2)}%</strong> met elkaar overeen.</li>
                    <li>SERP ${keyword1} en ${keyword3} komen voor <strong>${similarityPercentage2.toFixed(2)}%</strong> met elkaar overeen.</li>
                    <li>SERP ${keyword2} en ${keyword3} komen voor <strong>${similarityPercentage3.toFixed(2)}%</strong> met elkaar overeen.</li>
                </ul>
                <h3>Overeenkomende URLs:</h3>
                <ul>
                    ${commonResults.map(result => `<li><a href="${result.url}" target="_blank">${result.url}</a></li>`).join('')}
                </ul>
                <div class="row">
                    <div class="col-sm" style="overflow-x: auto">
                        <h3>SERP ${keyword1} en ${keyword2}</h3>
                        <ul>
                            ${commonResults1.map(result => `<li><a href="${result.url}" target="_blank">${result.url}</a></li>`).join('')}
                        </ul>
                    </div>
                    <div class="col-sm" style="overflow-x: auto">
                        <h3>SERP ${keyword1} en ${keyword3}</h3>
                        <ul>
                            ${commonResults2.map(result => `<li><a href="${result.url}" target="_blank">${result.url}</a></li>`).join('')}
                        </ul>
                    </div>
                    <div class="col-sm" style="overflow-x: auto">
                        <h3>SERP ${keyword2} en ${keyword3}</h3>
                        <ul>
                            ${commonResults3.map(result => `<li><a href="${result.url}" target="_blank">${result.url}</a></li>`).join('')}
                        </ul>
                    </div>
                </div>
                <p>Klik op een overeenkomend resultaat en ontdek de positie van die pagina bij de vergelijkende SERPs!</p>
                <div class="row">
                    <div class="col-sm" id="col-serp" style="overflow-x: auto">
                        <h2>SERP 1: ${keyword1}</h2>
                        ${renderPositionResults(results1, commonResults1)}
                    </div>
                    <div class="col-sm" id="col-serp" style="overflow-x: auto">
                        <h2>SERP 2: ${keyword2}</h2>
                        ${renderPositionResults(results2, commonResults2)}
                    </div>
                    <div class="col-sm" id="col-serp" style="overflow-x: auto">
                        <h2>SERP 3: ${keyword3}</h2>
                        ${renderPositionResults(results3, commonResults3)}
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div id="serps">
                <h2>SERP Resultaten</h2>
                <p>De SERP's komen voor <strong>${similarityPercentage1.toFixed(2)}%</strong> met elkaar overeen.</p>
                <h3>Overeenkomende URLs:</h3>
                <ul>
                    ${commonResults1.map(result => `<li><a href="${result.url}">${result.url}</a></li>`).join('')}
                </ul>
                <p>Klik op een overeenkomend resultaat en ontdek de positie van die pagina bij de vergelijkende SERPs!</p>
                <div class="row">
                    <div class="col-sm" id="col-serp" style="overflow-x: auto">
                        <h2>SERP 1: ${keyword1}</h2>
                        ${renderPositionResults(results1, commonResults1)}
                    </div>
                    <div class="col-sm" id="col-serp" style="overflow-x: auto">
                        <h2>SERP 2: ${keyword2}</h2>
                        ${renderPositionResults(results2, commonResults1)}
                    </div>
                </div>
            </div>
        `;
    }
    container.setAttribute('id', 'witte-container');
    const commonResultElements = container.querySelectorAll('.common-result');
    commonResultElements.forEach(result => {
        result.addEventListener('click', handleResultClick);
    });

    container.addEventListener('click', () => {
        const commonResultElements = container.querySelectorAll('.list-group');
        commonResultElements.forEach(result => {
            result.classList.remove('inactive');
        });
    });
}

function renderPositionResults(results, commonResults) {
    const allItems = results.reduce((acc, result) => acc.concat(result.items), []);

    const filteredItems = allItems.filter(item => item.type !== "paid");
    filteredItems.sort((a, b) => a.rank_absolute - b.rank_absolute);

    const top10Items = allItems.slice(0, 10);

    return top10Items.map((item, index) => {
        const isCommon = commonResults.some(commonResult => commonResult.url === item.url);
        const highlightClass = isCommon ? 'common-result' : '';

        return `
            <div class="result result-${index + 1}">
                <p><strong>Positie ${index + 1}</strong></p>
                <ul class="list-group ${highlightClass}" data-url="${item.url}">
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

function calculateSimilarity(results1, results2, results3) {
    const allItems1 = results1.reduce((acc, result) => acc.concat(result.items), []);
    const allItems2 = results2.reduce((acc, result) => acc.concat(result.items), []);
    
    const filteredItems1 = allItems1.filter(item => item.type !== "paid");
    const filteredItems2 = allItems2.filter(item => item.type !== "paid");

    filteredItems1.sort((a, b) => a.rank_absolute - b.rank_absolute);
    filteredItems2.sort((a, b) => a.rank_absolute - b.rank_absolute);

    const top10Items1 = filteredItems1.slice(0, 10);
    const top10Items2 = filteredItems2.slice(0, 10);

    if (results3 != null) {
        const allItems3 = results3.reduce((acc, result) => acc.concat(result.items), []);
        const filteredItems3 = allItems3.filter(item => item.type !== "paid");
        filteredItems3.sort((a, b) => a.rank_absolute - b.rank_absolute);
        const top10Items3 = filteredItems3.slice(0, 10);

        const commonResults12 = top10Items1.filter(item1 =>
            top10Items2.some(item2 =>
                item1.url === item2.url
            )
        );
    
        var commonResults = commonResults12.filter(item1 =>
            top10Items3.some(item3 =>
                item1.url === item3.url
            )
        );
    } else {
        var commonResults = top10Items1.filter(item1 =>
            top10Items2.some(item2 =>
                item1.url === item2.url
            )
        );
    }

    const similarityPercentage = (commonResults.length / 10) * 100;

    return { similarityPercentage, commonResults };
}

// AI
async function getSummary() {
    const container = document.getElementById('samenvatting');
    container.innerHTML = '<p>De AI gaat bezig met samenvatten...</p>';

    const input_data = document.getElementById('serps').innerHTML;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-1106",
            messages: [
                {
                    role: "system",
                    content: `
                    Ik geef je html van een tool die ik gebruik voor het vergelijken van verschillende serps van zoekwoorden in Google. Het doel van het gebruiken van deze tool is om erachter te komen of ik verschillende pagina's moet maken voor elk losse zoekwoord of dat ik met 1 pagina op de zoekwoorden kan ranken. 
                    Ik wil dat je de gegevens in de html analyseert en mij vervolgens antwoord geeft op onderstaande vragen:
                    - Wat zou jij adviseren om te doen? Per zoekwoord een pagina of 1 pagina?
                    - Wat is het verschil tussen de top 3 zoektermen per positie? Analyseer het verschil tussen de pagina's per zoekterm.

                    Dit is de html uit de tool:
                    ${input_data}
                    `,
                },
            ],
        }),
    });
    const data = await response.json();
    const summary = data.choices[0].message.content;
    console.log(summary);
    const paragraphs = summary.split('\n');
    const pElements = paragraphs.map((paragraphText) => {
        const p = document.createElement('p');
        p.textContent = paragraphText;
        container.appendChild(p);
        return p;
    });
    const summaryContainer = document.createElement('div');
    const summaryh2 = document.createElement('h2');
    summaryh2.textContent = 'AI Advies';
    pElements.forEach((p) => {
        summaryContainer.appendChild(p);
    });
    container.innerHTML = '';
    container.setAttribute('id', 'witte-container');
    container.appendChild(summaryh2);
    container.appendChild(summaryContainer);
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

// Function to handle the click event on common results
function handleResultClick(event) {
    event.stopPropagation();
    const clickedResult = event.currentTarget;
    const url = clickedResult.getAttribute('data-url');

    const allResults = document.querySelectorAll('.list-group');
    allResults.forEach(result => {
        if (result !== clickedResult) {
            result.classList.add('inactive');
        }
    });

    const ResultSERP2 = document.querySelectorAll(`.common-result[data-url="${url}"]`)[1];
    const ResultSERP3 = document.querySelectorAll(`.common-result[data-url="${url}"]`)[2];
    clickedResult.classList.remove('inactive');
    ResultSERP2.classList.remove('inactive');
    if (ResultSERP3) {
        ResultSERP3.classList.remove('inactive');
    }
}

//Database
async function saveData() {
    const dataHTML = document.getElementById("data").innerHTML;

    const titles = [];
    for (let i = 1; i <= 3; i++) {
        const element = document.getElementById(`zoekwoord-${i}`);
        if (element.value != '') {
            titles.push(element.value);
        }
    }
    const titel = titles.join(' , ');

    const newData = { html: dataHTML, titel: titel, timestamp: new Date().toLocaleString(), userId: user.uid };

    try {
        const docRef = await addDoc(collection(db, "historicDataSDC"), newData);

        await updateDoc(doc(db, "historicDataSDC", docRef.id), {
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