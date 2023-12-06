const outputElement = document.createElement('div');
outputElement.id = 'output';
document.body.appendChild(outputElement);

async function top25clicked() {
    console.log("clicked");

    try {
        const response = await fetch('/run_script');
        const result = await response.json();

        if (result.error) {
            console.error('Error:', result.error);
        } else {
            outputElement.textContent = result.output;
        }
    } catch (error) {
        if (response.status === 404) {
            console.error('Error: Endpoint not found');
        } else if (response.ok) {
            const result = await response.json();
            outputElement.textContent = result.output;
        } else {
            console.error('Error:', response.statusText);
        }

    }
}
