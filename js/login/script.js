// Initialize Supabase
const SUPABASE_URL = "https://xxzihgrcrgbfckawfkxg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4emloZ3JjcmdiZmNrYXdma3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMzc1OTEsImV4cCI6MjA1NjYxMzU5MX0._Af6Ko0QaNrB_HSPxRJwHa2f7T6e7VkLdFe02434nYc";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is logged in
(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = "index.html";  // Redirect to home if logged in
    }
})();

// Show language selection if not set
document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("default_lang")) {
        document.getElementById("language-selection").style.display = "block";
        document.getElementById("auth-container").style.display = "none";
    } else {
        document.getElementById("language-selection").style.display = "none";
        document.getElementById("auth-container").style.display = "block";
    }
});

// Save selected language
function saveLanguage() {
    const lang = document.getElementById("language").value;
    localStorage.setItem("default_lang", lang);
    document.getElementById("language-selection").style.display = "none";
    document.getElementById("auth-container").style.display = "block";
}

// Login function
async function login() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert(error.message);
    } else {
        window.location.href = "index.html";  // Redirect after login
    }
}

// Signup function
async function signup() {
    let fullname = document.getElementById("signup-fullname").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;
    let confirmPassword = document.getElementById("signup-confirm-password").value;
    let mobile = document.getElementById("signup-mobile").value;

    let village = document.getElementById("signup-village").value;
    let district = document.getElementById("signup-district").value;
    let pincode = document.getElementById("signup-pincode").value;
    let tahseel = document.getElementById("signup-tahseel").value;
    let block = document.getElementById("signup-block").value;
    let state = document.getElementById("signup-state").value;
    let country = document.getElementById("signup-country").value;

    // Check if all fields are filled
    if (!fullname || !email || !password || !confirmPassword || !mobile ||
        !village || !district || !pincode || !tahseel || !block || !state || !country) {
        alert("Please fill in all fields.");
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                fullname,
                mobile,
                address: {
                    village,
                    district,
                    pincode,
                    tahseel,
                    block,
                    state,
                    country
                }
            }
        }
    });

    if (error) {
        alert(error.message);
    } else {
        alert("Signup successful! Please check your email for confirmation.");
        toggleSignup();
    }
}

// Logout function
async function logout() {
    await supabase.auth.signOut();
    window.location.href = "login.html";
}

// Toggle between login and signup forms
function toggleSignup() {
    let authBox = document.getElementById("auth-box");
    let signupBox = document.getElementById("signup-box");

    if (authBox.style.display === "none") {
        authBox.style.display = "block";
        signupBox.style.display = "none";
    } else {
        authBox.style.display = "none";
        signupBox.style.display = "block";
    }
}
