// JavaScript Pagina's

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
        const inputs = values.split('\n').map(input => {
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
        const inputs = values.split('\n').map(input => {
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
function getLengthGSC(regexgsc) {
    const string = regexgsc.toString()
    return new String(`${string.length} Tekens`);
}

// Functie Length GA
function getLengthGA(regexga) {
    const string = regexga.toString()
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

// Constanten
const textField = document.getElementById('input-area');
const resultTextareaGSC = document.getElementById('result-gsc');
const resultTextareaGA = document.getElementById('result-ga');
const resultLengthGSC = document.getElementById('tekens-gsc');
const resultLengthGA = document.getElementById('tekens-ga');
const radioBevat = document.getElementById('bevat');
const radioExact = document.getElementById('exact');

// Button click
function generateRegEx() {
    const values = textField.value;
    const regexgsc = generateRegexGSC(values);
    const regexga = generateRegexGA(values);
    const lengthGSC = getLengthGSC(regexgsc);
    const lengthGA = getLengthGA(regexga);
    resultTextareaGSC.value = regexgsc.toString();
    resultTextareaGA.value = regexga.toString();
    resultLengthGSC.textContent = lengthGSC.toString();
    resultLengthGA.textContent = lengthGA.toString();
    window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'regex_pagina'});
    
}

textField.addEventListener('change', () => {
    generateRegEx();
});

radioBevat.addEventListener('click', () => {
    generateRegEx();
})

radioExact.addEventListener('click', () => {
    generateRegEx();
})

// Zorg dat output geselecteerd wordt
textField.addEventListener('click', () => {
    textField.select();
});

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