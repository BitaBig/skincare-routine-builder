// Authentication functions
let currentUser = null;

// Check if user is signed in
function checkAuthState() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showApp();
            updateUserDisplay(user);
        } else {
            currentUser = null;
            showSignIn();
        }
    });
}

// Sign up with email and password
async function signUp(email, password) {
    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log('User signed up:', userCredential.user);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('User signed in:', userCredential.user);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign out
function signOut() {
    firebase.auth().signOut().then(() => {
        console.log('User signed out');
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

// Show sign in modal
function showSignIn() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('userInfo').classList.add('hidden');
}

// Show main app
function showApp() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
}

// Update user display
function updateUserDisplay(user) {
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = user.email;
    }
}

// Initialize auth check when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be loaded
    if (typeof firebase !== 'undefined') {
        checkAuthState();
    } else {
        // Retry after a short delay
        setTimeout(checkAuthState, 500);
    }
});

