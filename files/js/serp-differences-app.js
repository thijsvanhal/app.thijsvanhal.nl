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

// Mixen van bulk lijsten
async function getData(login_storage, login, password, api_login) {
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
            console.log(keywordObj.keyword);
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

        for (let i = 0; i < taskIds.length; i++) {
            const [serp1, serp2] = await Promise.all([
                fetchData(taskIds[0], login, password),
                fetchData(taskIds[1], login, password)
            ]);
        
            // Calculate and log Jaccard similarity
            const similarityPercentage = calculateJaccardSimilarity(serp1, serp2);
            console.log(`Similarity: ${similarityPercentage.toFixed(2)}%`);
        
            // Render the results for SERP 1 and SERP 2
            renderResultsForTask(serp1, 1);
            renderResultsForTask(serp2, 2);
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
            fetchResults = get_result.tasks[0].result;
        } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    return fetchResults;
}

function renderResultsForTask(results, taskNumber) {
    const container = document.createElement("div");
    container.className = "mt-4";

    const heading = document.createElement("h2");
    heading.innerText = `SERP Results - Task ${taskNumber}`;
    container.appendChild(heading);

    const resultList = document.createElement("ul");
    resultList.className = "list-group";

    results.forEach((result, index) => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";
        listItem.innerHTML = `<strong>${index + 1}.</strong> <a href="${result.url}" target="_blank">${result.title}</a> (${result.type})`;
        resultList.appendChild(listItem);
    });

    container.appendChild(resultList);

    const serpContainer = document.getElementById("serp-results");
    serpContainer.appendChild(container);
}

