// JavaScript Code

let mixedKeywordsArray = [];
let taskIds = [];
let keywords = [];

// Ophalen van localstorage
function getLocalStorage(name) {
    const localStorageValue = localStorage.getItem(name);
    return localStorageValue ? localStorageValue : '';
}

// login form
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

// Ophalen van data
async function getData(login_storage, login, password, api_login) {
    const divs = ['overzicht', 'samenvatting', 'screenshots'];
    divs.forEach(id => {
        document.getElementById(id).innerHTML = '';
    });
    document.getElementById("save-button").style = "width: auto; display:none;";
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
        document.getElementById("save-button").style = "width: auto;";
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
    const locationDropdown = document.getElementById('location-dropdown');
    createCustomDropdown(locationDropdown, 'location-options', 'search-location', locationOptions);
  
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
            showNotification('De data is opgeslagen, je kunt deze nu bekijken!', 5000);
        };
        document.getElementById("save-button").style = "width: auto; display:none;";
    });
};

openDBRequest.onerror = function (event) {
    window.alert("Er is een fout in de database, neem contact op met de developer:", event.target.error);
};