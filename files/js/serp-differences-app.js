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
var modal = document.getElementById("loginModal");
var button = document.querySelector("#inlog_knop");
var span = document.getElementsByClassName("btn-close")[0];
var loginButton = document.getElementById("loginButton");
var logoutButton = document.getElementById("logoutButton");
var rememberme = document.getElementById("rememberMe");
window.onload = inlogUpdate(login_storage, login, password, email_login, api_login);

function inlogUpdate(login_storage, login, password, email_login, api_login) {
    var ingelogd = document.getElementById("ingelogd");
    const login_email_veld = document.getElementById("inputEmail");
    const login_api_veld = document.getElementById("inputAPI");
    if (login_storage) {
        ingelogd.textContent = "Je bent op dit moment ingelogd met e-mail: " + login;
        login_email_veld.value = login;
        login_api_veld.value = password;
        rememberme.checked = true;
        fetchLocationLanguageData(login, password);
    } else if (email_login != "") {
        ingelogd.textContent = "Je bent op dit moment ingelogd met e-mail: " + email_login;
        login_email_veld.value = email_login;
        login_api_veld.value = api_login;
    } else {
        ingelogd.textContent = "Je bent op dit moment nog niet ingelogd!";
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
    rememberme.checked = false;
    localStorage.removeItem('userData');
    login_storage = '';
    inlogUpdate(login_storage, login, password, email_login, api_login);
};

// Ophalen van data
async function getData(login_storage, login, password, api_login) {
    const container = document.getElementById('serps');
    container.innerHTML = '<p>De tool is de SERPS aan het ophalen...</p>'

    const keyword1 = document.getElementById("zoekwoord-1").value;
    const keyword2 = document.getElementById("zoekwoord-2").value;

    mixedKeywordsArray = [];
    taskIds = [];

    keywords = [
        {
            "keyword": keyword1
        },
        {
            "keyword": keyword2
        }
    ]

    if (!api_login && login_storage === "") {
        window.alert('Je bent niet ingelogd! Log in en probeer het opnieuw!');
    } else {
        const confirmed = confirm("Weet je zeker dat je een API call gaat maken? Dit kost geld!");
  
        if (!confirmed) {
        return;
        }
    
        for (const keywordObj of keywords) {
            const selectedCountry = document.getElementById('location-option').value;
            const selectedLanguage = document.getElementById('language-option').value;

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
        renderResults(keyword1, keyword2, keywordResults[0], keywordResults[1]);
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

async function renderResults(keyword1, keyword2, results1, results2) {
    const container = document.getElementById('serps');

    const { similarityPercentage, commonResults } = calculateSimilarity(results1, results2);

    container.innerHTML = `
        <h2>SERP Resultaten</h2>
        <p>De SERP's komen voor <strong>${similarityPercentage.toFixed(2)}%</strong> met elkaar overeen.</p>
        <p>Overeenkomende URLs:</p>
        <ul>
            ${commonResults.map(result => `<li><a href="${result.url}">${result.url}</a></li>`).join('')}
        </ul>
        <div class="row">
            <div class="col-sm">
                <h2>SERP 1: ${keyword1}</h2>
                ${renderPositionResults(results1, commonResults)}
            </div>
            <div class="col-sm">
                <h2>SERP 2: ${keyword2}</h2>
                ${renderPositionResults(results2, commonResults)}
            </div>
        </div>
    `;
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
            <div class="result result-${index + 1}" data-url="${item.url}">
                <h3>Positie ${index + 1}</h3>
                <ul class="list-group ${highlightClass}">
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

function calculateSimilarity(results1, results2) {
    const allItems1 = results1.reduce((acc, result) => acc.concat(result.items), []);
    const allItems2 = results2.reduce((acc, result) => acc.concat(result.items), []);

    const filteredItems1 = allItems1.filter(item => item.type !== "paid");
    const filteredItems2 = allItems2.filter(item => item.type !== "paid");

    filteredItems1.sort((a, b) => a.rank_absolute - b.rank_absolute);
    filteredItems2.sort((a, b) => a.rank_absolute - b.rank_absolute);

    const top10Items1 = filteredItems1.slice(0, 10);
    const top10Items2 = filteredItems2.slice(0, 10);

    const commonResults = top10Items1.filter(item1 =>
        top10Items2.some(item2 =>
            item1.url === item2.url
        )
    );

    const similarityPercentage = (commonResults.length / 10) * 100;

    return { similarityPercentage, commonResults };
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
    const defaultLocation = 'Netherlands';
    const defaultLanguage = 'Dutch';
    locationSelect.value = defaultLocation;
    languageSelect.value = defaultLanguage;
}