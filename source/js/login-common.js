import { createAuth0Client } from '@auth0/auth0-spa-js';
import { APP_CONFIG } from './app-config';

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const registerBtn = document.getElementById('register-btn');
const profileContainer = document.getElementById('profile');
const navLoggedIn = document.getElementById('nav-logged-in');
const navLoggedOut = document.getElementById('nav-logged-out');
const userDisplayName = document.getElementById('user-display-name');

let auth0Client;

async function getAuth0Config() {
  try {
    const response = await fetch('/auth_config.json'); 
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Failed to load Auth0 config:', error);
    showError('Failed to load necessary configuration.');
    return null; // Return null if fetching fails
  }
}

// Initialize Auth0 client
async function initAuth0Common() {
  if (!APP_CONFIG.USE_LOCAL_AUTH)
  {
    const config = await getAuth0Config();
    if (!config) {
      hideLoading();
      return;
    } 
  }
  try {
    auth0Client = await createAuth0Client({
      domain: APP_CONFIG.USE_LOCAL_AUTH ? import.meta.env.VITE_AUTH0_DOMAIN : config.domain,
      clientId: APP_CONFIG.USE_LOCAL_AUTH ? import.meta.env.VITE_AUTH0_CLIENT_ID : config.clientId,
      cacheLocation: 'localstorage',
      authorizationParams: {
        redirect_uri: APP_CONFIG.USE_LOCAL_AUTH
          ? window.location.origin + "/login/login.html"
          : window.location.origin + "/login/login"
      },
      useRefreshTokens: true,
    });

    await updateHeaderUI();

    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', register);
    }
  } catch (err) {
    showError(err.message);
  }
}

async function updateHeaderUI() {
    try {
        const isAuthenticated = await auth0Client.isAuthenticated();
        console.log(isAuthenticated);
        
        if (isAuthenticated) {
            showLoggedInHeader();
            await displayHeaderProfile();
        } else {
            showLoggedOutHeader();
        }
    } catch (err) {
        console.error("Error updating UI:", err);
    }
}

async function displayHeaderProfile() {
    try {
        const user = await auth0Client.getUser();
        
        if (userDisplayName) {
            userDisplayName.textContent = user.name || user.email || 'Welcome User';
        }

    } catch (err) {
        console.error('Error displaying header profile:', err);
    }
}

function showLoggedInHeader() {
    if (navLoggedOut && navLoggedIn) {
        navLoggedOut.style.display = 'none';
        navLoggedIn.style.display = 'flex';
    }
}

function showLoggedOutHeader() {
    if (navLoggedOut && navLoggedIn) {
        navLoggedOut.style.display = 'flex';
        navLoggedIn.style.display = 'none';
    }
}

async function login() {
  try {
    await auth0Client.loginWithRedirect();
  } catch (err) {
    showError(err.message);
  }
}

async function logout() {
    try {
        await auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin 
            }
        });
    } catch (err) {
        console.error("Error during logout:", err);
    }
}

async function register() {
  try {
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
        redirect_uri: window.location.origin + '/login/login'
      }
    });
  } catch (err) {
    showError(err.message);
  }
}

initAuth0Common();