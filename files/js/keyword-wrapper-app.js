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

function Wrapper () {
    keywordsOutput.value = "";
    var exactMatchCheck = document.getElementById("exact-match-input").checked;
    var phraseMatchCheck = document.getElementById("phrase-match-input").checked;
    var broadMatchCheck = document.getElementById("broad-match-input").checked;
    var keywordsInputValue = document.getElementById('keywords-input-area').value;
    var keywords = keywordsInputValue.split("\n");
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