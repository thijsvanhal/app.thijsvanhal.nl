// JavaScript

var keywordsInput = document.getElementById('keywords-input-area');
var keywordsOutput = document.getElementById('keywords-output-area');
var exactMatch = document.getElementById("exact-match-input");
var phraseMatch = document.getElementById("phrase-match-input");
var broadMatch = document.getElementById("broad-match-input");

function removeDuplicates() {
    var keywordsOutputValue = document.getElementById('keywords-output-area').value;
    let keywords = keywordsOutputValue.split("\n");
    let uniqueKeywords = new Map();
    for (let keyword of keywords) {
        uniqueKeywords.set(keyword, keyword);
    }
    keywordsOutputValue = Array.from(uniqueKeywords.values()).join("\n");
    keywordsOutput.value = keywordsOutputValue;
}

let SeeNotification = true;

function Wrapper () {
    keywordsOutput.value = "";
    var exactMatchCheck = document.getElementById("exact-match-input").checked;
    var phraseMatchCheck = document.getElementById("phrase-match-input").checked;
    var broadMatchCheck = document.getElementById("broad-match-input").checked;
    var keywordsInputValue = document.getElementById('keywords-input-area').value;
    var keywords = keywordsInputValue.split("\n");
    if (keywordsInputValue == '') {
        return;
    }
    if (exactMatchCheck) {
        var formattedKeywordsExact = keywords.map(keyword => `[${keyword}]`);
        if (keywordsOutput.value === "") {
            keywordsOutput.value += formattedKeywordsExact.join("\n");
        } else {
            keywordsOutput.value += "\n" + formattedKeywordsExact.join("\n");
        }
    }
    if (phraseMatchCheck) {
        var formattedKeywordsPhrase = keywords.map(keyword => `"${keyword}"`);
        if (keywordsOutput.value === "") {
            keywordsOutput.value += formattedKeywordsPhrase.join("\n");
        } else {
            keywordsOutput.value += "\n" + formattedKeywordsPhrase.join("\n");
        }
    }
    if (broadMatchCheck) {
        if (keywordsOutput.value === "") {
            keywordsOutput.value += keywords.join("\n");
        } else {
            keywordsOutput.value += "\n" + keywords.join("\n");
        }
    }
    removeDuplicates();
}

exactMatch.addEventListener('click', () => {
    Wrapper();
});

phraseMatch.addEventListener('click', () => {
    Wrapper();
});

broadMatch.addEventListener('click', () => {
    Wrapper();
});
keywordsInput.addEventListener('input', (event) => {
    Wrapper();
});
keywordsInput.addEventListener('click', (event) => {
    if (keywordsInput.value !== '') {
        keywordsInput.select();
    }
});
keywordsInput.addEventListener('focus', (event) => {
    if (keywordsInput.value !== '') {
        keywordsInput.select();
    }
});
keywordsOutput.addEventListener('click', (event) => {
    if (keywordsOutput.value !== '') {
        keywordsOutput.select();
        document.execCommand("copy");
        showNotification('Resultaten gekopieerd naar clipboard!', 3000);
        SeeNotification = true;
    }
});
keywordsOutput.addEventListener('focus', (event) => {
    if (keywordsOutput.value !== '' && SeeNotification) {
        keywordsOutput.select();
        document.execCommand("copy");
        showNotification('Resultaten gekopieerd naar clipboard!', 3000);
        SeeNotification = false;
    }
});

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