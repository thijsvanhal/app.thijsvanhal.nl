// Javascript Zoekwoorden

// Functie Bevat
function generateRegexBevat(values) {
    const inputs = values.split('\n');
    const joined = inputs.join('|');
    return new String(`\\b(${joined})\\b`);
  }

// Functie Exact
function generateRegexExact(values) {
    const inputs = values.split('\n');
    const joined = inputs.join('|');
    return new String(`^(${joined})$`);
}

// Functie Length GSC
function getLengthBevat(regexBevat) {
    const string = regexBevat.toString()
    if (document.documentElement.lang === 'nl') {
        return new String(`${string.length} Tekens`);
    } else if(document.documentElement.lang === 'en') {
        return new String(`${string.length} Characters`);
    }
}

// Functie Length GA
function getLengthExact(regexExact) {
    const string = regexExact.toString()
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
const resultTextareaBevat = document.getElementById('result-bevat');
const resultTextareaExact = document.getElementById('result-exact');
const resultLengthBevat = document.getElementById('tekens-bevat');
const resultLengthExact = document.getElementById('tekens-exact');

// Button click
button.addEventListener('click', () => {
    const values = textField.value;
    const regexBevat = generateRegexBevat(values);
    const regexExact = generateRegexExact(values);
    const lengthBevat = getLengthBevat(regexBevat);
    const lengthExact = getLengthExact(regexExact);
    resultTextareaBevat.value = regexBevat.toString();
    resultTextareaExact.value = regexExact.toString();
    resultLengthBevat.textContent = lengthBevat.toString();
    resultLengthExact.textContent = lengthExact.toString();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({'event': 'regex_zoekwoorden'});
});

// Zorg dat output geselecteerd wordt
resultTextareaBevat.addEventListener('click', () => {
    resultTextareaBevat.select();
});

resultTextareaExact.addEventListener('click', () => {
    resultTextareaExact.select();
});