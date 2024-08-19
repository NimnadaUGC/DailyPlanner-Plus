let tokenClient;
let accessToken = null;

// Ensure the DOM is fully loaded before trying to access elements
document.addEventListener('DOMContentLoaded', function () {
    const authorizeButton = document.getElementById('authorize-button');
    if (authorizeButton) {
        authorizeButton.onclick = handleAuthClick;
    } else {
        console.error("Authorize button not found");
    }

    initGoogleClient();
});

// Initialize the Google API client with Identity Services
function initGoogleClient() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: config.googleClientId,
        scope: config.scopes,
        callback: (tokenResponse) => {
            if (tokenResponse.access_token) {
                accessToken = tokenResponse.access_token;
                document.getElementById('upload-button').disabled = false;
                showAlert('Google Drive authorized. You can now upload your files.');
            } else {
                showAlert('Failed to obtain access token.');
            }
        },
    });
}

// Function to handle user authentication when they click the "Authorize" button
function handleAuthClick() {
    tokenClient.requestAccessToken({ prompt: '' });
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
