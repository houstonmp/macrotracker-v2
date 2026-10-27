import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, linkWithCredential, updatePassword } from 'firebase/auth'

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

// Embedded in another page, e.g. a Home Assistant Webpage dashboard. Google's sign-in
// popup can't complete from a sandboxed, cross-site frame, but email/password can.
export const isInFrame = (() => {
    try {
        return window.self !== window.top;
    } catch (error) {
        return true;
    }
})();

export const signInWithGoogle = () => signInWithPopup(auth, provider);

export const createUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);

export const signinUser = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const signOutWithGoogle = async () => {
    auth.signOut();
}

export const hasPasswordSignIn = () =>
    !!auth.currentUser && auth.currentUser.providerData.some(el => el.providerId === 'password');

// Lets a Google account also sign in with its email and a password (same account and data)
export const setAccountPassword = (password) => {
    const user = auth.currentUser;
    if (hasPasswordSignIn()) {
        return updatePassword(user, password);
    }
    return linkWithCredential(user, EmailAuthProvider.credential(user.email, password));
}

const AUTH_MESSAGES = {
    'auth/popup-blocked': 'The Google sign-in window was blocked.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed before finishing.',
    'auth/cancelled-popup-request': 'The Google sign-in window was closed before finishing.',
    'auth/web-storage-unsupported': "This browser is blocking the storage Google sign-in needs here.",
    'auth/operation-not-supported-in-this-environment': "Google sign-in isn't supported here.",
    'auth/unauthorized-domain': "Google sign-in isn't enabled for this address.",
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/invalid-login-credentials': 'Wrong email or password.',
    'auth/wrong-password': 'Wrong email or password.',
    'auth/user-not-found': 'Wrong email or password.',
    'auth/email-already-in-use': 'An account already uses this email.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
    'auth/requires-recent-login': 'For security, sign out and back in, then try again.',
    'auth/network-request-failed': "Couldn't reach the sign-in server. Check your connection.",
};

export const authErrorMessage = (error) =>
    AUTH_MESSAGES[error && error.code] || `Sign-in failed (${(error && error.code) || 'unknown error'}).`;
