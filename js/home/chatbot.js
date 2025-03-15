// Open Chat Modal
function openChatModal() {
    // Check if language is set
    const defaultLang = localStorage.getItem('default_lang');
    if (!defaultLang) {
        // Show language selection modal
        document.getElementById('langModal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    } else {
        // Open chat modal
        document.getElementById('chatModal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }
}

// Close Chat Modal
function closeChatModal() {
    document.getElementById('chatModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// Set Language
function setLanguage(lang) {
    localStorage.setItem('default_lang', lang);
    document.getElementById('langModal').style.display = 'none';
    openChatModal(); // Open chat modal after language selection
}

// Get Gemini URL from localStorage or fetch a new one
async function getGeminiUrl() {
    let geminiUrl = localStorage.getItem('gemini_url');

    // If URL is not in localStorage or is invalid, fetch a new one
    if (!geminiUrl || geminiUrl.includes('unregistered') || geminiUrl.includes('offline')) {
        try {
            const response = await fetch('https://raw.githubusercontent.com/NitinBot001/Gemini/refs/heads/main/instance.json');
            const data = await response.json();
            geminiUrl = data.tunnel_url + "/chat"; // Assuming the JSON has a "url" field
            console.log('Gemini URL:', geminiUrl);
            localStorage.setItem('gemini_url', geminiUrl); // Save to localStorage
        } catch (error) {
            console.error('Error fetching Gemini URL:', error);
            return null;
        }
    }

    return geminiUrl;
}

// Send Message to AI
async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput) return;

    // Add user's message to chat
    const chatBody = document.getElementById('chatBody');
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.textContent = userInput;
    chatBody.appendChild(userMessage);

    // Clear input
    document.getElementById('userInput').value = '';

    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    // Get Gemini URL
    const geminiUrl = await getGeminiUrl();
    if (!geminiUrl) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-message ai-message';
        errorMessage.textContent = 'Sorry, the AI service is currently unavailable. Please try again later.';
        chatBody.appendChild(errorMessage);
        return;
    }

    // Get default language
    const defaultLang = localStorage.getItem('default_lang') || 'hi'; // Default to Hindi if not set

    // Send request to AI
    try {
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userInput,
                lang: defaultLang, // Use selected language
            }),
        });

        const data = await response.json();

        // Check if the URL is offline
        if (data.response.includes('unregistered') || data.response.includes('offline')) {
            localStorage.removeItem('gemini_url'); // Remove invalid URL
            const errorMessage = document.createElement('div');
            errorMessage.className = 'chat-message ai-message';
            errorMessage.textContent = 'AI service is offline. Fetching a new URL...';
            chatBody.appendChild(errorMessage);

            // Retry with a new URL
            await sendMessage();
            return;
        }

        // Display AI's response
        const aiMessage = document.createElement('div');
        aiMessage.className = 'chat-message ai-message';
        aiMessage.textContent = data.response;
        chatBody.appendChild(aiMessage);

        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-message ai-message';
        localStorage.removeItem('gemini_url'); // Remove invalid URL
        errorMessage.textContent = 'Sorry, something went wrong. Please try again.';
        chatBody.appendChild(errorMessage);
    }
}