const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD6UCoYzL1Ke4YHj3wOp0w7_lCCb2D19Ug",
    authDomain: "catalogue-unit.firebaseapp.com",
    projectId: "catalogue-unit",
    storageBucket: "catalogue-unit.firebasestorage.app",
    messagingSenderId: "27443968377",
    appId: "1:27443968377:web:4e7e3b17b75275d7e3d7a8",
    measurementId: "G-G4T9W6VS6H"
};

const FIREBASE_ENABLED = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY';

function isFirebaseConfigured() {
    return FIREBASE_ENABLED && typeof firebase !== 'undefined';
}

function initializeFirebaseApp() {
    if (!isFirebaseConfigured()) {
        console.error('Firebase configuration missing or SDK non chargé.');
        return null;
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    return firebase;
}
