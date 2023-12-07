document.getElementById('spotifyButton').addEventListener('click', top25clicked);

let accessToken = null;  // Store the access token globally
let refreshAttempt = 0; // Counter for refresh attempts

const clientId = 'cae135cb691048e6baa3b09e67958658';  // Placeholder for your client ID
const redirectUri = 'http://localhost:8080';  // Placeholder for your redirect URI
const scopes = 'user-top-read playlist-modify-public';

async function authenticateWithSpotify() {
    try {
        // Open a new window for user authentication
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}&response_type=code`;
        const authWindow = window.open(authUrl, 'Spotify Authentication', 'width=600,height=600');

        // Wait for the user to complete authentication and Spotify to redirect back
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
    }
}

async function waitForSpotifyRedirect(authWindow) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            try {
                if (authWindow.location.href.startsWith(redirectUri)) {
                    clearInterval(interval);
                    authWindow.close();

                    const url = new URL(authWindow.location.href);
                    const authCode = url.searchParams.get('code');
                    resolve(authCode);
                }
            } catch (error) {
                // Ignore Cross-Origin Security errors
            }
        }, 1000);
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

function isTokenExpired(token) {
    if (!token || !token.timestamp || !token.expires_in) {
        // Token information is incomplete, consider it expired
        return true;
    }

    // Calculate the expiration time based on the timestamp and expires_in values
    const expirationTime = token.timestamp + (token.expires_in * 1000);  // Convert seconds to milliseconds

    // Check if the token is expired
    return Date.now() > expirationTime;
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

        const apiResponse = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: new Headers({
                'Authorization': `Bearer ${token.access_token}`,
            }),
        });

        if (!apiResponse.ok) {
            const errorResponse = await apiResponse.json();
            console.error('Error response from Spotify API:', errorResponse);

            if (apiResponse.status === 401 && refreshAttempt < 3) {
                // Token expired, refresh and try again (up to 3 attempts)
                refreshAttempt++;
                accessToken = null;
                console.log('Token expired, refreshing...');
                return top25clicked();
            }

            throw new Error(`HTTP error! Status: ${apiResponse.status}`);
        }

        // Reset the refresh attempt counter on successful API response
        refreshAttempt = 0;

        const data = await apiResponse.json();
        console.log('API Response:', data);

    } catch (error) {
        console.error('Error during top25clicked:', error);
    }
}
