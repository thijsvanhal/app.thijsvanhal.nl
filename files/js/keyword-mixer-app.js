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

// Functie voor verwijderen van dubbele zoekwoorden
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

// Ophalen van cookies
function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? decodeURIComponent(cookieValue.pop()) : '';
}

// Maken van lijsten , ophalen van lijsten in cookies and updaten van accordions en standaard lijsten in lists pushen.
let lists = [];
const listsCookie = getCookie("lists");
if (listsCookie) {
    lists = JSON.parse(listsCookie);
    updateAccordion();
}
const accordionItems = document.querySelectorAll(".accordion-item");
accordionItems.forEach((item) => {
  // get the button and list values for the current item
  const button = item.querySelector("button");
  const listValues = item.querySelectorAll(".accordion-body li");

  // extract the name and values from the button and listValues
  const listName = button.innerText.trim();
  const values = [];
  listValues.forEach((li) => {
    values.push(li.innerText.trim());
  });

  // add the name and values to the lists array
  lists.push({ name: listName, values: values });
});

function addList() {
    let listName = document.getElementById("list-name").value;
    let listValues = document.getElementById("list-values").value.split("\n");

    let listExists = lists.some(list => list.name === listName);
    if (listExists) {
        window.alert("Er is al een rijtje met deze naam! Pas de naam aan :)");
        return;
    }

    lists.push({ name: listName, values: listValues });

    updateAccordion();

    // Opslaan van lijsten in cookie
    document.cookie = "lists=" + JSON.stringify(lists);
}

function bulkaddList() {
    const textarea = document.getElementById('bulk-list-values');
    const rows = textarea.value.split('\n');
    const numCols = rows[0].split('\t').length;
    
    for (let col = 0; col < numCols; col++) {

      const listName = rows[0].split('\t')[col];

      const listValues = rows.slice(1).map(row => row.split('\t')[col]);

      const list = { name: listName, values: listValues };

      const listExists = lists.some(list => list.name === listName);

      if (listExists) {
        window.alert("Er is al een rijtje met deze naam! Pas de naam aan :)");
        continue;
      }

      lists.push(list);
    }
    updateAccordion();
    document.cookie = "lists=" + JSON.stringify(lists);
}     

// Verwijderen van alle lijsten
function removeLists() {
    lists = [];

    document.cookie = "lists=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/keyword-mixer; SameSite=Lax;";
    
    const container = document.querySelector("#alle-lijsten");
    const accordions = container.querySelectorAll(".accordion");
    accordions.forEach((accordion) => {
        accordion.remove();
    });
}

// Maken en updaten van alle rijtjes als accordions
function updateAccordion() {
    if (lists.length === 0) {
        return;
    }
    let accordionLists = document.getElementById("alle-lijsten");
    accordionLists.innerHTML = "";

    let rowContainer = document.createElement("div");
    rowContainer.classList.add("row");
    rowContainer.id = "alle-lijsten-row";

    const existingListNames = Array.from(document.querySelectorAll(".accordion-item button")).map((button) => button.innerText.trim());
    const newLists = lists.filter((list) => !existingListNames.includes(list.name));

    for (let i = 0; i < newLists.length; i++) {
        let list = newLists[i];

        let colElement = document.createElement("div");
        colElement.classList.add("col");

        let accordionElement = document.createElement("div");
        accordionElement.classList.add("accordion");
        accordionElement.id = "accordion-list";

        let accordionItem = document.createElement("div");
        accordionItem.classList.add("accordion-item");

        let listHeader = document.createElement("h4");
        listHeader.classList.add("accordion-header");
        listHeader.id = "heading" + (i+1);

        let listHeaderButton = document.createElement("button");
        listHeaderButton.classList.add("accordion-button", "collapsed");
        listHeaderButton.type = "button";
        listHeaderButton.setAttribute("data-bs-toggle", "collapse");
        listHeaderButton.setAttribute("data-bs-target", "#collapse" + (i+1));
        listHeaderButton.setAttribute("aria-expanded", "false");
        listHeaderButton.setAttribute("aria-controls", "collapse" + (i+1));
        listHeaderButton.textContent = list.name;

        listHeader.appendChild(listHeaderButton);

        let listContent = document.createElement("div");
        listContent.classList.add("accordion-collapse", "collapse");
        listContent.id = "collapse" + (i+1);
        listContent.setAttribute("aria-labelledby", "heading" + (i+1));
        listContent.setAttribute("data-bs-parent", "#accordion");

        let listContentBody = document.createElement("div");
        listContentBody.classList.add("accordion-body");
        let listValuesUL = document.createElement("ul");
        listValuesUL.style.listStyle = "none";
        listValuesUL.style.padding = "0";

        for (let j = 0; j < list.values.length; j++) {
            let listValueLI = document.createElement("li");
            listValueLI.style.display = "block";
            listValueLI.textContent = list.values[j];
            listValuesUL.appendChild(listValueLI);
        }

        listContentBody.appendChild(listValuesUL);
        listContent.appendChild(listContentBody);

        accordionItem.appendChild(listHeader);
        accordionItem.appendChild(listContent);
        accordionElement.appendChild(accordionItem);

        colElement.appendChild(accordionElement);
        rowContainer.appendChild(colElement);
    }
    accordionLists.appendChild(rowContainer);
}

