async function authenticateWithSpotify() {
    try {
        // Replace 'YOUR_CLIENT_ID' with your actual client ID
        const clientId = 'cae135cb691048e6baa3b09e67958658';
        const redirectUri = 'http://localhost:8080'; // Adjust this to your actual redirect URI

        // Redirect the user to the Spotify authorization page
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user-top-read%20playlist-modify-public&state=123`;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getTokenFromCode(code) {
    try {
        // Replace 'YOUR_CLIENT_ID' and 'YOUR_CLIENT_SECRET' with your actual values
        const clientId = 'cae135cb691048e6baa3b09e67958658';
        const clientSecret = '76b54e8ba6aa4409bbfcf6cfbe2a29b5';
        const redirectUri = 'http://localhost:8080'; // Adjust this to your actual redirect URI

        // Exchange the authorization code for an access token
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
            }),
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function top25clicked() {
    try {
        // Get the authorization code from the URL (assuming it's a redirect from Spotify)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Exchange the authorization code for an access token
            const accessToken = await getTokenFromCode(code);

            // Use the access token to make requests to the Spotify Web API
            const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=25', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                },
            });

            const data = await response.json();

            // Extract track IDs from the API response
            const trackIds = data.items.map(track => track.id);

            // ... (continue with playlist creation logic using the access token)

            document.getElementById('output').textContent = 'Playlist created successfully!';
        } else {
            // If no code is present, redirect the user to Spotify for authentication
            authenticateWithSpotify();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call top25clicked on page load
top25clicked();
