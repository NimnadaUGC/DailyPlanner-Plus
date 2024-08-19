const config = {
    googleClientId: '1018812094061-38m6dulsuh381o21qthm3hn6b8kvdemd.apps.googleusercontent.com',
    apiKey: 'AIzaSyCBinf9FwgbkCfLkhbOMdRnRwDHhifku30',
    scopes: 'https://www.googleapis.com/auth/drive.file',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
};

let googleAPIReady = false;

async function onGAPILoad() {
    try {
        google.accounts.id.initialize({ client_id: config.googleClientId, callback: handleCredentialResponse });
        google.accounts.id.prompt();

        await gapi.load('client:auth2');
        await gapi.client.init({
            apiKey: config.apiKey,
            clientId: config.googleClientId,
            discoveryDocs: config.discoveryDocs,
            scope: config.scopes
        });
        console.log('Google API client initialized.');
        googleAPIReady = true;
    } catch (error) {
        console.error('Failed to initialize the Google APIs:', error);
    }
}

function handleCredentialResponse(response) {
    console.log('Credentials received:', response);
}