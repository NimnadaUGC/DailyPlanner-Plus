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
        showAlert('Failed to initialize Google API client.');
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

// Function to load and initialize the Google API client after DOM content is loaded
document.addEventListener('DOMContentLoaded', loadAndInitGapi);

// Attach the authentication handler to the authorize button
document.getElementById('authorize-button').onclick = handleAuthClick;
