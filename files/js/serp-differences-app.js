// JavaScript Code

let mixedKeywordsArray = [];
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
} else {
    login = email_login;
    password = api_login;
}

const modal = document.getElementById("loginModal");
const loginLink = document.getElementById("loginLink");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const welcomeText = document.getElementById("welcomeText");
const rememberme = document.getElementById("rememberMe");
const logoutButtonContainer = document.getElementById("logoutButtonContainer");

function updateNavbar() {
  if (login) {
    loginLink.style.display = "none";
    welcomeText.textContent = "Welkom, " + login;
    logoutButtonContainer.style.display = "block";
    fetchLocationLanguageData(login, password);
  } else {
    loginLink.style.display = "block";
    welcomeText.textContent = '';
    logoutButtonContainer.style.display = "none";
  }
}

loginLink.onclick = function() {
  modal.style.display = "block";
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
    updateNavbar();
    fetchLocationLanguageData(login, password);
};

logoutButton.onclick = function() {
  localStorage.removeItem('userData');
  login = '';
  password = '';
  updateNavbar();
};

window.onload = updateNavbar();

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
keyword2input.addEventListener("input", function() {
    if (keyword2input.value != '') {
        document.getElementById("zoekwoord-3").removeAttribute("disabled");
    } else {
        document.getElementById("zoekwoord-3").setAttribute("disabled", "disabled");
    }
});

// Ophalen van data
async function getData(login_storage, login, password, api_login) {
    const keyword1 = document.getElementById("zoekwoord-1").value;
    const keyword2 = document.getElementById("zoekwoord-2").value;
    const keyword3 = document.getElementById("zoekwoord-3").value;
    
    if (keyword1 === '' || keyword2 === '') {
        const error_modal = new bootstrap.Modal(document.getElementById("error-modal"));
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

    mixedKeywordsArray = [];
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
        window.alert('Je bent niet ingelogd! Log in en probeer het opnieuw!');
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
        `;
    } else {
        container.innerHTML = `
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
        `;
    }
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

// Language & location
async function fetchLocationLanguageData() {

    const locationResponse = await fetch ('/files/locations.json');
    const locationData = await locationResponse.json();
  
    const desiredCountries = ['Netherlands', 'Belgium'];
    const filteredLocationEntries = locationData.filter(location => {
        return desiredCountries.some(country => location.location_name.toLowerCase().includes(country.toLowerCase()));
    });
  
    const locationOptions = filteredLocationEntries.map(location => location.location_name);
    const locationDropdown = document.getElementById('location-dropdown');
    createCustomDropdown(locationDropdown, 'location-options', 'search-location', locationOptions);
  
    const languageResponse = await fetch("/files/languages.json");
    const languageData = await languageResponse.json();
    const languageOptions = languageData.map(language => language.language_name);

    const languageDropdown = document.getElementById('language-dropdown');
    createCustomDropdown(languageDropdown, 'language-options', 'search-language', languageOptions);
  
    const defaultLocation = 'Netherlands';
    const defaultLanguage = 'Dutch';
  
    document.querySelector('#location-dropdown input').value = defaultLocation;
    document.querySelector('#language-dropdown input').value = defaultLanguage;
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
const dbName = "historicDataSDC";
const dbVersion = 1;
let db;

const openDBRequest = indexedDB.open(dbName, dbVersion);

openDBRequest.onupgradeneeded = function (event) {
    const db = event.target.result;
    
    if (!db.objectStoreNames.contains("historicData")) {
        db.createObjectStore("historicData", { keyPath: "id", autoIncrement: true });
    }
};

openDBRequest.onsuccess = function (event) {
    db = event.target.result;
};

openDBRequest.onerror = function (event) {
    window.alert("Er is een fout in de database, neem contact op met de developer:", event.target.error);
};

async function saveData() {
    const dataHTML = document.getElementById("serps").innerHTML;
    
    const transaction = db.transaction(["historicData"], "readwrite");
    const store = transaction.objectStore("historicData");
    const titles = [];
    for (let i = 1; i <= 3; i++) {
        const element = document.getElementById(`zoekwoord-${i}`);
        if (element.value != '') {
            titles.push(element.value);
        }
    }
    const titel = titles.join(' , ');
    
    const newData = { html: dataHTML, titel: titel, timestamp: new Date().toLocaleString() };
    
    store.add(newData);
    
    transaction.oncomplete = () => {
        const successToast = document.getElementById("success-toast");
        const bootstrapToast = new bootstrap.Toast(successToast);
        bootstrapToast.show();
    };
    document.getElementById("save-button").style = "width: auto; display:none;";
};

document.getElementById("save-button").addEventListener("click", saveData);

{}