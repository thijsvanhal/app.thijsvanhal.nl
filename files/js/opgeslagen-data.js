//Database
const currentUrl = window.location.href;
let dbName = '';
let data = [];

if (currentUrl.includes('serp-differences-checker')) {
    dbName = "historicDataSDC";
} 
else if (currentUrl.includes('content-document-helper')) {
    dbName = "historicDataCDH";
} 
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
        const dataList = document.getElementById("data-container");

        if (getDataRequest.readyState === "done" && historicData.length > 0) {
            dataList.innerHTML = "";

            historicData.reverse();
            historicData.forEach(entry => {
                const listItem = document.createElement("div");
                listItem.innerHTML = `<h3>${entry.titel}</h3>
                                    <p>Gemaakt op: ${entry.timestamp}</p>
                                    <button type="button" class="btn btn-primary view-button" style="width: auto" data-id="${entry.id}">Bekijk</button> 
                                    <button type="button" class="btn btn-primary delete-button secondbutton" style="width: auto" data-id="${entry.id}">Verwijder</button>
                                    <hr>
                                     `;
                dataList.appendChild(listItem);
            });

            const viewButtons = document.querySelectorAll(".view-button");
            const deleteButtons = document.querySelectorAll(".delete-button");

            viewButtons.forEach(button => {
                button.addEventListener("click", (event) => {
                    const id = Number(event.target.getAttribute("data-id"));
                    viewData(id);
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
    setTimeout(populateData, 2500);
});

openDBRequest.onerror = function (event) {
    window.alert("Er is een fout in de database, neem contact op met de developer:", event.target.error);
};

function viewData(id) {
    const transaction = openDBRequest.result.transaction(["historicData"], "readonly");
    const store = transaction.objectStore("historicData");
    
    const getDataRequest = store.get(id);
    
    getDataRequest.onsuccess = function () {
        const data = getDataRequest.result;
        if (data) {
            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            const viewDataContent = document.getElementById("view-data-content");
            
            viewDataContent.innerHTML = data.html;

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

function populateData() {
    const dataContainer = document.getElementById('data-container');
    const items = dataContainer.querySelectorAll('div');

    items.forEach(item => {
        const name = item.querySelector('h3').textContent;
        const date = item.querySelector('p').textContent.replace('Gemaakt op: ', '');
        const id = item.querySelector('.view-button').getAttribute('data-id');
        
        data.push({
            name: name,
            date: date,
            id: id
        });
    });
    searchInput.removeAttribute("disabled");
}

const searchInput = document.getElementById('search');
searchInput.addEventListener('input', applyFilters);

function applyFilters() {
    const searchValue = searchInput.value.toLowerCase();

    const filteredData = data.filter(item => {
        const name_filtered = item.name.replace('Overzicht: ', '');
        if ((name_filtered.toLowerCase().includes(searchValue))) {
            return true;
        }
        return false;
    });

    displayData(filteredData);
}

function displayData(data) {
    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = '';
    
    if (data.length === 0 && searchInput.value != '') {
        dataContainer.innerHTML = '<p>Helaas! Met die zoekopdracht kunnen we helaas niks vinden in de opgeslagen data.</p>';
    } else {
        data.forEach(item => {
            const div = document.createElement('div');
            div.innerHTML = `
                <h3>${item.name}</h3>
                <p>Gemaakt op: ${item.date}</p>
                <button type="button" class="btn btn-primary view-button" style="width: auto" data-id="${item.id}">Bekijk</button> 
                <button type="button" class="btn btn-primary delete-button secondbutton" style="width: auto" data-id="${item.id}">Verwijder</button>
                <hr>
            `;
    
            dataContainer.appendChild(div);
        });
    }
}