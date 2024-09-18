// Functie GSC 
function generateRegexGSC(values) {
    if (values === '') {
        return new String('');
    } else {
        function extractBaseUrl(url) {
            let index = url.indexOf('/', 8);
            if (index === -1) {
                index = url.length;
            }
            return url.substring(0, index);
        }
        const domain = extractBaseUrl(values);
        const inputs = values.split('\n').filter(row => row.trim() !== '').map(input => {
            return input.replace(/^.*\/\/[^\/]+/, '');
            });
        const joined = inputs.join('|');
        if (document.getElementById('bevat').checked == true) {
            return new String(`^${domain}(${joined})`);
        } else if(document.getElementById('exact').checked == true) {
            return new String(`^${domain}(${joined})$`);
        }
    }
  }

// Functie GA
function generateRegexGA(values) {
    if (values === '') {
        return new String('');
    } else {
        const inputs = values.split('\n').filter(row => row.trim() !== '').map(input => {
            return input.replace(/^.*\/\/[^\/]+/, '');
            });
        const joined = inputs.join('|');
        if (document.getElementById('bevat').checked == true) {
            return new String(`^(${joined})`);
        } else if(document.getElementById('exact').checked == true) {
            return new String(`^(${joined})$`);
        }
    }
}

// Functie Length GSC
function getLength(value) {
    const string = value.toString()
    return new String(`${string.length} Tekens`);
}

// Functie Date
function getDate() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const timeDiff = endDate - startDate;
    const previousStartDate = new Date(startDate.getTime() - timeDiff - (1000 * 60 * 60 * 24));
    const previousEndDate = new Date(endDate.getTime() - timeDiff - (1000 * 60 * 60 * 24));
    const previousStartDateString = previousStartDate.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const previousEndDateString = previousEndDate.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const DateOutputFirst = new String(`De vorige startdatum is ${previousStartDateString}`);
    const DateOutputSecond = new String(`De vorige einddatum is ${previousEndDateString}`);
    const resultDate = document.getElementById('date-text');
    resultDate.innerHTML = `${DateOutputFirst}\n${DateOutputSecond}`;
    window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'datum_gegenereerd'});
}

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
endDateInput.addEventListener("change", getDate);

// Button click
function generateRegEx() {
    const values = textField.value;
    const regexgsc = generateRegexGSC(values);
    const regexga = generateRegexGA(values);
    const lengthGSC = getLength(regexgsc);
    const lengthGA = getLength(regexga);
    resultTextareaGSC.value = regexgsc.toString();
    resultTextareaGA.value = regexga.toString();
    resultLengthGSC.textContent = lengthGSC.toString();
    resultLengthGA.textContent = lengthGA.toString();
    window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'regex_pagina'});
    
}

// Functie Bevat
function generateRegexBevat(values) {
    if (values === '') {
        return new String('');
    } else {
        const inputs = values.split('\n').filter(row => row.trim() !== '');
        const joined = inputs.join('|');
        return new String(`\\b(${joined})\\b`);
    }
  }

// Functie Exact
function generateRegexExact(values) {
    if (values === '') {
        return new String('');
    } else {
        const inputs = values.split('\n').filter(row => row.trim() !== '');
        const joined = inputs.join('|');
        return new String(`^(${joined})$`);
    }
}

// Constanten
let textField;
let resultTextareaGSC;
let resultTextareaGA;
let resultLengthGSC;
let resultLengthGA;
let radioBevat;
let radioExact;

let resultTextareaBevat;
let resultTextareaExact;
let resultLengthBevat;
let resultLengthExact;

const currentUrl = window.location.href;
if (!currentUrl.includes('zoekwoorden')) {
    textField = document.getElementById('input-area');
    resultTextareaGSC = document.getElementById('result-gsc');
    resultTextareaGA = document.getElementById('result-ga');
    resultLengthGSC = document.getElementById('tekens-gsc');
    resultLengthGA = document.getElementById('tekens-ga');
    radioBevat = document.getElementById('bevat');
    radioExact = document.getElementById('exact');
    
    textField.addEventListener('change', () => {
        generateRegEx();
    });
    
    radioBevat.addEventListener('click', () => {
        generateRegEx();
    })
    
    radioExact.addEventListener('click', () => {
        generateRegEx();
    })

    resultTextareaGSC.addEventListener('click', () => {
        resultTextareaGSC.select();
        document.execCommand("copy");
        const successToast = document.getElementById("success-toast");
        const bootstrapToast = new bootstrap.Toast(successToast);
        bootstrapToast.show();
    });
    
    resultTextareaGA.addEventListener('click', () => {
        resultTextareaGA.select();
        document.execCommand("copy");
        const successToast = document.getElementById("success-toast");
        const bootstrapToast = new bootstrap.Toast(successToast);
        bootstrapToast.show();
    });
} else {
    textField = document.getElementById('input-area');
    resultTextareaBevat = document.getElementById('result-bevat');
    resultTextareaExact = document.getElementById('result-exact');
    resultLengthBevat = document.getElementById('tekens-bevat');
    resultLengthExact = document.getElementById('tekens-exact');

    // Button click
    textField.addEventListener('input', () => {
        const values = textField.value;
        const regexBevat = generateRegexBevat(values);
        const regexExact = generateRegexExact(values);
        const lengthBevat = getLength(regexBevat);
        const lengthExact = getLength(regexExact);
        resultTextareaBevat.value = regexBevat.toString();
        resultTextareaExact.value = regexExact.toString();
        resultLengthBevat.textContent = lengthBevat.toString();
        resultLengthExact.textContent = lengthExact.toString();
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'regex_zoekwoorden'});
    });

    resultTextareaBevat.addEventListener('click', () => {
        resultTextareaBevat.select();
        document.execCommand("copy");
        const successToast = document.getElementById("success-toast");
        const bootstrapToast = new bootstrap.Toast(successToast);
        bootstrapToast.show();
    });

    resultTextareaExact.addEventListener('click', () => {
        resultTextareaExact.select();
        document.execCommand("copy");
        const successToast = document.getElementById("success-toast");
        const bootstrapToast = new bootstrap.Toast(successToast);
        bootstrapToast.show();
    });
}