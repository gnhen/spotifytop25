const spotifyButton = document.getElementById('spotifyButton');
const outputElement = document.createElement('div'); // Create an element to display the output
outputElement.id = 'output'; // Give the element an ID for styling

document.body.appendChild(outputElement); // Append the output element to the body

spotifyButton.addEventListener('click', () => {
    // Execute the Python script using a process manager like `subprocess`
    const { spawn } = require('child_process');
    const pythonProcess = spawn('python', ['spotify.py']);

    // Capture and display the process output
    let outputText = '';
    pythonProcess.stdout.on('data', (data) => {
        outputText += data.toString();
        outputElement.textContent = outputText; // Update the output element with the captured text
    });

    pythonProcess.stderr.on('data', (data) => {
        outputText += data.toString();
        outputElement.textContent = outputText; // Update the output element with the captured text
    });

    pythonProcess.on('exit', (code) => {
        console.log(`Python script exited with code: ${code}`);
    });
});
