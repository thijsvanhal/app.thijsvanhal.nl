import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, query, where, getDocs, collection, getDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCaTODMga4jcKR1Xwo1H7XVhSzyfBwCfRc",
    authDomain: "app-thijsvanhal-nl.firebaseapp.com",
    projectId: "app-thijsvanhal-nl",
    storageBucket: "app-thijsvanhal-nl.appspot.com",
    messagingSenderId: "437337351675",
    appId: "1:437337351675:web:0c273400b65e1f6a7ad75e",
    measurementId: "G-L57H7E26H3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let user;

onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
        user = currentUser;
        loadStoredData();
    } else {
        user = null;
    }
});

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

function parseDate(date) {
    let parts;
    
    if (date.includes(',')) {
        parts = date.split(',');
    } else {
        parts = date.split(' ');
    }
    const dateParts = parts[0].split('-');
    const timeParts = parts[1].split(':');
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], ...timeParts);
}

async function loadStoredData() {
    const dataList = document.getElementById("data-container");
    const q = query(collection(db, dbName), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        dataList.innerHTML = "<p>Op dit moment heb je nog geen data opgeslagen.</p>";
    } else {
        dataList.innerHTML = "";
        const historicData = querySnapshot.docs.map(doc => doc.data());

        historicData.forEach(entry => {
            entry.date = parseDate(entry.timestamp);
        });

        historicData.sort((a, b) => b.date - a.date );

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
                const id = String(event.target.getAttribute("data-id"));
                viewData(id);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                const id = String(event.target.getAttribute("data-id"));
                deleteData(id);
            });
        });
        populateData();
    }
}

async function viewData(id) {
    const docRef = doc(db, dbName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
        const viewDataContent = document.getElementById("view-data-content");

        viewDataContent.innerHTML = data.html;

        viewModal.show();
    }
}

async function deleteData(id) {
    const docRef = doc(db, dbName, id);

    await deleteDoc(docRef);

    loadStoredData();
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

        const viewButtons = document.querySelectorAll(".view-button");
        const deleteButtons = document.querySelectorAll(".delete-button");

        viewButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                const id = String(event.target.getAttribute("data-id"));
                viewData(id);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                const id = String(event.target.getAttribute("data-id"));
                deleteData(id);
            });
        });
    }
}