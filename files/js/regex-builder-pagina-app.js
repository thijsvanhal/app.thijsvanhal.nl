// JavaScript Pagina's

// Functie GSC 
function generateRegexGSC(values) {
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

// Functie GA
function generateRegexGA(values) {
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

// Functie Length GSC
function getLengthGSC(regexgsc) {
    const string = regexgsc.toString()
    if (document.documentElement.lang === 'nl') {
        return new String(`${string.length} Tekens`);
    } else if(document.documentElement.lang === 'en') {
        return new String(`${string.length} Characters`);
    }
}

// Functie Length GA
function getLengthGA(regexga) {
    const string = regexga.toString()
    if (document.documentElement.lang === 'nl') {
        return new String(`${string.length} Tekens`);
    } else if(document.documentElement.lang === 'en') {
        return new String(`${string.length} Characters`);
    }
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
    if (document.documentElement.lang === 'nl') {
        const DateOutputFirst = new String(`De vorige startdatum is ${previousStartDateString}`);
        const DateOutputSecond = new String(`De vorige einddatum is ${previousEndDateString}`);
        const resultDate = document.getElementById('date-text');
        resultDate.innerHTML = `${DateOutputFirst}\n${DateOutputSecond}`;
    } else if(document.documentElement.lang === 'en') {
        const DateOutputFirst = new String(`The previous start date is ${previousStartDateString}`);
        const DateOutputSecond = new String(`The previous end date is ${previousEndDateString}`);
        const resultDate = document.getElementById('date-text');
        resultDate.innerHTML = `${DateOutputFirst}\n${DateOutputSecond}`;
    }
    window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'datum_gegenereerd'});
}

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
endDateInput.addEventListener("change", getDate);

// Constanten
const button = document.getElementById('generate-button');
const textField = document.getElementById('input-area');
const resultTextareaGSC = document.getElementById('result-gsc');
const resultTextareaGA = document.getElementById('result-ga');
const resultLengthGSC = document.getElementById('tekens-gsc');
const resultLengthGA = document.getElementById('tekens-ga');

// Button click
button.addEventListener('click', () => {
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
});

// Zorg dat output geselecteerd wordt
resultTextareaGSC.addEventListener('click', () => {
    resultTextareaGSC.select();
});

resultTextareaGA.addEventListener('click', () => {
    resultTextareaGA.select();
});