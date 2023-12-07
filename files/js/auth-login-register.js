import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, updateProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

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
auth.languageCode = 'nl';
const provider = new GoogleAuthProvider();

// Variabelen
let email;
let password;

// Registreer mail
const RegistreerButtonMail = document.getElementById("registreer-email");
if (RegistreerButtonMail) {
  RegistreerButtonMail.addEventListener("click", function() {
    Registreer();
  });
}

const RegistreerPassword = document.getElementById("registreer-password");
if (RegistreerPassword) {
  RegistreerPassword.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        Registreer();
    }
  });
}

// Login mail
const LoginButtonMail = document.getElementById("login-email");
if (LoginButtonMail) {
  LoginButtonMail.addEventListener("click", function() {
    Login();
  });
}

const LoginPassword = document.getElementById("password");
if (LoginPassword) {
  LoginPassword.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        Login();
    }
  });
}

// Google
const LoginButtonGoogle = document.getElementById("login-google");
if (LoginButtonGoogle) {
  LoginButtonGoogle.addEventListener("click", function() {
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
            window.alert(errorMessage);
        });
  });
}

async function Login() {
  email = document.getElementById("e-mail").value;
  password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (document.referrer.includes('app.thijsvanhal.nl')) {
          window.location.href = document.referrer;
      } else {
          window.location.href = "/";
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      window.alert(errorMessage);
    });
}

async function Registreer() {
  email = document.getElementById("e-mail").value;
  password = document.getElementById("registreer-password").value;
  const naam = document.getElementById("naam").value;
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        updateProfile(auth.currentUser, {
          displayName: naam
        }).then(() => {
          document.querySelector(".registreren").innerHTML = `
          <h1>Welkom ${user.displayName}!</h1>
          <p>Je wordt over enkele seconden doorgestuurd....</p>
          `;
          setTimeout(() => {
            window.location.href = "/";
          }, 4000);
        });
      })
      .catch((error) => {
        const errorMessage = error.message.replace(/Firebase: (.+?) \(.+\)/, '$1');
        window.alert(errorMessage);
      });
}