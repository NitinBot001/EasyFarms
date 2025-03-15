document.getElementById("uploadForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const fileInput = document.getElementById("fileInput");
    const resultDiv = document.getElementById("result");

    if (fileInput.files.length === 0) {
        alert("Please select an image file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        // Show loading message
        resultDiv.innerHTML = "<p>Processing... Please wait.</p>";

        // Send the image to your Heroku app
        const response = await fetch("https://gemini-9e87ca83.nport.link/predict", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to get prediction.");
        }

        // Parse the response as HTML (since your Flask app returns rendered HTML)
        const resultHTML = await response.text();

        // Display the result
        resultDiv.innerHTML = resultHTML;
    } catch (error) {
        console.error("Error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});