// Mixen van bulk lijsten
function mixLists() {
    const inputTextarea = document.getElementById("bulk-input");
    const lines = inputTextarea.value.split("\n");
    const mixedKeywordsArray = [];
  
    lines.forEach(function (line) {
      const values = line.split(",");
      const nonEmptyValues = values.filter((value, index) => [1, 2, 4].includes(index) && value.trim() !== "");
      document.getElementById("optional-list-mix").checked = values[0] === "1";
      document.getElementById("lijst-1").value = getListValues(values[1]);
      document.getElementById("lijst-2").value = getListValues(values[2]);
      document.getElementById("optional-list-2").checked = values[3] === "1";
      document.getElementById("lijst-3").value = getListValues(values[4]);
      document.getElementById("optional-list-3").checked = values[5] === "1";
      updateMixer();
      const mixedKeywords = document.getElementById("result-mixer").value.split("\n");
      mixedKeywordsArray.push({
        line: nonEmptyValues.join(" + "),
        mixedKeywords: mixedKeywords,
      });
    });

    let htmlTable = "<h1>Tabel gegenereerde zoekwoordlijsten</h1><table class='table table-bordered' id='tabel-zoekwoorden'><thead><tr>";
    for (let i = 0; i < mixedKeywordsArray.length; i++) {
      htmlTable += "<th>" + mixedKeywordsArray[i].line + "</th><th>Volume</th><th></th>";
    }
    htmlTable += "</tr></thead><tbody>";
  
    let maxMixedKeywords = 0;
    mixedKeywordsArray.forEach(function (item) {
      if (item.mixedKeywords.length > maxMixedKeywords) {
        maxMixedKeywords = item.mixedKeywords.length;
      }
    });
  
    for (let i = 0; i < maxMixedKeywords; i++) {
      htmlTable += "<tr>";
      mixedKeywordsArray.forEach(function (item) {
        htmlTable += `<td>${item.mixedKeywords[i] ? item.mixedKeywords[i] : ""}</td><td class="volume"></td><td class="volume"></td>`;
      });
      htmlTable += "</tr>";
    }
  
    htmlTable += "</tbody></table>";
  
    document.getElementById("zoekwoorden-tabel").innerHTML = htmlTable;
}       

// Functie voor ophalen van waardes van de lijst op basis van de lijst naam
function getListValues(listName) {
    for (let i = 0; i < lists.length; i++) {
        if (lists[i].name === listName) {
            return lists[i].values.join('\n');
        }
    }
    return '';
}

// Excel download
function generateExcel() {
    const table = document.getElementById('tabel-zoekwoorden');

    const workbook = XLSX.utils.table_to_book(table);

    const buffer = XLSX.write(workbook, { type: 'array' });

    const blob = new Blob([buffer], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bulk-zoekwoordlijsten.xlsx';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
    