const calculateJaccardSimilarity = (serp1, serp2) => {
    const intersection = serp1.filter(result1 =>
        serp2.some(result2 => result1.title === result2.title)
    ).length;
    const union = new Set([...serp1.map(result => result.title), ...serp2.map(result => result.title)]).size;
    return (intersection / union) * 100;
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

[
    {
        "id": "08160207-5948-0066-0000-fe18c16272e5",
        "status_code": 20000,
        "status_message": "Ok.",
        "time": "0.0261 sec.",
        "cost": 0,
        "result_count": 1,
        "path": [
            "v3",
            "serp",
            "google",
            "organic",
            "task_get",
            "regular",
            "08160207-5948-0066-0000-fe18c16272e5"
        ],
        "data": {
            "api": "serp",
            "function": "task_get",
            "se": "google",
            "se_type": "organic",
            "location_name": "Netherlands",
            "language_name": "Dutch",
            "keyword": "beste mechanische toetsenborden",
            "device": "desktop",
            "os": "windows"
        },
        "result": [
            {
                "keyword": "beste mechanische toetsenborden",
                "type": "organic",
                "se_domain": "google.nl",
                "location_code": 2528,
                "language_code": "nl",
                "check_url": "https://www.google.nl/search?q=beste%20mechanische%20toetsenborden&num=100&hl=nl&gl=NL&gws_rd=cr&ie=UTF-8&oe=UTF-8&uule=w+CAIQIFISCbvkh9vDCcZHEZ8Kvf_OdaGz",
                "datetime": "2023-08-15 23:07:33 +00:00",
                "spell": null,
                "item_types": [
                    "featured_snippet",
                    "organic",
                    "people_also_ask",
                    "related_searches"
                ],
                "se_results_count": 189000,
                "items_count": 98,
                "items": [
                    {
                        "type": "featured_snippet",
                        "rank_group": 1,
                        "rank_absolute": 1,
                        "domain": "www.toetsenbord-totaal.nl",
                        "title": "Beste Mechanische Toetsenborden van 2023",
                        "description": "Razer Ornata V3.\nLogitech MX Mechanical.\nSteelseries Apex Pro.\nLogitech G915.\nSharkoon SKILLER SGK5.",
                        "url": "https://www.toetsenbord-totaal.nl/soorten-toetsenborden/gaming/beste-mechanische-toetsenborden/",
                        "breadcrumb": null
                    },
                    {
                        "type": "organic",
                        "rank_group": 1,
                        "rank_absolute": 2,
                        "domain": "top-x.nl",
                        "title": "Beste Mechanische Toetsenbord [Test 2023] - top-X",
                        "description": "1. Logitech G915 Lightspeed Wireless RGB Mechanical Gaming Toetsenbord. Bekijk Beste prijs · 2. Corsair K95 RGB Platinum. Bekijk Beste prijs · 3.Logitech G815 ...",
                        "url": "https://top-x.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://top-x.nl › beste-mechanische-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 2,
                        "rank_absolute": 3,
                        "domain": "techadviseur.nl",
                        "title": "De Beste Mechanische Toetsenborden In 2023",
                        "description": "Welke mechanische toetsenborden zijn het beste? · #1. Trust GXT865; Goedkoop mechanisch toetsenbord voor huis-tuin-en-keukengebruik · #2. Corsair K70; Mooi ...",
                        "url": "https://techadviseur.nl/beste-mechanische-toetsenborden/",
                        "breadcrumb": "https://techadviseur.nl › Computer"
                    },
                    {
                        "type": "organic",
                        "rank_group": 3,
                        "rank_absolute": 4,
                        "domain": "tweakers.net",
                        "title": "Toetsenborden - Overzicht",
                        "description": "Beste toetsenborden · Logitech MX Keys (zonder polssteun, Qwerty US) · Logitech MX Mechanical (Kailh Choc Brown V2, Qwerty US) · Logitech G915 TKL (Qwerty US, GL ...",
                        "url": "https://tweakers.net/toetsenborden/",
                        "breadcrumb": "https://tweakers.net › toetsenborden"
                    },
                    {
                        "type": "organic",
                        "rank_group": 4,
                        "rank_absolute": 6,
                        "domain": "www.techreview.nl",
                        "title": "Beste mechanische toetsenbord 2023 - TechReview",
                        "description": "De beste mechanische toetsenborden van 2023 · 1. ROCCAT Vulcan 120 AIMO · 2. Ewent Play Mechanisch Gaming Toetsenbord met RGB-verlichting PL3350.",
                        "url": "https://www.techreview.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://www.techreview.nl › beste-mechanische-toetsen..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 5,
                        "rank_absolute": 7,
                        "domain": "www.eurogamer.nl",
                        "title": "De beste mechanische toetsenborden in 2021",
                        "description": "Beste gaming mechanisch toetsenbord - Corsair K95 Platinum XT · Beste 60% mechanisch toetsenbord - Razer Huntsman Mini · Beste algemeen mechanisch ...",
                        "url": "https://www.eurogamer.nl/beste-mechanische-toetsenborden",
                        "breadcrumb": "https://www.eurogamer.nl › Gidsen"
                    },
                    {
                        "type": "organic",
                        "rank_group": 6,
                        "rank_absolute": 8,
                        "domain": "www.pocket-lint.com",
                        "title": "Beste gamingtoetsenborden 2023: Stille, luide en RGB ...",
                        "description": "Beste gamingtoetsenborden: De beste stille, luide, kleurrijke en trotse mechanische toetsenborden die er zijn · Asus ROG Azoth · HyperX Origins 60.",
                        "url": "https://www.pocket-lint.com/nl-nl/laptops/koopgidsen/142759-beste-gaming-toetsenborden-mechanische-toetsenborden-en-stille-rgb-toetsenborden-om-te-kopen/",
                        "breadcrumb": "https://www.pocket-lint.com › ... › Hjälp voor installatie"
                    },
                    {
                        "type": "organic",
                        "rank_group": 7,
                        "rank_absolute": 9,
                        "domain": "doorgelicht.be",
                        "title": "De 7 beste mechanische toetsenborden van 2023",
                        "description": "Beste prijs-kwaliteit: Logitech G413 Mechanical bij Krefel · Beste budget: SteelSeries Apex 3 RGB bij Coolblue · Beste full-size: Corsair K95 RGB ...",
                        "url": "https://doorgelicht.be/beste-mechanisch-toetsenbord/",
                        "breadcrumb": "https://doorgelicht.be › beste-mechanisch-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 8,
                        "rank_absolute": 10,
                        "domain": "www.ergowerken.nl",
                        "title": "Mechanisch toetsenbord kopen? Al vanaf 49,95",
                        "description": "Je bestelt jouw mechanische ergonomische toetsenbord eenvoudig bij ergowerken. ✓ Ruime keuze ✓ Veilig betalen ✓ Gratis verzenden ✓ Gratis retourneren.",
                        "url": "https://www.ergowerken.nl/ergonomisch-toetsenbord/mechanisch-toetsenbord/",
                        "breadcrumb": "https://www.ergowerken.nl › ergonomisch-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 9,
                        "rank_absolute": 11,
                        "domain": "www.coolblue.nl",
                        "title": "De beste gaming toetsenborden tot 60 euro",
                        "description": "De beste gaming toetsenbord van maximaal 60 euro kopen? ... Trust GXT 863 Mazz Mechanisch Gaming Toetsenbord Qwerty De beste gaming toetsenbord van maximaal ...",
                        "url": "https://www.coolblue.nl/toetsenborden/gaming-toetsenborden/verlicht-toetsenbord/tot-60-euro",
                        "breadcrumb": "https://www.coolblue.nl › ... › Gaming toetsenborden"
                    },
                    {
                        "type": "organic",
                        "rank_group": 10,
                        "rank_absolute": 12,
                        "domain": "nl.hardware.info",
                        "title": "Dit zijn de beste mechanische toetsenborden (maart 2020)",
                        "description": "Beste mechanische toetsenbord voor gaming, Corsair K95 RGB Platinum XT Corsair K70 RGB MK.2. Logitech G815 Lightsync, Razer Huntsman TE.",
                        "url": "https://nl.hardware.info/artikel/9896/dit-zijn-de-beste-mechanische-toetsenborden-maart-2020",
                        "breadcrumb": "https://nl.hardware.info › artikel › dit-zijn-de-beste-me..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 11,
                        "rank_absolute": 13,
                        "domain": "id.nl",
                        "title": "Dit zijn de 10 beste mechanische toetsenborden",
                        "description": "Wij laten het zien aan de hand van de beste mechanische toetsenborden. Een mechanisch toetsenbord is bijzonder omdat elke knop is voorzien ...",
                        "url": "https://id.nl/zekerheid-en-gemak/veilig-online/beveiligingssoftware/de-beste-mechanische-toetsenborden",
                        "breadcrumb": "https://id.nl › veilig-online › beveiligingssoftware › de..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 12,
                        "rank_absolute": 14,
                        "domain": "www.kijkenvergelijk.nl",
                        "title": "Beste Mechanisch Toetsenbord 2023",
                        "description": "De 5 beste mechanische toetsenborden uitgelicht · 1. Razer Huntsman Elite Toetsenbord met polssteun Qwerty · 2. SteelSeries Apex Pro TKL Gaming Toetsenbord QWERTY.",
                        "url": "https://www.kijkenvergelijk.nl/computer/beste-mechanisch-toetsenbord/",
                        "breadcrumb": "https://www.kijkenvergelijk.nl › computer › beste-mec..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 13,
                        "rank_absolute": 15,
                        "domain": "gamingtoetsenbord.com",
                        "title": "Top 5 Beste Mechanisch Gaming Toetsenbord",
                        "description": "DE Beste Mechanische Toetsenborden · BESTE MECHANISCHE GAMING TOETSENBORD TOP 5 · SteelSeries Apex Pro QWERTY · HyperX Alloy Elite II RGB · ROCCAT VULCAN 121 AIMO.",
                        "url": "https://gamingtoetsenbord.com/mechanisch-toetsenbord/",
                        "breadcrumb": "https://gamingtoetsenbord.com › mechanisch-toetsenb..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 14,
                        "rank_absolute": 16,
                        "domain": "www.techspring.nl",
                        "title": "Beste Mechanisch toetsenbord: Winkelgids en ...",
                        "description": "Een mechanisch toetsenbord is een soort computertoetsenbord dat voor elke toets afzonderlijke schakelaars gebruikt. De schakelaar bepaalt het gevoel en het ...",
                        "url": "https://www.techspring.nl/beste-mechanisch-toetsenbord/",
                        "breadcrumb": "https://www.techspring.nl › ... › Toetsenborden"
                    },
                    {
                        "type": "organic",
                        "rank_group": 15,
                        "rank_absolute": 17,
                        "domain": "mag.ma",
                        "title": "De beste mechanische toetsenborden van 2023 voor ...",
                        "description": "Een mechanisch toetsenbord is een type toetsenbord dat mechanische schakelaars gebruikt om de toetsaanslagen te registreren.",
                        "url": "https://mag.ma/review/beste-mechanische-toetsenborden",
                        "breadcrumb": "https://mag.ma › Reviews › Computer & Elektronica"
                    },
                    {
                        "type": "organic",
                        "rank_group": 16,
                        "rank_absolute": 18,
                        "domain": "www.adviesjagers.nl",
                        "title": "Mechanisch toetsenbord: Wat zijn de beste ...",
                        "description": "Onze selectie: De beste mechanische toetsenborden op de markt · Mambasnake Mechanisch Toetsenbord · Logitech G Mechanisch Toetsenbord · Redragon Mechanisch ...",
                        "url": "https://www.adviesjagers.nl/mechanisch-toetsenbord/",
                        "breadcrumb": "https://www.adviesjagers.nl › mechanisch-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 17,
                        "rank_absolute": 19,
                        "domain": "www.alternate.nl",
                        "title": "Mechanische toetsenborden voordelig en eenvoudig ...",
                        "description": "Zoek je een mechanisch toetsenbord? ➜ Logitech G, Corsair, Ducky, Keychron, Leopold en meer mechanical keyboards eenvoudig online bestellen bij ...",
                        "url": "https://www.alternate.nl/Invoerapparaten/Toetsenborden/Mechanische-toetsenborden",
                        "breadcrumb": "https://www.alternate.nl › ... › Toetsenborden"
                    },
                    {
                        "type": "organic",
                        "rank_group": 18,
                        "rank_absolute": 20,
                        "domain": "www.gamesbuddy.nl",
                        "title": "Top 10 beste mechanische toetsenborden van 2023",
                        "description": "Top 10 mechanische toetsenborden · 1. Trust GXT · 2. Trust GXT · 3. Royal Kludge · 4. Logitech MX · 5. K30 Mechanisch Gaming Toetsenbord · 6. XINMENG Draadloos · 7.",
                        "url": "https://www.gamesbuddy.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://www.gamesbuddy.nl › beste-mechanische-toets..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 19,
                        "rank_absolute": 21,
                        "domain": "www.sharpshopping.nl",
                        "title": "Beste Mechanisch Toetsenbord van 2023 - SharpShopping",
                        "description": "Best Geteste Mechanisch Toetsenbord. Corsair K95 RGB Platinum – Qwerty – Cherry MX Brown – Mechanisch Gaming Toetsenbord. Omschrijving volgt ...",
                        "url": "https://www.sharpshopping.nl/computer/mechanisch-toetsenbord/",
                        "breadcrumb": "https://www.sharpshopping.nl › Computer"
                    },
                    {
                        "type": "organic",
                        "rank_group": 20,
                        "rank_absolute": 22,
                        "domain": "www.testresults.nl",
                        "title": "Beste mechanische toetsenbord (beste gaming toetsenbord)",
                        "description": "Onderwerpen: Het Corsair K95 RGB Platinum toetsenbord is als beste mechanische toetsenbord getest. Dit beste mechanische toetsenbord uit de test is zeer ...",
                        "url": "https://www.testresults.nl/2017/08/beste-toetsenbord-mechanisch.html",
                        "breadcrumb": "https://www.testresults.nl › 2017/08 › beste-toetsenbor..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 21,
                        "rank_absolute": 23,
                        "domain": "nerdplaza.nl",
                        "title": "Top 10 game producten | Best geteste mechanische toetsenbord",
                        "description": "Op zoek naar de BESTE mechanische toetsenborden om te kopen? Dan ben je bij ons op de juiste plek. De top best geteste mechanische toetsenborden op een rij!",
                        "url": "https://nerdplaza.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://nerdplaza.nl › beste-mechanische-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 22,
                        "rank_absolute": 24,
                        "domain": "pcguru.nl",
                        "title": "Beste mechanische toetsenborden juli 2023 - PC Guru",
                        "description": "Op zoek naar het beste mechanische toetsenbord die past bij jouw situatie? Verder zoeken heeft geen zin want hier vind je de beste mechanisch toetsenborden!",
                        "url": "https://pcguru.nl/toetsenbord/beste-mechanische-toetsenborden/",
                        "breadcrumb": "https://pcguru.nl › Toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 23,
                        "rank_absolute": 25,
                        "domain": "bestgekozen.nl",
                        "title": "Top 10 gaming toetsenborden 2023",
                        "description": "Op zoek naar het beste gaming toetsenbord? BestGekozen! ... Feit is wel dat veel gamers graag kiezen voor de beste mechanische toetsenborden.",
                        "url": "https://bestgekozen.nl/beste-gaming-toetsenbord/",
                        "breadcrumb": "https://bestgekozen.nl › Electronica"
                    },
                    {
                        "type": "organic",
                        "rank_group": 24,
                        "rank_absolute": 26,
                        "domain": "beedrop.be",
                        "title": "Welke gaming toetsenbord kiezen? De 7 beste ... - beedrop",
                        "description": "Gamers zullen de voorkeur geven aan mechanische toetsenborden, die veel voordelen bieden, zoals een duidelijke en scherpe aanslag, een zeer fijne ...",
                        "url": "https://beedrop.be/mechanische-gaming-toetsenbord/",
                        "breadcrumb": "https://beedrop.be › Computer Accessoires"
                    },
                    {
                        "type": "organic",
                        "rank_group": 25,
                        "rank_absolute": 27,
                        "domain": "techpulse.be",
                        "title": "De beste mechanische toetsenborden in 2021: Extra ...",
                        "description": "Wat maakt een mechanisch toetsenbord nu zo speciaal? Het grote verschil met een typisch kantoortoetsenbord is dat elke toets met een veersysteem ...",
                        "url": "https://techpulse.be/koopgids/317883/de-beste-mechanische-toetsenborden-in-2021-extra-finger-spitzengefuhl/",
                        "breadcrumb": "https://techpulse.be › koopgids › de-beste-mechanisch..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 26,
                        "rank_absolute": 28,
                        "domain": "geekflare.com",
                        "title": "9 beste mechanische toetsenborden voor Mac-gebruikers",
                        "description": "Het mechanische toetsenbord is een geweldige manier om het gebruik van je MacBook aangenamer te maken. Bekijk de beste toetsenborden voor uw ...",
                        "url": "https://geekflare.com/nl/mechanical-keyboards-for-mac/",
                        "breadcrumb": "https://geekflare.com › ... › Slimme gadgets"
                    },
                    {
                        "type": "organic",
                        "rank_group": 27,
                        "rank_absolute": 29,
                        "domain": "gadgetspecialisten.nl",
                        "title": "De top 10 best beoordeelde mechanische toetsenborden",
                        "description": "Zoek jij de beste mechanische toetsenbord? Op onze website laten we de beste mechanische toetsenborden zien die er nu zijn.",
                        "url": "https://gadgetspecialisten.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://gadgetspecialisten.nl › kantoorartikelen"
                    },
                    {
                        "type": "organic",
                        "rank_group": 28,
                        "rank_absolute": 30,
                        "domain": "gadgetpunt.nl",
                        "title": "Top 10 beste mechanische toetsenborden - Gadgetpunt.nl",
                        "description": "De Trust GXT 834 Callaz TKL Mechanisch Gaming Toetsenbord is een krachtig toetsenbord dat je de beste gaming ervaring geeft. Het heeft een intuïtieve layout die ...",
                        "url": "https://gadgetpunt.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://gadgetpunt.nl › beste-mechanische-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 29,
                        "rank_absolute": 31,
                        "domain": "degrotegadgetsgids.nl",
                        "title": "De top 10 beste mechanische toetsenbord van 2023",
                        "description": "1. Corsair K60 PRO TKL Optisch-mechanisch Gamingtoetsenbord US QWERTY · 2. Corsair K70 RGB MK. · 3. Royal Kludge RK61 RGB Mechanisch Gaming Toetsenbord met 61 ...",
                        "url": "https://degrotegadgetsgids.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://degrotegadgetsgids.nl › beste-mechanische-toet..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 30,
                        "rank_absolute": 32,
                        "domain": "www.ad.nl",
                        "title": "Thuiswerken als een pro: dit zijn de beste mechanische ...",
                        "description": "De beste travel krijg je van klassieke computerklavieren met een mechanisch toetsenbord. Die werken met metalen contacten onderaan de toetsen.",
                        "url": "https://www.ad.nl/tech/thuiswerken-als-een-pro-dit-zijn-de-beste-mechanische-toetsenborden~ae8d90de/",
                        "breadcrumb": "https://www.ad.nl › tech › thuiswerken-als-een-pro-dit..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 31,
                        "rank_absolute": 33,
                        "domain": "zakelijkcommunity.nl",
                        "title": "Beste mechanische toetsenbord vergelijken en kopen in 2023",
                        "description": "Hier volgt de opsomming van onze top 3 beste mechanische toetsenborden van 2023. 1. ZIYOU LANG T8 RGB. Op zoek naar een gaming toetsenbord dat ...",
                        "url": "https://zakelijkcommunity.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://zakelijkcommunity.nl › beste-mechanische-toet..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 32,
                        "rank_absolute": 34,
                        "domain": "electronicagetest.nl",
                        "title": "De beste mechanische toetsenbord van 2023? - TOP 10",
                        "description": "ElectronicaGetest.nl vergelijkt de BESTE mechanische toetsenborden van 2023. Vergelijk en kies een mechanische toetsenbord die bij jou past.",
                        "url": "https://electronicagetest.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://electronicagetest.nl › kantoorartikelen"
                    },
                    {
                        "type": "organic",
                        "rank_group": 33,
                        "rank_absolute": 35,
                        "domain": "global.techradar.com",
                        "title": "De beste toetsenborden 2023: comfortabel typen",
                        "description": "We hebben daarom alle toetsenborden verzameld die we zelf hebben getest of gebruikt, inclusief enkele mechanische toetsenborden en ...",
                        "url": "https://global.techradar.com/nl-nl/best/beste-toetsenbord-voor-typen",
                        "breadcrumb": "https://global.techradar.com › ... › Keyboards"
                    },
                    {
                        "type": "organic",
                        "rank_group": 34,
                        "rank_absolute": 36,
                        "domain": "kantoortop10.nl",
                        "title": "Top 10 beste mechanische toetsenborden op een rij | 2023",
                        "description": "Op Kantoortop10.nl vind je de leukste en BESTE mechanische toetsenborden van 2023! Lees onze mechanische toetsenbord reviews en kijk wat bij je past!",
                        "url": "https://kantoortop10.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://kantoortop10.nl › beste-mechanische-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 35,
                        "rank_absolute": 37,
                        "domain": "unu.ai",
                        "title": "De 10 Beste Mechanische Toetsenborden van 2023 om ...",
                        "description": "Dit is de Corsair K60 RGB PRO Mechanisch Qwerty Gaming Toetsenbord - Cherry MX Low Het CORSAIR K60 RGB PRO LOW PROFILE mechanische ...",
                        "url": "https://unu.ai/koopgids/beste-mechanische-toetsenborden/",
                        "breadcrumb": "https://unu.ai › koopgids › beste-mechanische-toetsen..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 36,
                        "rank_absolute": 38,
                        "domain": "techform.nl",
                        "title": "Beste Gaming Toetsenbord van 2023 - TechForm.nl",
                        "description": "Wat is de levensduur van de mechanische toetsen? 5.1. CORSAIR. 5.2. Cherry MX toetsen. 5.3. Razer.",
                        "url": "https://techform.nl/beste-gaming-toetsenbord/",
                        "breadcrumb": "https://techform.nl › ... › Elektronica & Computer"
                    },
                    {
                        "type": "organic",
                        "rank_group": 37,
                        "rank_absolute": 39,
                        "domain": "www.build-runes.nl",
                        "title": "Beste 75% mechanische toetsenborden in 2023",
                        "description": "Hier zijn onze top picks voor de beste 75% toetsenborden in 2023: 1. YUNZII KC84 84 Toetsen Hot ...",
                        "url": "https://www.build-runes.nl/blog/beste-75-toetsenborden/",
                        "breadcrumb": "https://www.build-runes.nl › blog › beste-75-toetsenb..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 38,
                        "rank_absolute": 40,
                        "domain": "werkenvanuitthuiskantoor.nl",
                        "title": "Top 10 beste mechanische toetsenborden op een rij | 2023",
                        "description": "WerkenVanuitThuiskantoor.nl vergelijkt de BESTE mechanische toetsenborden van 2023. Vergelijk en kies een mechanische toetsenbord die bij jou past.",
                        "url": "https://werkenvanuitthuiskantoor.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://werkenvanuitthuiskantoor.nl › beste-mechanisc..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 39,
                        "rank_absolute": 41,
                        "domain": "degroteelectronicagids.nl",
                        "title": "De top 10 beste mechanische toetsenbord van 2023",
                        "description": "3. Royal Kludge RK61 RGB Mechanisch Gaming Toetsenbord met 61 Keys Red Switches Ergonomisch Mechanical Gaming Keyboard.",
                        "url": "https://degroteelectronicagids.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://degroteelectronicagids.nl › beste-mechanische-t..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 40,
                        "rank_absolute": 42,
                        "domain": "zakelijkgenomen.nl",
                        "title": "10 goede mechanische toetsenborden voor jezelf",
                        "description": "Zoek jij de beste mechanische toetsenbord? Dan wil je een goede aankoop doen. Bij ons vind je alleen de beste mechanische toetsenborden die ...",
                        "url": "https://zakelijkgenomen.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://zakelijkgenomen.nl › Kantoorartikelen"
                    },
                    {
                        "type": "organic",
                        "rank_group": 41,
                        "rank_absolute": 43,
                        "domain": "ondernemersfaqs.nl",
                        "title": "Top 10 beste mechanische toetsenborden van 2023",
                        "description": "Kijk dan eens naar het SteelSeries Apex 5 RGB Hybrid Mechanical Gaming Keyboard. Dit toetsenbord biedt het beste van twee werelden met zijn hybride mechanische ...",
                        "url": "https://ondernemersfaqs.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://ondernemersfaqs.nl › computeraccessoires"
                    },
                    {
                        "type": "organic",
                        "rank_group": 42,
                        "rank_absolute": 44,
                        "domain": "www.youtube.com",
                        "title": "Beste MECHANISCH TOETSENBORD voor de prijs?! - YouTube",
                        "description": "Dit nieuwe toetsenbord van Cooler Master heeft eigenlijk alles wat je verwacht van een degelijk mechanisch toetsenbord.",
                        "url": "https://www.youtube.com/watch?v=cJiJHw-LN9A",
                        "breadcrumb": "https://www.youtube.com › watch"
                    },
                    {
                        "type": "organic",
                        "rank_group": 43,
                        "rank_absolute": 45,
                        "domain": "www.bedrijfloket.nl",
                        "title": "Top 10 beste mechanische toetsenborden - Bedrijfloket.nl",
                        "description": "Top 10 beste mechanische toetsenborden · 1. SteelSeries Apex 5 Gaming Toetsenbord · 2. Trust GXT 834 Callaz TKL Mechanisch Gaming Toetsenbord · 3. Royal Kludge ...",
                        "url": "https://www.bedrijfloket.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://www.bedrijfloket.nl › beste-mechanische-toetse..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 44,
                        "rank_absolute": 46,
                        "domain": "www.bedrijfscity.nl",
                        "title": "Top 10 beste mechanische toetsenborden - bedrijfscity.nl",
                        "description": "Top 3 beste mechanische toetsenborden · 1. SteelSeries Apex 7 Mechanisch Qwerty Gaming Toetsenbord · 2. Trust GXT 860 Thura Semi Mechanisch Gaming Toetsenbord ...",
                        "url": "https://www.bedrijfscity.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://www.bedrijfscity.nl › beste-mechanische-toetse..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 45,
                        "rank_absolute": 47,
                        "domain": "www.dutchcowboys.nl",
                        "title": "Wat is een mechanisch toetsenbord en waarom zou je ...",
                        "description": "Is een mechanisch toetsenbord een must-have, of alleen voor gamers? ... precies inhoudt en voor welke pc-gebruikers dit de beste optie is.",
                        "url": "https://www.dutchcowboys.nl/gadgets/wat-is-een-mechanisch-toetsenbord-en-waarom-zou-je-ervoor-kiezen",
                        "breadcrumb": "https://www.dutchcowboys.nl › gadgets › wat-is-een-..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 46,
                        "rank_absolute": 48,
                        "domain": "www.gamekampioen.nl",
                        "title": "Beste mechanische toetsenbord van 2023 | Top 10 reviews ...",
                        "description": "We beginnen met de top 5 beste mechanische toetsenborden. 1. SteelSeries Apex 7 Mechanisch Qwerty Gaming Toetsenbord. De ...",
                        "url": "https://www.gamekampioen.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://www.gamekampioen.nl › beste-mechanische-to..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 47,
                        "rank_absolute": 49,
                        "domain": "www.digitalphablet.com",
                        "title": "6 Best Quiet Mechanical Keyboard For Office and Gaming ...",
                        "description": "Dit artikel helpt je bij het kiezen van je beste stille mechanische toetsenbord. 1. Redragon K509. Redragon K509. Stil, mechanisch gaming- ...",
                        "url": "https://www.digitalphablet.com/nl/aanbiedingen/6-best-stille-mechanische-toetsenbord/",
                        "breadcrumb": "https://www.digitalphablet.com › Aanbiedingen"
                    },
                    {
                        "type": "organic",
                        "rank_group": 48,
                        "rank_absolute": 50,
                        "domain": "www.10monsters.nl",
                        "title": "5 Beste Gaming Toetsenborden - Koopgids 2023",
                        "description": "Mechanische toetsenborden maken gebruik van een schakelaar per toets. Een goed gaming toetsenbord heeft altijd mechanische toetsen omdat het sneller en ...",
                        "url": "https://www.10monsters.nl/beste-gaming-toetsenborden/",
                        "breadcrumb": "https://www.10monsters.nl › beste-gaming-toetsenbor..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 49,
                        "rank_absolute": 51,
                        "domain": "zakelijkebuddy.nl",
                        "title": "Top 10 mechanische toetsenbord - zakelijkebuddy.nl",
                        "description": "Wij maakten een top 10 lijst van de beste mechanische toetsenborden die je op de markt kan vinden. Met deze lijst hopen wij jou te helpen om de juiste keuze te ...",
                        "url": "https://zakelijkebuddy.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://zakelijkebuddy.nl › beste-mechanische-toetsenb..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 50,
                        "rank_absolute": 52,
                        "domain": "www.wifiwijs.nl",
                        "title": "Het Beste Gaming Toetsenbord van aug. 2023",
                        "description": "Switches zijn de mechanische schakelaars onder de toetsen van een mechanisch toetsenbord. Het type switch bepaalt hoeveel druk je uitoefent om ...",
                        "url": "https://www.wifiwijs.nl/beste-gaming-toetsenbord/",
                        "breadcrumb": "https://www.wifiwijs.nl › beste-gaming-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 51,
                        "rank_absolute": 53,
                        "domain": "top10punt.nl",
                        "title": "Top 10 beste mechanische toetsenborden van 2023",
                        "description": "Logitech MX Mechanical Draadloos mechanisch toetsenbord QWERTY ISO. Het toetsenbord heeft een prachtige vormgeving. De toetsen hebben een speciale coating aan ...",
                        "url": "https://top10punt.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://top10punt.nl › beste-mechanische-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 52,
                        "rank_absolute": 54,
                        "domain": "www.123businessbuddy.nl",
                        "title": "Top 10 beste mechanische toetsenborden van 2023",
                        "description": "Het SteelSeries Apex 5 RGB Hybride Mechanisch Gaming Toetsenbord combineert de voordelen van mechanische en membraan toetsenborden. Dit toetsenbord is perfect ...",
                        "url": "https://www.123businessbuddy.nl/beste-mechanische-toetsenbord/",
                        "breadcrumb": "https://www.123businessbuddy.nl › beste-mechanische..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 53,
                        "rank_absolute": 55,
                        "domain": "pcgaminggear.be",
                        "title": "De 7 beste gaming toetsenborden van 2023 | PCGG",
                        "description": "Beste prijs-kwaliteit: CORSAIR K55 RGB PRO XT · Beste koop: SteelSeries Apex 3 RGB · Beste draadloze: Logitech G915 Lightspeed · Beste mechanische: ...",
                        "url": "https://pcgaminggear.be/beste-gaming-toetsenbord/",
                        "breadcrumb": "https://pcgaminggear.be › Gaming setup › Toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 54,
                        "rank_absolute": 56,
                        "domain": "www.getwox.com",
                        "title": "De beste mechanische toetsenborden onder $ 100 in 2023 ...",
                        "description": "Hier moeten we een volledige recensie delen over het beste mechanische toetsenbord onder de 100. Ik weet zeker dat u deze recensie nuttig ...",
                        "url": "https://www.getwox.com/nl/best-mechanical-keyboards-under-100/",
                        "breadcrumb": "https://www.getwox.com › best-mechanical-keyboards-u..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 55,
                        "rank_absolute": 57,
                        "domain": "mediakoning.nl",
                        "title": "Het beste gaming toetsenbord",
                        "description": "Ga jij voor mechanisch of membraan? De klassieke mechanische toetsenborden zijn weer hip door de verbeterde schakelaars, deze zijn lichter en nauwkeurige met ...",
                        "url": "https://mediakoning.nl/het-beste-gaming-toetsenbord/",
                        "breadcrumb": "https://mediakoning.nl › het-beste-gaming-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 56,
                        "rank_absolute": 58,
                        "domain": "www.esportsclub.nl",
                        "title": "Dit zijn de beste gaming toetsenborden in 2021 voor esports",
                        "description": "Doordat elke toets op het toetsenbord een eigen mechanische switch heeft, zijn mechanische toetsenborden over het algemeen robuuster en beter ...",
                        "url": "https://www.esportsclub.nl/artikelen/gaming-toetsenborden-beste-esports",
                        "breadcrumb": "https://www.esportsclub.nl › artikelen › gaming-toetse..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 57,
                        "rank_absolute": 59,
                        "domain": "5top.nl",
                        "title": "De 5 beste toetsenborden van 2023",
                        "description": "1. Corsair K95 RGB Platinum – Beste mechanisch toetsenbord · 2. Apple Magic Keyboard – Beste Apple toetsenbord · 3. Razer Huntsman Elite Chroma – ...",
                        "url": "https://5top.nl/beste-toetsenbord/",
                        "breadcrumb": "https://5top.nl › beste-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 58,
                        "rank_absolute": 60,
                        "domain": "your.electricianexp.com",
                        "title": "6 beste membraan- en mechanische toetsenborden",
                        "description": "Logitech-toetsenbord met snoer K280e Zwart USB; A4Tech Bloody B120 zwarte USB; Razer Cynosa Chroma Black USB. De beste mechanische toetsenborden.",
                        "url": "https://your.electricianexp.com/nl/9/ratings/luchshie-membrannye-i-mehanicheskie-klaviatury/",
                        "breadcrumb": "https://your.electricianexp.com › ratings › luchshie-me..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 59,
                        "rank_absolute": 61,
                        "domain": "hardwaretips.nl",
                        "title": "Beste Gaming Toetsenbord Kopen 2023 - Hardware Tips",
                        "description": "Mechanisch toetsenbord. Mechanische toetsenborden registreren een toetsaanslag makkelijker. Dit is handig wanneer je een serieuze gamer bent, omdat je zo ...",
                        "url": "https://hardwaretips.nl/beste-gaming-toetsenbord/",
                        "breadcrumb": "https://hardwaretips.nl › Randapparatuur"
                    },
                    {
                        "type": "organic",
                        "rank_group": 60,
                        "rank_absolute": 62,
                        "domain": "www.thefastcode.com",
                        "title": "De beste goedkope mechanische toetsenborden onder de $ 40",
                        "description": "Mechanische toetsenborden zijn allemaal razernij computerliefhebbers en gamers. Als u al uw hele leven een rubberen koepel of een toetsenbord met ...",
                        "url": "https://www.thefastcode.com/nl-eur/article/the-best-cheap-mechanical-keyboards-under-40",
                        "breadcrumb": "https://www.thefastcode.com › nl-eur › article › the-be..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 61,
                        "rank_absolute": 63,
                        "domain": "www.mediamarkt.nl",
                        "title": "Hoe kies je de beste gaming toetsenbord?",
                        "description": "Een bedraad of draadloos gaming toetsenbord kopen?Kiezen tussen een membraan of mechanisch toetsenbordWelke kenmerken zijn verder belangrijk voor jou?",
                        "url": "https://www.mediamarkt.nl/nl/content/computer/beste-gaming-toetsenbord",
                        "breadcrumb": "https://www.mediamarkt.nl › content › computer › bes..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 62,
                        "rank_absolute": 64,
                        "domain": "www.gada.be",
                        "title": "De beste mechanische toetsenborden voor gamers: review",
                        "description": "Er zijn veel mechanische (gaming)toetsenborden op de markt. Het beste toetsenbord voor jou hangt af van jouw persoonlijke voorkeuren en behoeften.",
                        "url": "https://www.gada.be/de-beste-mechanische-toetsenborden-voor-gamers-review/",
                        "breadcrumb": "https://www.gada.be › de-beste-mechanische-toetsenb..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 63,
                        "rank_absolute": 65,
                        "domain": "www.ergo2go.nl",
                        "title": "Ergonomische mechanisch toetsenbord kopen? - Ergo2Go",
                        "description": "Het wordt ook wel een mechanisch gaming toetsenbord genoemd. Producten 1-9 van 13 ... Bij ERgo2go hebben we de beste mechanische toetsenborden.",
                        "url": "https://www.ergo2go.nl/ergonomische-toetsenborden/mechanisch-toetsenbord",
                        "breadcrumb": "https://www.ergo2go.nl › ergonomische-toetsenborden"
                    },
                    {
                        "type": "organic",
                        "rank_group": 64,
                        "rank_absolute": 66,
                        "domain": "www.get-digital.nl",
                        "title": "Toetsen voor mechanische toetsenborden - losse toetsen",
                        "description": "Natuurlijk degenen die hun zuurverdiende geld investeren in dergelijke toetsenborden worden hun beste vriend voor jaren en jaren. Dit betekent dat de ...",
                        "url": "https://www.get-digital.nl/toetsen-voor-mechanische-toetsenborden-losse-toetsen.html",
                        "breadcrumb": "https://www.get-digital.nl › Alle producten › Key Caps"
                    },
                    {
                        "type": "organic",
                        "rank_group": 65,
                        "rank_absolute": 67,
                        "domain": "paarshuis.nl",
                        "title": "Win met het Beste Gaming-Toetsenbord (aug. 2023)",
                        "description": "De twee hoofdtypes toetsenborden zijn de mechanische toetsenborden, en de membraantoetsenborden. Mechanisch. Een mechanishe toestenbord heeft ...",
                        "url": "https://paarshuis.nl/beste-gaming-toetsenbord/",
                        "breadcrumb": "https://paarshuis.nl › beste-gaming-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 66,
                        "rank_absolute": 68,
                        "domain": "techchecker.nl",
                        "title": "5 mods om je mechanische toetsenbord te verbeteren",
                        "description": null,
                        "url": "https://techchecker.nl/blog/gids/5-mods-om-je-mechanische-toetsenbord-te-verbeteren",
                        "breadcrumb": "https://techchecker.nl › blog › gids › 5-mods-om-je-m..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 67,
                        "rank_absolute": 69,
                        "domain": "www.artandcraft.com",
                        "title": "Mechanisch toetsenbord",
                        "description": "Mechanisch toetsenbord · Toetsenbordindeling : Qwerty · Backlight-kleur : Rood · Type mechanische keyswitch : Romer-G.",
                        "url": "https://www.artandcraft.com/nl-nl/v/mechanisch-toetsenbord",
                        "breadcrumb": "https://www.artandcraft.com › nl-nl › mechanisch-toet..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 68,
                        "rank_absolute": 70,
                        "domain": "metagamer.nl",
                        "title": "Mechanisch gaming toetsenbord kopen? | Metagamer",
                        "description": "Wat is een mechanisch gaming toetsenbord? Voordat we duiken in de selectie van de beste mechanische toetsenborden die op de markt zijn, is het goed om het ...",
                        "url": "https://metagamer.nl/gaming-gear/toetsenborden/mechanische-toetsenborden/",
                        "breadcrumb": "https://metagamer.nl › ... › Gaming toetsenborden"
                    },
                    {
                        "type": "organic",
                        "rank_group": 69,
                        "rank_absolute": 71,
                        "domain": "www.redable.nl",
                        "title": "Mechanische toetsenborden kopen?",
                        "description": "Een mechanisch toetsenbord is een type toetsenbord dat fysieke schakelaars gebruikt om toetsaanslagen te registreren. Mechanische toetsenborden worden over ...",
                        "url": "https://www.redable.nl/toetsenborden/mechanische-toetsenborden",
                        "breadcrumb": "https://www.redable.nl › ... › Toetsenborden"
                    },
                    {
                        "type": "organic",
                        "rank_group": 70,
                        "rank_absolute": 72,
                        "domain": "bestchinaproducts.com",
                        "title": "14 Beste Chinese mechanische toetsenbord 2023 | Gaming ...",
                        "description": "Wij hebben de beste Chinese mechanische toetsenborden op de markt samengesteld om u te helpen uw zoektocht naar het juiste mechanische ...",
                        "url": "https://bestchinaproducts.com/nl/best-chinese-mechanisch-toetsenbord/",
                        "breadcrumb": "https://bestchinaproducts.com › Home › Elektronica"
                    },
                    {
                        "type": "organic",
                        "rank_group": 71,
                        "rank_absolute": 73,
                        "domain": "www.sbsupply.nl",
                        "title": "Een mechanisch toetsenbord van Razer",
                        "description": "Het eerste mechanical keyboard van Razer: de Razer BlackWidow. Van oorsprong werden mechanische toetsenborden met name gebruikt in situaties ...",
                        "url": "https://www.sbsupply.nl/blog/een-mechanisch-toetsenbord-van-razer-wat-is-het-verschil-tussen-green-yellow-orange-purple-of-red-switches",
                        "breadcrumb": "https://www.sbsupply.nl › Blog"
                    },
                    {
                        "type": "organic",
                        "rank_group": 72,
                        "rank_absolute": 74,
                        "domain": "koopgids.net",
                        "title": "Mechanisch toetsenbord kopen? De beste opties! (2019)",
                        "description": "Top 4 beste mechanische toetsenborden vergelijken ; Corsair K95 Rgb Platinum, Das Keyboard 4 Professional ; Prijs, vanaf: ~ €177, ~ €173 ...",
                        "url": "https://koopgids.net/mechanisch-toetsenbord-kopen/",
                        "breadcrumb": "https://koopgids.net › mechanisch-toetsenbord-kopen"
                    },
                    {
                        "type": "organic",
                        "rank_group": 73,
                        "rank_absolute": 75,
                        "domain": "www.steviefy.be",
                        "title": "Dit zijn de 4 beste gaming toetsenborden van 2023 ✔️",
                        "description": "Corsair K60 RGB Pro · Type verbinding: Bedraad · Lay-out: Fullsize · Mechanische toets: Cherry Viola · Verlichting: RGB · Programmeerbare toetsen: ...",
                        "url": "https://www.steviefy.be/technologie/beste-gaming-toetsenbord/",
                        "breadcrumb": "https://www.steviefy.be › beste-gaming-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 74,
                        "rank_absolute": 76,
                        "domain": "reduxgaming.nl",
                        "title": "Gaming Toetsenborden",
                        "description": "Vind het beste gaming toetsenbord voor jou bij Redux Gaming! ... Over het algemeen worden mechanische toetsenborden als beste beschouwd voor gaming, ...",
                        "url": "https://reduxgaming.nl/gaming-gear/gaming-toetsenborden/",
                        "breadcrumb": "https://reduxgaming.nl › Gaming Gear"
                    },
                    {
                        "type": "organic",
                        "rank_group": 75,
                        "rank_absolute": 77,
                        "domain": "techfi.nl",
                        "title": "Logitech MX Mechanical review: het beste van twee ...",
                        "description": "De Logitech MX Mechanical is het eerste 'gewone' toetsenbord van Logitech met mechanische schakelaars. Kan het de vergelijking met de ...",
                        "url": "https://techfi.nl/logitech-mx-mechanical-review",
                        "breadcrumb": "https://techfi.nl › logitech-mx-mechanical-review"
                    },
                    {
                        "type": "organic",
                        "rank_group": 76,
                        "rank_absolute": 78,
                        "domain": "techgaming.nl",
                        "title": "Mechanische toetsenborden; laag versus hoog profiel",
                        "description": "Mechanische toetsenborden komen in talloze vormen. In deze TechGaming Guide wordt het verschil tussen een laag en hoog profiel uitgeweid.",
                        "url": "https://techgaming.nl/tg-guide-mechanische-toetsenborden-laag-versus-hoog-profiel/",
                        "breadcrumb": "https://techgaming.nl › tg-guide-mechanische-toetsenb..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 77,
                        "rank_absolute": 79,
                        "domain": "clickeys.nl",
                        "title": "Clickeys.nl",
                        "description": "De Nederlandse webwinkel voor Mechanische Toetsenborden, Keycaps, Coiled Cables, Keyboard Lube en andere gerelateerde artikelen! Alles voor Mechanische ...",
                        "url": "https://clickeys.nl/",
                        "breadcrumb": "https://clickeys.nl"
                    },
                    {
                        "type": "organic",
                        "rank_group": 78,
                        "rank_absolute": 80,
                        "domain": "techwow.nl",
                        "title": "De beste gaming toetsenborden in 2021 - Techwow",
                        "description": "Beste gaming toetsenbord voor elk budget · Mechanisch vs. · De verschillende soorten switches van mechanische toetsenborden · Het juiste keyboard ...",
                        "url": "https://techwow.nl/beste-gaming-toetsenbord/",
                        "breadcrumb": "https://techwow.nl › Koopgidsen"
                    },
                    {
                        "type": "organic",
                        "rank_group": 79,
                        "rank_absolute": 81,
                        "domain": "nl.moyens.net",
                        "title": "5 beste mechanische toetsenborden voor kantoorwerk ...",
                        "description": "2. Logitech K840 mechanisch toetsenbord. Zoals de meeste mechanische toetsenborden van Logitech, heeft deze ook Romer-G-schakelaars onder de ABS ...",
                        "url": "https://nl.moyens.net/winkelgids/5-beste-mechanische-toetsenborden-voor-kantoorwerk-onder-100/",
                        "breadcrumb": "https://nl.moyens.net › Winkelgids"
                    },
                    {
                        "type": "organic",
                        "rank_group": 80,
                        "rank_absolute": 82,
                        "domain": "www.backshop.nl",
                        "title": "Mechanisch toetsenbord kopen? - Backshop.nl",
                        "description": "Wat is een mechanisch toetsenbord? Voordelen; Veelgestelde vragen. Ons assortiment mechanische toetsenborden is nog vrij klein. Wij vertegenwoordigen onder ...",
                        "url": "https://www.backshop.nl/ergonomische-toetsenborden/mechanisch-toetsenbord.html",
                        "breadcrumb": "https://www.backshop.nl › toetsenborden"
                    },
                    {
                        "type": "organic",
                        "rank_group": 81,
                        "rank_absolute": 83,
                        "domain": "www.bol.com",
                        "title": "Mechanical keyboard kopen? Kijk snel!",
                        "description": "Mechanical keyboards. Mechanische toetsenborden beschikken over mechanical switches. Deze switches, ofwel toetsen zijn in verschillende varianten verkrijgbaar.",
                        "url": "https://www.bol.com/nl/nl/l/mechanical-keyboards/18214/4274723610/",
                        "breadcrumb": "https://www.bol.com › ... › Gaming toetsenborden"
                    },
                    {
                        "type": "organic",
                        "rank_group": 82,
                        "rank_absolute": 84,
                        "domain": "debeste.com",
                        "title": "Beste gaming toetsenborden 202 - Top 5 beste koop",
                        "description": "Mechanische toetsen: Nee. Morsbestendig: Ja. Merk: Corsair. Zoals gezegd is het beste gaming toetsenbord de Corsair K55 RGB Pro Gaming ...",
                        "url": "https://debeste.com/gaming-toetsenbord/",
                        "breadcrumb": "https://debeste.com › gaming-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 83,
                        "rank_absolute": 85,
                        "domain": "gagadget.com",
                        "title": "De 5 beste mechanische toetsenborden op de rode, ...",
                        "description": "De 5 beste mechanische toetsenborden op de rode, blauwe, bruine en zilveren schakelaar. Via: Yuriy Pyatkovskiy | 14.04.2022, 10:38. De 5 beste mechanische ...",
                        "url": "https://gagadget.com/nl/240489-de-5-beste-mechanische-toetsenborden-op-de-rode-blauwe-bruine-en-zilveren-schakelaar/",
                        "breadcrumb": "https://gagadget.com › 240489-de-5-beste-mechanisch..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 84,
                        "rank_absolute": 86,
                        "domain": "gamepc.nl",
                        "title": "Mechanische toetsenborden - Een vooruitgang?",
                        "description": "Wat is eigenlijk het verschil tussen deze type toetsenborden en wat zijn de grote voordelen van een mechanische toetsenbord in vergelijking met ...",
                        "url": "https://gamepc.nl/blog/mechanische-toetsenborden-echt-een-vooruitgang/",
                        "breadcrumb": "https://gamepc.nl › blog › mechanische-toetsenborden..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 85,
                        "rank_absolute": 87,
                        "domain": "www.pixelvault.nl",
                        "title": "Hoe kies je een mechanisch toetsenbord? - Pixel Vault",
                        "description": "De wereld van mechanische toetsenborden is een bizar diepgaand ... zegje over welke precieze schakelaar de beste 'klik' of 'klak' levert, ...",
                        "url": "https://www.pixelvault.nl/gear/achtergrond/hoe-kies-je-een-mechanisch-toetsenbord/",
                        "breadcrumb": "https://www.pixelvault.nl › gear › achtergrond › hoe-..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 86,
                        "rank_absolute": 88,
                        "domain": "nl.aliexpress.com",
                        "title": "ZA616 61 Toetsen Mini Gaming Mechanische Toetsenbord ...",
                        "description": "Koop ZA616 61 Toetsen Mini Gaming Mechanische Toetsenbord Rgb Nkro Hotswap 60% ... en snelheid naar believen aanpassen om uw beste ervaring te bereiken.",
                        "url": "https://nl.aliexpress.com/item/1005005324879112.html",
                        "breadcrumb": "https://nl.aliexpress.com › item"
                    },
                    {
                        "type": "organic",
                        "rank_group": 87,
                        "rank_absolute": 89,
                        "domain": "selectos.eu",
                        "title": "Het Beste Gaming Toetsenbord 2023 | Test door Selectos",
                        "description": "Bekijk onze vergelijking van de beste gamer toetsenborden van dit moment, ... Mechanische toetsenborden zijn ideaal als je op zoek bent naar een goed gaming ...",
                        "url": "https://selectos.eu/nl/beste-gaming-toetsenbord/",
                        "breadcrumb": "https://selectos.eu › beste-gaming-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 88,
                        "rank_absolute": 90,
                        "domain": "www.destentor.nl",
                        "title": "dit zijn de beste mechanische toetsenborden | Foto",
                        "description": "Cooler Master CK550 RGB © Hardware.info. Corsair K68 © Hardware.info. Gigabyte Aorus K9 © Hardware.info. Leopold FC900R PD © Hardware.info.",
                        "url": "https://www.destentor.nl/tech/ouderwets-lekker-klikken-dit-zijn-de-beste-mechanische-toetsenborden~a645b678/146886241/",
                        "breadcrumb": "https://www.destentor.nl › tech › ouderwets-lekker-kli..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 89,
                        "rank_absolute": 91,
                        "domain": "www.deondernemer.nl",
                        "title": "Thuiswerken als een pro: dit zijn de beste mechanische ...",
                        "description": "Wij adviseren dat je voor optimaal typgenot kiest voor een mechanisch toetsenbord. Dit zijn de best geteste en lekkerst tikkende toetsenborden.",
                        "url": "https://www.deondernemer.nl/corona/coronavirus/thuiswerken-pro-beste-mechanische-toetsenborden~2066929",
                        "breadcrumb": "https://www.deondernemer.nl › Corona › Coronavirus"
                    },
                    {
                        "type": "organic",
                        "rank_group": 90,
                        "rank_absolute": 92,
                        "domain": "www.tubantia.nl",
                        "title": "dit zijn de beste mechanische toetsenborden | Foto",
                        "description": "AD Beeld. Cooler Master CK550 RGB © Hardware.info. Corsair K68 © Hardware.info. Gigabyte Aorus K9 © Hardware.info. Leopold FC900R PD © Hardware.info.",
                        "url": "https://www.tubantia.nl/tech/ouderwets-lekker-klikken-dit-zijn-de-beste-mechanische-toetsenborden~a645b678/146886319/",
                        "breadcrumb": "https://www.tubantia.nl › tech › ouderwets-lekker-klik..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 91,
                        "rank_absolute": 93,
                        "domain": "technerds.nl",
                        "title": "Het Beste Toetsenbord op de Markt (aug. 2023)",
                        "description": "Met het beste toetsenbord typ je met gemak op je computer. ... Door de gevoelige toetsen houden mechanische toetsenborden een hoge ...",
                        "url": "https://technerds.nl/beste-toetsenbord/",
                        "breadcrumb": "https://technerds.nl › beste-toetsenbord"
                    },
                    {
                        "type": "organic",
                        "rank_group": 92,
                        "rank_absolute": 94,
                        "domain": "silvergear.eu",
                        "title": "Mechanisch Gaming Keyboard kopen? Bekijk hem nu op ...",
                        "description": "Productbeschrijving: Mechanisch Gaming Keyboard. Fanatieke gamer? Dan kan je niet zonder de beste uitrusting! Dit mechanische toetsenbord is ideaal voor gamers: ...",
                        "url": "https://silvergear.eu/gaming/mechanisch-gaming-keyboard/",
                        "breadcrumb": "https://silvergear.eu › ... › Gaming Gear en Hardware"
                    },
                    {
                        "type": "organic",
                        "rank_group": 93,
                        "rank_absolute": 95,
                        "domain": "gpnapratica.com.br",
                        "title": "12 Beste toetsenborden voor schrijvers in 2022 ...",
                        "description": "Dus wat is het beste toetsenbord voor u? Meestal geven schrijvers de voorkeur aan een van de drie typen: ergonomisch, mechanisch of compact.",
                        "url": "https://gpnapratica.com.br/nl/12-beste-toetsenborden-voor-schrijvers-in-2022-gedetailleerde-beoordeling",
                        "breadcrumb": "https://gpnapratica.com.br › 12-beste-toetsenborden-v..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 94,
                        "rank_absolute": 96,
                        "domain": "www.gameadviseur.nl",
                        "title": "Goedkope gaming toetsenbord kopen? De 5 beste van 2022!",
                        "description": "Kortom, voor de gamers is een mechanisch toetsenbord de beste keuze. Dan heb je ook nog de semi-mechanische toetsenborden, ...",
                        "url": "https://www.gameadviseur.nl/de-5-beste-goedkope-gaming-toetsenborden/",
                        "breadcrumb": "https://www.gameadviseur.nl › de-5-beste-goedkope-g..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 95,
                        "rank_absolute": 97,
                        "domain": "nl.ign.com",
                        "title": "De beste en meest betaalbare gaming toestenborden in ...",
                        "description": "Een gaming setup staat of valt met een gaming-toetsenbord, wil je meer uitgeven aan een mechanisch toetsenbord of ga je voor een ...",
                        "url": "https://nl.ign.com/razer-2/122366/feature/de-beste-en-meest-betaalbare-gaming-toestenborden-in-2020",
                        "breadcrumb": "https://nl.ign.com › Feature › Razer"
                    },
                    {
                        "type": "organic",
                        "rank_group": 96,
                        "rank_absolute": 98,
                        "domain": "www.logitech.com",
                        "title": "Combinatie mechanisch toetsenbord en muis van normaal ...",
                        "description": "Profiteer van het nauwkeurige typen op een mechanisch toetsenbord met vlakke ... Benut je potentieel met een combinatie van MX-oplossingen die het beste ...",
                        "url": "https://www.logitech.com/nl-nl/mx/mx-solutions/full-size-mechanical-keyboard-mouse.html",
                        "breadcrumb": "https://www.logitech.com › nl-nl › mx-solutions › full-si..."
                    },
                    {
                        "type": "organic",
                        "rank_group": 97,
                        "rank_absolute": 99,
                        "domain": "www.amazon.nl",
                        "title": "Gamingtoetsenborden - Accessoires: Games",
                        "description": "Mechanisch gamingtoetsenbord, 87 toetsen Toetsenborden RGB LED regenboog verlicht ... Logitech G915 TKL Tenkeyless LIGHTSPEED Mechanisch Gaming Toetsenbord, ...",
                        "url": "https://www.amazon.nl/b?ie=UTF8&node=16480857031",
                        "breadcrumb": "https://www.amazon.nl › ..."
                    }
                ]
            }
        ]
    }
]