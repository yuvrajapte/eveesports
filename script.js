import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDdW7ibzhb2O2y3XESRY1gNtOJDZGXQvbo",
    authDomain: "eve-esports-login.firebaseapp.com",
    projectId: "eve-esports-login",
    storageBucket: "eve-esports-login.firebasestorage.app",
    messagingSenderId: "886917494008",
    appId: "1:886917494008:web:5486a96b14f253ed6cf70d",
    measurementId: "G-V9PRSS4841"
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let isLoginMode = true;

// --- UI Elements ---
const mainBtn = document.getElementById('mainBtn');
const switchMode = document.getElementById('switch-mode');
const loader = document.getElementById('loader');
const modal = document.getElementById('forgot-modal');

// --- Utility Functions ---

// 1. Toast Notification System
function showToast(msg, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// 2. Clear All Red Error Messages
function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = "");
}

// 3. Redirect to Home
function goToHome() {
    setTimeout(() => {
        window.location.href = "home.html";
    }, 1200);
}

// --- Event Handlers ---

// Toggle between Login and Create Account
switchMode.onclick = () => {
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

// Main Button Logic (Login / Signup)
mainBtn.onclick = async () => {
    clearErrors();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showToast("Please fill all fields", "error");
        return;
    }

    if (isLoginMode) {
        // LOGIN LOGIC
        loader.style.display = 'flex';
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                showToast("Welcome back, Commander!");
                goToHome();
            })
            .catch(err => {
                loader.style.display = 'none';
                document.getElementById('pass-error').innerText = "Invalid Email or Password";
            });
    } else {
        // SIGNUP LOGIC
        const name = document.getElementById('fullname').value;
        const username = document.getElementById('username').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (password !== confirm) {
            document.getElementById('confirm-error').innerText = "Passwords do not match";
            return;
        }

        if (password.length < 6) {
            document.getElementById('pass-error').innerText = "Minimum 6 characters required";
            return;
        }

        loader.style.display = 'flex';
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            // Save extra data to Firestore
            await setDoc(doc(db, "users", res.user.uid), {
                name: name,
                username: username,
                email: email,
                createdAt: new Date()
            });
            showToast("Account created successfully!");
            goToHome();
        } catch (err) {
            loader.style.display = 'none';
            if (err.code === 'auth/email-already-in-use') {
                document.getElementById('email-error').innerText = "Email already registered";
            } else {
                showToast("Registration failed", "error");
            }
        }
    }
};

// Google Sign-In
document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, provider)
        .then(() => {
            showToast("Google Authentication Success!");
            goToHome();
        })
        .catch(() => {
            showToast("Google Login Cancelled", "error");
        });
};

// Forgot Password Modal Logic
document.getElementById('forgot-link').onclick = (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
};

document.getElementById('close-modal').onclick = () => {
    modal.style.display = 'none';
};

document.getElementById('send-reset').onclick = () => {
    const resetEmail = document.getElementById('reset-email').value;
    if (!resetEmail) {
        showToast("Please enter email", "error");
        return;
    }
    
    sendPasswordResetEmail(auth, resetEmail)
        .then(() => {
            showToast("Reset link sent to your email!");
            modal.style.display = 'none';
        })
        .catch((err) => {
            showToast("User not found or error occurred", "error");
        });
};

// Close modal if user clicks outside of it
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
