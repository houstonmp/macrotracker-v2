import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account'
})

export const signInWithGoogle = async () => {
    signInWithPopup(auth, provider).catch(() => { })
}

export const createUser = async (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
        .catch(() => { });
    return response
}
export const signinUser = async (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("You are here:", errorCode, errorMessage)
        });
}

export const signOutWithGoogle = async () => {
    auth.signOut();
}

