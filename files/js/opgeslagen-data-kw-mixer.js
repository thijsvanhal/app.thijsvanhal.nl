let mixedKeywordsArray = '';

//Database
const dbName = 'historicDataKM';
const dbVersion = 1;

const openDBRequest = indexedDB.open(dbName, dbVersion);

openDBRequest.onupgradeneeded = function (event) {
    const db = event.target.result;
    
    if (!db.objectStoreNames.contains("historicData")) {
        db.createObjectStore("historicData", { keyPath: "id", autoIncrement: true });
    }
};

// Function to load and display stored data automatically
function loadStoredData() {
    const transaction = openDBRequest.result.transaction(["historicData"], "readonly");
    const store = transaction.objectStore("historicData");

    const getDataRequest = store.getAll();

    getDataRequest.onsuccess = () => {
        const historicData = getDataRequest.result;
        const dataList = document.getElementById("data-list");

        if (getDataRequest.readyState === "done" && historicData.length > 0) {
            dataList.innerHTML = "";

            historicData.reverse();
            historicData.forEach(entry => {
                const listItem = document.createElement("div");
                listItem.innerHTML = `<span>${entry.titel} (${entry.timestamp})</span><br>
                                    <button type="button" class="btn btn-primary view-button" style="width: auto" data-id="${entry.id}">Bekijk</button> 
                                    <button type="button" class="btn btn-primary download-button" style="width: auto" data-id="${entry.id}">Download</button> 
                                    <button type="button" class="btn btn-primary delete-button secondbutton" style="width: auto" data-id="${entry.id}">Verwijder</button>
                                     `;
                dataList.appendChild(listItem);
            });

            const viewButtons = document.querySelectorAll(".view-button");
            const downloadButtons = document.querySelectorAll(".download-button");
            const deleteButtons = document.querySelectorAll(".delete-button");

            viewButtons.forEach(button => {
                button.addEventListener("click", (event) => {
                    const id = Number(event.target.getAttribute("data-id"));
                    viewData(id);
                });
            });

            downloadButtons.forEach(button => {
                button.addEventListener("click", (event) => {
                    const id = Number(event.target.getAttribute("data-id"));
                    downloadData(id);
                });
            });

            deleteButtons.forEach(button => {
                button.addEventListener("click", (event) => {
                    const id = Number(event.target.getAttribute("data-id"));
                    deleteData(id);
                });
            });

            console.log("Data loaded from IndexedDB.");
        } else if (getDataRequest.readyState === "done" && historicData.length === 0) {
            dataList.innerHTML = "<p>Op dit moment heb je nog geen data opgeslagen.</p>";
        }
    };
}
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(loadStoredData, 1500);
});

openDBRequest.onerror = function (event) {
    window.alert("Er is een fout in de database, neem contact op met de developer:", event.target.error);
};

function downloadData(id) {
    const transaction = openDBRequest.result.transaction(["historicData"], "readonly");
    const store = transaction.objectStore("historicData");
    
    const getDataRequest = store.get(id);
    
    getDataRequest.onsuccess = function () {
        const data = getDataRequest.result;
        if (data) {
            mixedKeywordsArray = JSON.parse(data.data);
            generateExcel();
        }
    };
}

function viewData(id) {
    const transaction = openDBRequest.result.transaction(["historicData"], "readonly");
    const store = transaction.objectStore("historicData");
    
    const getDataRequest = store.get(id);
    
    getDataRequest.onsuccess = function () {
        const data = getDataRequest.result;
        if (data) {
            // Parse the JSON data
            const mixedKeywordsArray = JSON.parse(data.data);

            // Create a table to display the data
            const div = document.createElement('div');
            div.className = "table-responsive";
            const table = document.createElement('table');
            table.className = "table table-bordered";
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            // Create table headers
            const headerRow = document.createElement('tr');
            mixedKeywordsArray.forEach((item) => {
                const cell = document.createElement('th');
                cell.textContent = item.line;
                headerRow.appendChild(cell);
            });
            thead.appendChild(headerRow);

            // Create table rows
            const maxMixedKeywords = Math.max(...mixedKeywordsArray.map((item) => item.mixedKeywords.length));
            for (let i = 0; i < maxMixedKeywords; i++) {
                const row = document.createElement('tr');
                mixedKeywordsArray.forEach((item) => {
                    const cell = document.createElement('td');
                    if (i < item.mixedKeywords.length) {
                        cell.textContent = `${item.mixedKeywords[i]} (${item.searchVolume[i] !== undefined ? item.searchVolume[i] : 'N/A'})`;
                    }
                    row.appendChild(cell);
                });
                tbody.appendChild(row);
            }

            table.appendChild(thead);
            table.appendChild(tbody);

            // Get the modal and content elements
            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            const viewDataContent = document.getElementById("view-data-content");

            // Clear the content and append the table
            viewDataContent.innerHTML = '<h2>Bekijk data</h2>';
            viewDataContent.appendChild(table);

            // Show the modal
            viewModal.show();
        }
    };
}

function deleteData(id) {
    const transaction = openDBRequest.result.transaction(["historicData"], "readwrite");
    const store = transaction.objectStore("historicData");
    
    const deleteRequest = store.delete(id);
    
    deleteRequest.onsuccess = function () {
        loadStoredData();
    };
}

async function generateExcel() {
    console.log(mixedKeywordsArray);
    mixedKeywordsArray.forEach(function (keywordObj) {
        const mixedKeywords = keywordObj.mixedKeywords;
        const searchVolume = keywordObj.searchVolume;
    
        if (mixedKeywords.length !== searchVolume.length) {
          const minLength = Math.min(mixedKeywords.length, searchVolume.length);
          keywordObj.mixedKeywords = mixedKeywords.slice(0, minLength);
          keywordObj.searchVolume = searchVolume.slice(0, minLength);
        }
    
        if (keywordObj.searchVolume.length > 0) {
            const combined = keywordObj.searchVolume.map((value, index) => ({
                value,
                index,
                mixedKeyword: keywordObj.mixedKeywords[index],
            }));
            combined.sort((a, b) => b.value - a.value || keywordObj.mixedKeywords.indexOf(a.mixedKeyword) - keywordObj.mixedKeywords.indexOf(b.mixedKeyword));
    
            for (let i = 0; i < keywordObj.mixedKeywords.length; i++) {
                keywordObj.mixedKeywords[i] = combined[i].mixedKeyword;
                keywordObj.searchVolume[i] = combined[i].value;
            }
        }
    });
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);

    const headers = [];
    for (let i = 0; i < mixedKeywordsArray.length; i++) {
        headers.push(mixedKeywordsArray[i].line);
        headers.push("Volume");
        headers.push(null);
    }
    XLSX.utils.sheet_add_aoa(worksheet, [headers], {origin: 'A1'});
  
    const data = [];
    let maxMixedKeywords = 0;
    mixedKeywordsArray.forEach(function (item) {
        if (item.mixedKeywords.length > maxMixedKeywords) {
            maxMixedKeywords = item.mixedKeywords.length;
        }
    });
  
    for (let i = 0; i < maxMixedKeywords; i++) {
        const row = [];
        mixedKeywordsArray.forEach(function (item) {
            row.push(item.mixedKeywords[i]);
            row.push(item.searchVolume[i] !== undefined ? String(item.searchVolume[i]) : null);
            row.push(null);
        });
        data.push(row);
    }

    XLSX.utils.sheet_add_aoa(worksheet, data, {origin: 'A2'});
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bulk-zoekwoordlijsten.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}