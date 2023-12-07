document.getElementById('spotifyButton').addEventListener('click', top25clicked);

let accessToken = null;  // Store the access token globally
let refreshAttempt = 0; // Counter for refresh attempts

const clientId = 'cae135cb691048e6baa3b09e67958658';  // Placeholder for your client ID
const redirectUri = 'http://localhost:8080/';  // Replace with your GitHub Pages URL
const scopes = 'user-top-read playlist-modify-public';

async function authenticateWithSpotify() {
    try {
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}&response_type=code`;
        const authWindow = window.open(authUrl, 'Spotify Authentication', 'width=600,height=600');

        try {
            const authCode = await waitForSpotifyRedirect(authWindow);

            // Exchange the authorization code for an access token
            const tokenResponse = await exchangeAuthCodeForToken(authCode);
            if (!tokenResponse || !tokenResponse.access_token) {
                throw new Error('Failed to obtain access token');
            }

            const accessToken = { ...tokenResponse, timestamp: Date.now() };  // Store the access token with timestamp
            return accessToken;
        } catch (error) {
            console.error('Error during authentication:', error);
            return null;
        } finally {
            authWindow.close();
        }
    } catch (error) {
        console.error('Error opening Spotify authentication window:', error);
        return null;
    }
}


async function waitForSpotifyRedirect(authWindow) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            try {
                if (authWindow.closed) {
                    clearInterval(interval);
                    reject(new Error('User closed the authentication window'));
                    return;
                }

                let url;
                try {
                    url = new URL(authWindow.location.href);
                } catch (error) {
                    console.warn('Cross-origin security error. Ignoring.');
                    return;
                }

                if (url.origin === redirectUri && url.searchParams.has('code')) {
                    const code = url.searchParams.get('code');
                    clearInterval(interval);
                    resolve(code);
                }
            } catch (error) {
                console.error('Error during redirect handling:', error);
                clearInterval(interval);
                reject(error);
            }
        }, 1000);

        // Automatically close the popup window after 60 seconds
        setTimeout(() => {
            clearInterval(interval);
            authWindow.close();
            reject(new Error('Timeout: No authentication code received'));
        }, 60000);
    });
}


async function exchangeAuthCodeForToken(authCode) {
    const clientSecret = '76b54e8ba6aa4409bbfcf6cfbe2a29b5';  // Placeholder for your client secret

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=authorization_code&code=${authCode}&redirect_uri=${redirectUri}&client_id=${clientId}&client_secret=${clientSecret}`,
    });

    if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
        return null;
    }

    const data = await response.json();
    return data;
}

async function top25clicked() {
    try {
        console.log('Button clicked');

        const token = await authenticateWithSpotify();
        if (!token) {
            console.error('Access token not available');
            return;
        }

        console.log('Access Token:', token);

        console.log('Making API request');

        // Use the access token for further API requests

    } catch (error) {
        console.error('Error during top25clicked:', error);
    }
}
