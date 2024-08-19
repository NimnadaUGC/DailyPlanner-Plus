// auth.js

// Ensure the DOM is fully loaded before trying to access elements
document.addEventListener('DOMContentLoaded', function () {
    const authorizeButton = document.getElementById('authorize-button');
    if (authorizeButton) {
        authorizeButton.onclick = handleAuthClick;
    } else {
        console.error("Authorize button not found");
    }

    loadAndInitGapi();
});

// Function to load the Google API client library and initialize it
async function loadAndInitGapi() {
    try {
        // Ensure gapi is loaded before trying to use it
        if (typeof gapi !== 'undefined') {
            await new Promise((resolve) => gapi.load('client:auth2', resolve));
            await gapi.client.init({
                apiKey: config.apiKey,
                clientId: config.googleClientId,
                discoveryDocs: config.discoveryDocs,
                scope: config.scopes
            });
            console.log('Google API client initialized.');
            // Check if the user is already signed in
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance.isSignedIn.get()) {
                document.getElementById('upload-button').disabled = false;
            }
        } else {
            console.error('Google API client library not loaded.');
            showAlert('Google API client library failed to load.');
        }
    } catch (error) {
        console.error('Error during GAPI initialization:', error);
        showAlert(`Failed to initialize Google API client. ${error.message}`);
    }
}

// Function to handle user authentication when they click the "Authorize" button
async function handleAuthClick() {
    try {
        // Ensure gapi.auth2 is properly initialized before use
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
            await authInstance.signIn();
            document.getElementById('upload-button').disabled = false;
            showAlert('Google Drive authorized. You can now upload your files.');
        } else {
            throw new Error('Google Auth Instance not initialized');
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        showAlert('Failed to authorize Google Drive.');
    }
}

// Define the showAlert function
function showAlert(message, callback) {
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
        <p>${message}</p>
        <button id="alert-ok">OK</button>
        <button id="alert-cancel">Cancel</button>
    `;
    document.body.appendChild(alertBox);
    alertBox.style.display = 'block';
    if (document.body.classList.contains('dark-mode')) {
        alertBox.classList.add('dark-mode');
    }
    document.getElementById('alert-ok').onclick = function () {
        alertBox.remove();
        if (callback) callback();
    };
    document.getElementById('alert-cancel').onclick = function () {
        alertBox.remove();
    };
}
