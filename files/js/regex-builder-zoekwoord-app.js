// Javascript Zoekwoorden

// Functie Bevat
function generateRegexBevat(values) {
    if (values === '') {
        return new String('');
    } else {
        const inputs = values.split('\n');
        const joined = inputs.join('|');
        return new String(`\\b(${joined})\\b`);
    }
  }

// Functie Exact
function generateRegexExact(values) {
    if (values === '') {
        return new String('');
    } else {
        const inputs = values.split('\n');
        const joined = inputs.join('|');
        return new String(`^(${joined})$`);
    }
}

// Functie Length GSC
function getLengthBevat(regexBevat) {
    const string = regexBevat.toString()
    return new String(`${string.length} Tekens`);
}

// Functie Length GA
function getLengthExact(regexExact) {
    const string = regexExact.toString()
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
const resultTextareaBevat = document.getElementById('result-bevat');
const resultTextareaExact = document.getElementById('result-exact');
const resultLengthBevat = document.getElementById('tekens-bevat');
const resultLengthExact = document.getElementById('tekens-exact');

// Button click
textField.addEventListener('input', () => {
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
textField.addEventListener('click', () => {
    textField.select();
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