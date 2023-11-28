import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCaTODMga4jcKR1Xwo1H7XVhSzyfBwCfRc",
    authDomain: "app-thijsvanhal-nl.firebaseapp.com",
    projectId: "app-thijsvanhal-nl",
    storageBucket: "app-thijsvanhal-nl.appspot.com",
    messagingSenderId: "437337351675",
    appId: "1:437337351675:web:0c273400b65e1f6a7ad75e",
    measurementId: "G-L57H7E26H3"
};


// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
// import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// const firebaseConfig = {
//     apiKey: "",
//     authDomain: "app-thijsvanhal-nl.firebaseapp.com",
//     projectId: "app-thijsvanhal-nl",
//     storageBucket: "app-thijsvanhal-nl.appspot.com",
//     messagingSenderId: "",
//     appId: "",
//     measurementId: "G-L57H7E26H3"
// };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'nl';
const provider = new GoogleAuthProvider();

const LoginButton = document.getElementById("login-google");

LoginButton.addEventListener("click", function() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            if (document.referrer.includes('app.thijsvanhal.nl')) {
                window.location.href = document.referrer;
            } else {
                window.location.href = "/";
            }
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
        });
});