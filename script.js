// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Create outputElement and append it to the document body
    const outputElement = document.createElement('div');
    outputElement.id = 'output';
    document.body.appendChild(outputElement);

    // Define the top25clicked function
    async function top25clicked() {
        console.log("clicked");

        try {
            // Fetch data from the server
            const response = await fetch('/run_script');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON response
            const result = await response.json();

            // Update the content of the outputElement
            outputElement.textContent = result.output;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Assign the top25clicked function to the button's onclick event
    const spotifyButton = document.getElementById('spotifyButton');
    if (spotifyButton) {
        spotifyButton.onclick = top25clicked;
    } else {
        console.error('Error: Could not find the Spotify button.');
    }
});
