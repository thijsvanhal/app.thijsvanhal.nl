import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

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

const userElement = document.getElementById('user-info');

function updateUserInfo(user) {
    if (user) {
        const { displayName, photoURL } = user;

        const userHTML = `
        <img src="${photoURL}" alt="User Photo" width="30" height="30">
        <span>${displayName}</span>
        `;
        userElement.innerHTML = userHTML;
        document.getElementById('loading-screen').style.display = 'none';
    } else {
        window.location.href = "/login";
    }
}

const LogoutButton = document.getElementById('logout-btn');
LogoutButton.addEventListener("click", function() {
    auth.signOut().then(() => {
        window.location.href = "/login";
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});

function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        updateUserInfo(user);
    });
}

checkAuth();
