// JavaScript Code

// Constanten
const resultTextarea = document.getElementById('result-mixer');
const resultLength = document.getElementById('woorden-totaal');
const keywordsInput1 = document.getElementById('lijst-1');
const keywordsInput2 = document.getElementById('lijst-2');
const keywordsInput3 = document.getElementById('lijst-3');

// Alert voor meer dan 10.000 zoekwoorden
let showAlert = true;

function showMaxWordCountAlert() {
  if (showAlert) {
    if (document.documentElement.lang === 'nl') {
        window.alert('In Google Ads kun je maximaal 10.000 woorden plakken, pas je zoekwoordlijsten aan!');
    } else if (document.documentElement.lang === 'en') {
        window.alert('You can only paste up to 10.000 keywords in Google Ads, change your keyword lists!');
    }
    showAlert = false;
  }
}

// Functie Length
function getLength(mixedKeywords) {
    const string = mixedKeywords.toString()
    if (string.split('\n').length >= 10000) {
        showMaxWordCountAlert();
    }
    if (document.documentElement.lang === 'nl') {
        return new String(`${string.split('\n').length} Zoekwoorden`);
    } else if(document.documentElement.lang === 'en') {
        return new String(`${string.split('\n').length} Keywords`);
    }
}

// Functie mixKeywords
function mixKeywords(...lists) {
    let result = lists.reduce((acc, list) => {
        return acc.map((el) => list.map((listEl) => el + (el && listEl ? ' ' : '') + listEl)).flat(Infinity);
    }, ['']);
    return result.join("\n").trim();
}

// Functie Duplicates
function removeDuplicates(mixedKeywords) {
    let keywords = mixedKeywords.split("\n");
    let uniqueKeywords = new Map();
    for (let keyword of keywords) {
        uniqueKeywords.set(keyword, keyword);
    }
    return Array.from(uniqueKeywords.values()).join("\n");
}

// Code voor automatisch updaten van mixer
var elements = ["lijst-1", "lijst-2", "lijst-3", "optional-list-mix", "optional-list-2", "optional-list-3"];
for (var i = 0; i < elements.length; i++) {
    var el = document.getElementById(elements[i]);
    if (el instanceof HTMLInputElement) {
        el.addEventListener("input", updateMixer);
    } else {
        el.addEventListener("blur", updateMixer);
    }
}

function updateMixer () {
    var textArea1 = document.getElementById("lijst-1").value;
    var keywords1 = textArea1 ? textArea1.split("\n").filter(Boolean) : [''];
    var textArea2 = document.getElementById("lijst-2").value;
    var keywords2 = textArea2 ? textArea2.split("\n").filter(Boolean) : [''];
    var textArea3 = document.getElementById("lijst-3").value;
    var keywords3 = textArea3 ? textArea3.split("\n").filter(Boolean) : [''];
    var switchOrder = document.getElementById("optional-list-mix").checked;
    var optional2 = document.getElementById("optional-list-2").checked;
    var optional3 = document.getElementById("optional-list-3").checked;
    var mixedKeywords = [];
    
    if (switchOrder) {
        // lijsten wisselen
        if (optional2 && optional3) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords2),
                mixKeywords(keywords1, keywords3),
                mixKeywords(keywords1),
                mixKeywords(keywords1, keywords3, keywords2),
                mixKeywords(keywords2, keywords1, keywords3),
                mixKeywords(keywords2, keywords1),
                mixKeywords(keywords2, keywords3, keywords1),
                mixKeywords(keywords3, keywords1),
                mixKeywords(keywords3, keywords1, keywords2),
                mixKeywords(keywords3, keywords2, keywords1),
            ].join("\n");
        } else if (optional3) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords2),
                mixKeywords(keywords1, keywords3, keywords2),
                mixKeywords(keywords2, keywords1, keywords3),
                mixKeywords(keywords2, keywords1),
                mixKeywords(keywords2, keywords3, keywords1),
                mixKeywords(keywords3, keywords1, keywords2),
                mixKeywords(keywords3, keywords2, keywords1),
            ].join("\n");
        } else if (optional2) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords3),
                mixKeywords(keywords1, keywords3, keywords2),
                mixKeywords(keywords2, keywords1, keywords3),
                mixKeywords(keywords2, keywords3, keywords1),
                mixKeywords(keywords3, keywords1),
                mixKeywords(keywords3, keywords1, keywords2),
                mixKeywords(keywords3, keywords2, keywords1),
            ].join("\n");
        } else {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords3, keywords2),
                mixKeywords(keywords2, keywords1, keywords3),
                mixKeywords(keywords2, keywords3, keywords1),
                mixKeywords(keywords3, keywords1, keywords2),
                mixKeywords(keywords3, keywords2, keywords1),
            ].join("\n");
        }
    } else {
        // lijsten niet wisselen
        if (optional2 && optional3) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords2),
                mixKeywords(keywords1, keywords3),
                mixKeywords(keywords1),
            ].join("\n");
        } else if (optional3) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords2),
            ].join("\n");
        } else  if (optional2) {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
                mixKeywords(keywords1, keywords3),
            ].join("\n");
        } else {
            mixedKeywords = [
                mixKeywords(keywords1, keywords2, keywords3),
            ].join("\n");
        }
    }
    let noDuplicates = removeDuplicates(mixedKeywords);
    var length = getLength(noDuplicates);
    resultTextarea.value = noDuplicates.toString();
    resultLength.textContent = length.toString();
    window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'zoekwoorden_gegenereerd'});
};
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
// Zorg dat alles automatisch geselecteerd wordt
resultTextarea.addEventListener('click', () => {
    if (resultTextarea.value !== '') {
        resultTextarea.select();
        document.execCommand("copy");
        if (document.documentElement.lang === 'nl') {
            showNotification('Resultaten gekopieerd naar clipboard!', 3000);
            showAlert = true;
        } else if(document.documentElement.lang === 'en') {
            showNotification('Results copied to clipboard!', 3000);
            showAlert = true;
        }
    }
});
resultTextarea.addEventListener('focus', () => {
    if (resultTextarea.value !== '') {
        resultTextarea.select();
        document.execCommand("copy");
        if (document.documentElement.lang === 'nl') {
            showNotification('Resultaten gekopieerd naar clipboard!', 3000);
            showAlert = true;
        } else if(document.documentElement.lang === 'en') {
            showNotification('Results copied to clipboard!', 3000);
            showAlert = true;
        }
    }
});
keywordsInput1.addEventListener('click', () => {
    keywordsInput1.select();
});
keywordsInput1.addEventListener('focus', () => {
    keywordsInput1.select();
});
keywordsInput2.addEventListener('click', () => {
    keywordsInput2.select();
});
keywordsInput2.addEventListener('focus', () => {
    keywordsInput2.select();
});
keywordsInput3.addEventListener('click', () => {
    keywordsInput3.select();
});
keywordsInput3.addEventListener('focus', () => {
    keywordsInput3.select();
});
document.getElementsByTagName('div')[0].focus();