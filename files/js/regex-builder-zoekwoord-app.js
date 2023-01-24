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