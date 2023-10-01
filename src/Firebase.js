// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getDatabase, ref, onValue } from 'firebase/database?
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect, getAdditionalUserInfo } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB8SIHEq_BakFqj7PkhWoeEUVl0S5bGpBg",
    authDomain: "health-app-c5571.firebaseapp.com",
    databaseURL: "https://health-app-c5571-default-rtdb.firebaseio.com",
    projectId: "health-app-c5571",
    storageBucket: "health-app-c5571.appspot.com",
    messagingSenderId: "313805761212",
    appId: "1:313805761212:web:9a983b2e5baab806e9beb9",
    measurementId: "G-C5KJ3V9E0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account'
})

export const signInWithGoogle = async () => {
    signInWithRedirect(auth, provider).then(async () => {

        // const isNewUser = result.additionalUserInfo.isNewUser();
        // const { isNewUser } = getAdditionalUserInfo(result);
        // const isNewUser = auth.getAdditionalUserInfo(result).isNewUser;
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    })
}

export const createUser = async (email, password) => {
    console.log(email, password)
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
}
export const signinUser = async (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
}

export const signOutWithGoogle = async () => {
    auth.signOut();
}

// export const signInWithEmail;
