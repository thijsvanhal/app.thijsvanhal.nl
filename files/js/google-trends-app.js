// Ophalen van cookies
function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? decodeURIComponent(cookieValue.pop()) : '';
}

// login form
var modal = document.getElementById("loginModal");
var button = document.querySelector("#inlog_knop");
var span = document.getElementsByClassName("btn-close")[0];
var loginButton = document.getElementById("loginButton");
var logoutButton = document.getElementById("logoutButton");
var rememberme = document.getElementById("rememberMe");
const inlog_knop = document.getElementById("inlog_knop");
inlog_knop.onclick = inlogUpdate();
window.onload = inlogUpdate();

function inlogUpdate() {
    var ingelogd = document.getElementById("ingelogd");
    var ingelogd_text = document.getElementById("ingelogd_text");
    let login_cookie = getCookie("login");
    const login_email_veld = document.getElementById("inputEmail");
    const login_api_veld = document.getElementById("inputAPI");
    const login_email = document.getElementById("inputEmail").value;
    const login_api = document.getElementById("inputAPI").value;
    if (login_cookie) {
        var login_email_cookie = getCookie("login");
        var login_api_cookie = getCookie("password");
        ingelogd.textContent = "Je bent op dit moment ingelogd met e-mail: " + login_email_cookie;
        login_email_veld.value = login_email_cookie;
        login_api_veld.value = login_api_cookie;
    } else if (login_email != "") {
        ingelogd.textContent = "Je bent op dit moment ingelogd met e-mail: " + login_email;
        ingelogd_text.textContent = "Je bent op dit moment ingelogd met e-mail: " + login_email;
        login_email_veld.value = login_email;
        login_api_veld.value = login_api;
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
        var expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 365);
        document.cookie = "login=" + encodeURIComponent(document.getElementById("inputEmail").value) + ";path=/; expires=" + expirationDate.toUTCString();
        document.cookie = "password=" + encodeURIComponent(document.getElementById("inputAPI").value) + "; path=/; expires=" + expirationDate.toUTCString();
    }
    inlogUpdate();
};

logoutButton.onclick = function() {
    document.getElementById("inputEmail").value = '';
    document.getElementById("inputAPI").value = '';
    document.getElementById("ingelogd_text").textContent = '';
    document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;";
    document.cookie = "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;";
};

let DataArray = [];
let taskIds = [];
let lineNames = [];
let apiMethodes = [];
let login;
let password;
let api_methode;

async function getData() {
    DataArray = [];
    taskIds = [];
    lineNames = [];
    apiMethodes = [];

    const inputTextarea = document.querySelector('#bulk-input')
    const lines = inputTextarea.value.split("\n");

    for (const line of lines) {
        DataArray.push({
            line: line,
            Topics: [],
            Keywords: []
        });

        // login
        const email_login = document.getElementById("inputEmail").value;
        const api_login = document.getElementById("inputAPI").value;
        let login_cookie = getCookie("login");

        if (login_cookie) {
            login = getCookie("login");
            password = getCookie("password");
        } else {
            login = email_login;
            password = api_login;
        }

        const selectElement = document.querySelector('.form-select');
        const lookupTable = {
            Nederland: { country: 'Netherlands', language: 'Dutch' },
            vlaanderen: { country: 'Belgium', language: 'Dutch' },
            wallonie: { country: 'Belgium', language: 'French' },
        };
        const selectedOption = selectElement.value;
        const { country, language } = lookupTable[selectedOption];

        const post_array = [{
            "location_name": country,
            "language_name": language,
            "keywords": [line],
            "time_range": "past_day",
            "item_types": [
                "google_trends_queries_list",
                "google_trends_topics_list",
            ],
        }];

        const post_url = "https://api.dataforseo.com/v3/keywords_data/google_trends/explore/task_post";
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
        lineNames.push(line);
        taskIds.push(post_result.tasks[0].id);
    }

    for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const line_name = lineNames[i];
        const results = await fetchData(taskId, login, password);
        for (const result of results) {
            const items = result.items;

            const risingTopics = items.filter(item => item.type === 'google_trends_topics_list')[0];
            const risingTopicData = risingTopics.data.rising;
            for (const topic of risingTopicData) {
                const risingTopicTitle = topic.topic_title;
                const risingTopicType = topic.topic_type;
                const existingObject = DataArray.find(obj => obj.line === line_name);
                if (existingObject) {
                    existingObject.Topics.push([`${risingTopicTitle} - ${risingTopicType}`]);
                }
            }

            const risingQueries = items.filter(item => item.type === 'google_trends_queries_list')[0];
            const risingQueryData = risingQueries.data.rising;
            for (const query of risingQueryData) {
                const risingQuery = query.query;
                const existingObject = DataArray.find(obj => obj.line === line_name);
                if (existingObject) {
                    existingObject.Keywords.push([risingQuery]);
                }
            }
            console.log(DataArray);
        }
    }
    generateExcel();
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
        const get_url = `https://api.dataforseo.com/v3/keywords_data/google_trends/explore/task_get/${taskId}`;
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

function generateExcel() {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);

    const headers = [];
    for (let i = 0; i < DataArray.length; i++) {
        headers.push(`${DataArray[i].line} Topics `);
        headers.push(`${DataArray[i].line} Keywords `);
        headers.push(null);
    }
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

    const data = [];
    let maxLines = 0;
    DataArray.forEach(function (item) {
        if (item.Topics.length > maxLines) {
            maxLines = item.Topics.length;
        }
    });

    for (let i = 0; i < maxLines; i++) {
        const row = [];
        DataArray.forEach(function (item) {
            row.push(item.Topics[i]);
            row.push(item.Keywords[i]);
            row.push(null);
        });
        data.push(row);
    }

    XLSX.utils.sheet_add_aoa(worksheet, data, { origin: 'A2' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'google-trends.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}