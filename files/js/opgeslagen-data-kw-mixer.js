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
const dbName = 'historicDataKWM';
let mixedKeywordsArray = '';

// Function to load and display stored data automatically
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
            entry.date = new Date(entry.timestamp);
        });
        
        historicData.sort((a, b) => b.date - a.date);
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
                const id = String(event.target.getAttribute("data-id"));
                viewData(id);
            });
        });

        downloadButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                const id = String(event.target.getAttribute("data-id"));
                downloadData(id);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                const id = String(event.target.getAttribute("data-id"));
                deleteData(id);
            });
        });
    };
}

async function downloadData(id) {
    const docRef = doc(db, dbName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
            mixedKeywordsArray = JSON.parse(data.data);
            generateExcel();
        }
    };
}

async function viewData(id) {
    const docRef = doc(db, dbName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
            const mixedKeywordsArray = JSON.parse(data.data);

            const div = document.createElement('div');
            div.className = "table-responsive";
            const table = document.createElement('table');
            table.className = "table table-bordered";
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            const headerRow = document.createElement('tr');
            mixedKeywordsArray.forEach((item) => {
                const cell = document.createElement('th');
                cell.textContent = item.line;
                headerRow.appendChild(cell);
            });
            thead.appendChild(headerRow);

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

            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            const viewDataContent = document.getElementById("view-data-content");

            viewDataContent.innerHTML = '<h2>Bekijk data</h2>';
            viewDataContent.appendChild(table);

            viewModal.show();
        }
    };
}

async function deleteData(id) {
    const docRef = doc(db, dbName, id);

    await deleteDoc(docRef);

    loadStoredData();
}

async function generateExcel() {
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