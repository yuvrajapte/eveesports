import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdW7ibzhb2O2y3XESRY1gNtOJDZGXQvbo",
    authDomain: "eve-esports-login.firebaseapp.com",
    projectId: "eve-esports-login",
    storageBucket: "eve-esports-login.firebasestorage.app",
    messagingSenderId: "886917494008",
    appId: "1:886917494008:web:5486a96b14f253ed6cf70d",
    measurementId: "G-V9PRSS4841"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let isLoginMode = true;

const mainBtn = document.getElementById('mainBtn');
const switchMode = document.getElementById('switch-mode');
const loader = document.getElementById('loader');
const googleBtn = document.getElementById('googleBtn');

function showToast(msg, type = "success") {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = "");
}

function goToHome() {
    setTimeout(() => {
        window.location.href = "home.html";
    }, 1200);
}

switchMode.onclick = (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    document.getElementById('name-wrapper').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('user-wrapper').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('confirm-wrapper').style.display = isLoginMode ? 'none' : 'block';
    
    document.getElementById('form-title').innerText = isLoginMode ? 'Rise With EVE' : 'Join EVE Arena';
    document.getElementById('form-subtitle').innerText = isLoginMode ? 'Enter the arena to dominate' : 'Create your legend today';
    
    mainBtn.innerText = isLoginMode ? 'Login' : 'Sign Up';
    switchMode.innerText = isLoginMode ? 'Create Account' : 'Login Instead';
    clearErrors();
};

mainBtn.onclick = async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showToast("Please fill all fields", "error");
        return;
    }

    loader.style.display = 'flex';

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
            showToast("Welcome back!");
            goToHome();
        } else {
            const name = document.getElementById('fullname').value.trim();
            const username = document.getElementById('username').value.trim();
            const confirm = document.getElementById('confirmPassword').value;

            if (password !== confirm) {
                loader.style.display = 'none';
                document.getElementById('confirm-error').innerText = "Passwords mismatch";
                return;
            }

            const res = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", res.user.uid), {
                name, username, email, createdAt: new Date()
            });
            showToast("Account created!");
            goToHome();
        }
    } catch (err) {
        loader.style.display = 'none';
        showToast("Error: " + err.code, "error");
    }
};

googleBtn.onclick = async (e) => {
    e.preventDefault();
    try {
        await signInWithPopup(auth, provider);
        showToast("Google Login Success!");
        goToHome();
    } catch (err) {
        showToast("Login Cancelled", "error");
    }
};

document.getElementById('send-reset').onclick = async () => {
    const email = document.getElementById('reset-email').value;
    try {
        await sendPasswordResetEmail(auth, email);
        showToast("Reset link sent!");
        document.getElementById('forgot-modal').style.display = 'none';
    } catch (err) {
        showToast("Failed to send link", "error");
    }
};

document.getElementById('forgot-link').onclick = (e) => {
    e.preventDefault();
    document.getElementById('forgot-modal').style.display = 'grid';
};

document.getElementById('close-modal').onclick = () => {
    document.getElementById('forgot-modal').style.display = 'none';
};
