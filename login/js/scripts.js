// ✅ Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ Firebase Configuration (Replace with your own)
const firebaseConfig = {
    apiKey: "AIzaSyABy1Q_9PPYQ7iJHQKAjTCjxJMXQnfEANw",
    authDomain: "agrigo-api.firebaseapp.com",
    projectId: "agrigo-api",
    storageBucket: "agrigo-api.appspot.com",
    messagingSenderId: "240442152969",
    appId: "1:240442152969:web:be242afbdb03cadf37c0d8"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



// ✅ Toggle Between Forms
window.toggleForms = function() {
    const signupSection = document.getElementById("signupSection");
    const loginSection = document.getElementById("loginSection");

    if (signupSection.style.display === "none") {
        signupSection.style.display = "block";
        loginSection.style.display = "none";
    } else {
        signupSection.style.display = "none";
        loginSection.style.display = "block";
    }
};

// ✅ Sign Up Function
async function signUpUser(event) {
    event.preventDefault();

    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const fullName = document.getElementById("fullName").value;
    const city = document.getElementById("city").value;
    const district = document.getElementById("district").value;
    const state = document.getElementById("state").value;
    const mobile = document.getElementById("mobile").value;
    const pincode = document.getElementById("pincode").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            email,
            full_name: fullName,
            city,
            district,
            state,
            mobile,
            pincode
        });

        document.getElementById("signupMessage").innerText = "Signup Successful! Please log in.";
        toggleForms();
    } catch (error) {
        document.getElementById("signupMessage").innerText = "Error: " + error.message;
    }
}

// ✅ Login Function
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        document.getElementById("loginMessage").innerText = "Login Successful!";
        window.location.href = "../index.html";
        console.log("User logged in:", userCredential.user);
    } catch (error) {
        document.getElementById("loginMessage").innerText = "Login Failed: " + error.message;
    }
}

// ✅ Forgot Password Function (🔹 Now Defined Globally)
window.forgotPassword = async function() {
    const email = prompt("Enter your registered email:");
    if (email) {
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset link sent to your email.");
        } catch (error) {
            alert("Error: " + error.message);
        }
    }
};


// ✅ Attach Event Listeners
document.getElementById("signupForm").addEventListener("submit", signUpUser);
document.getElementById("loginForm").addEventListener("submit", loginUser);