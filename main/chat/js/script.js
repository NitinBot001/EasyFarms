        // Firebase Configuration (Replace with your details)
        const firebaseConfig = {
            apiKey: "AIzaSyABy1Q_9PPYQ7iJHQKAjTCjxJMXQnfEANw",
            authDomain: "agrigo-api.firebaseapp.com",
            projectId: "agrigo-api",
            storageBucket: "agrigo-api.appspot.com",
            messagingSenderId: "240442152969",
            appId: "1:240442152969:web:be242afbdb03cadf37c0d8"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();

        // Global Variables
        let currentUser = null;
        let currentConvoId = null;
        let unsubscribeMessages = null;
        let unsubscribeConvos = null;

        // DOM Elements
        const historyPopup = document.getElementById('history-popup');
        const historyList = document.getElementById('history-list');
        const menuDots = document.getElementById('menu-dots');
        const closePopupBtn = document.getElementById('close-popup');
        const userInput = document.getElementById('user-input');
        const chatMessages = document.getElementById('chat-messages');
        const chatTitle = document.querySelector('.chat-title');

        // Firebase Auth State Listener
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                initChatSystem();
            } else {
                window.location.href = '/login';
            }
        });

        // Initialize Chat System
        async function initChatSystem() {
            // Load conversations
            await setupConversationListener();
            
            // Set up new chat button
            document.querySelector('.new-chat').addEventListener('click', () => {
                createNewConversation();
                chatTitle.textContent = "New Chat";
            });

            // Setup real-time messages listener
            setupMessageListener();
        }

        // Conversation Management
        async function setupConversationListener() {
            unsubscribeConvos = db.collection(`users/${currentUser.uid}/conversations`)
                .orderBy('createdAt', 'desc')
                .onSnapshot(snapshot => {
                    const conversations = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt.toDate()
                    }));
                    renderChatHistory(conversations);
                    if(!currentConvoId && conversations.length > 0) {
                        loadConversation(conversations[0].id);
                    }
                });
        }

        async function createNewConversation() {
    const convoRef = db.collection(`users/${currentUser.uid}/conversations`).doc();
    currentConvoId = convoRef.id;
    await convoRef.set({
        title: "New Chat", // Default title
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
            chatMessages.innerHTML = '';
            if(unsubscribeMessages) unsubscribeMessages();
            setupMessageListener();
        }

        async function deleteConversation(convoId) {
            await db.collection(`users/${currentUser.uid}/conversations`).doc(convoId).delete();
        }

        // Message Management
        function setupMessageListener() {
            if(!currentConvoId) return;
            
            unsubscribeMessages = db.collection(`users/${currentUser.uid}/conversations/${currentConvoId}/messages`)
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    chatMessages.innerHTML = '';
                    snapshot.forEach(doc => {
                        const message = doc.data();
                        appendMessage(message.text, message.sender);
                    });
                    scrollToBottom();
                });
        }

        async function saveMessage(text, sender) {
            await db.collection(`users/${currentUser.uid}/conversations/${currentConvoId}/messages`).add({
                text: text,
                sender: sender,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // UI Functions
        function appendMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            
            // Message Content
            const contentDiv = document.createElement('div');
            contentDiv.textContent = text;
            
            // Audio Icon
            const audioIcon = document.createElement('div');
            audioIcon.className = 'audio-icon';
            audioIcon.innerHTML = `<svg ...></svg>`; // Your existing SVG code

            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(audioIcon);
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
        }

        function renderChatHistory(conversations) {
            historyList.innerHTML = '';
            conversations.forEach(convo => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <div class="history-title">${convo.title}</div>
                    <div class="history-menu">
                        <div class="history-dot"></div>
                        <div class="history-dot"></div>
                    </div>
                    <div class="delete-option" id="delete-option-${convo.id}">
                        <button class="delete-button" onclick="deleteConversation('${convo.id}')">Delete</button>
                    </div>
                `;

                item.addEventListener('click', () => {
                    currentConvoId = convo.id;
                    chatTitle.textContent = convo.title;
                    setupMessageListener();
                    hideHistoryPopup();
                });

                historyList.appendChild(item);
            });
        }

        // Event Handlers
        async function sendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    // Create new conversation if none exists
    if (!currentConvoId) {
        await createNewConversation();
    }

    // Save user message
    await saveMessage(messageText, 'user');

    // Check if it's the first message and update title
    const convoRef = db.collection(`users/${currentUser.uid}/conversations`).doc(currentConvoId);
    const convoDoc = await convoRef.get();
    
    if (convoDoc.exists && convoDoc.data().title === "New Chat") {
        // Update title with the first user message
        await convoRef.update({
            title: messageText.substring(0, 50) || "New Chat"
        });
        // Update UI title
        chatTitle.textContent = messageText.substring(0, 50) || "New Chat";
    }

    // Get AI Response from your backend API
    const aiResponse = await getAIResponse(messageText);
    await saveMessage(aiResponse, 'ai');

    // Clear input and scroll to bottom
    userInput.value = '';
    scrollToBottom();
}
        // Simulated AI Response (Replace with actual API call)
        async function getAIResponse(message) {
            // Replace this with your actual API call
            return `This is AI response to: "${message}"`;
        }

                // Helper Functions
                function scrollToBottom() {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function showHistoryPopup() {
            historyPopup.classList.add('active');
        }

        function hideHistoryPopup() {
            historyPopup.classList.remove('active');
        }

        // Event Listeners
        menuDots.addEventListener('click', showHistoryPopup);
        closePopupBtn.addEventListener('click', hideHistoryPopup);
        
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
                e.preventDefault();
            }
        });

        historyPopup.addEventListener('click', (e) => {
            if (e.target === historyPopup) hideHistoryPopup();
        });

        // Audio Icon SVG Template
        const audioIconSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
        `;

        // API Integration
        async function getAIResponse(message) {
            try {
                const response = await fetch('https://be4b-172-183-109-177.ngrok-free.app/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        lang: 'en' // Default language
                    }),
                });

                if (!response.ok) throw new Error('API response error');
                const data = await response.json();
                return data.response;
                
            } catch (error) {
                console.error('API Error:', error);
                return "Sorry, I'm having trouble connecting. Please try again later.";
            }
        }

        // Update appendMessage function with proper SVG
        function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    // Format the text
    const formattedText = formatResponse(text);

    // Add formatted content
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = formattedText;

    // Add audio icon
    const audioIcon = document.createElement('div');
    audioIcon.className = 'audio-icon';
    audioIcon.innerHTML = audioIconSVG;

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(audioIcon);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Helper function to format AI response
function formatResponse(text) {
    // Replace **bold** with <strong>bold</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace \n with <br> for line breaks
    text = text.replace(/\n/g, '<br>');

    // Replace * with <li> for bullet points
    text = text.replace(/\* (.*?)(<br>|$)/g, '<li>$1</li>');

    // Wrap bullet points in <ul>
    if (text.includes('<li>')) {
        text = `<ul>${text}</ul>`;
    }

    // Convert Markdown tables to HTML tables
    text = text.replace(/\|(.*)\|/g, (match) => {
        // Split rows
        const rows = match.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) return match; // Not a valid table

        // Extract headers
        const headers = rows[0]
            .split('|')
            .map(header => header.trim())
            .filter(header => header !== '');
        
        // Extract alignment (if any)
        const alignments = rows[1]
            .split('|')
            .map(align => {
                if (align.includes(':-')) return 'left';
                if (align.includes('-:')) return 'right';
                if (align.includes(':-:')) return 'center';
                return 'left'; // Default alignment
            })
            .filter(align => align !== '');

        // Build table HTML
        let tableHtml = '<table>';
        
        // Add headers
        tableHtml += '<thead><tr>';
        headers.forEach((header, index) => {
            const alignment = alignments[index] || 'left';
            tableHtml += `<th style="text-align: ${alignment}">${header}</th>`;
        });
        tableHtml += '</tr></thead>';

        // Add rows
        tableHtml += '<tbody>';
        for (let i = 2; i < rows.length; i++) {
            const cells = rows[i]
                .split('|')
                .map(cell => cell.trim())
                .filter(cell => cell !== '');
            
            tableHtml += '<tr>';
            cells.forEach((cell, index) => {
                const alignment = alignments[index] || 'left';
                tableHtml += `<td style="text-align: ${alignment}">${cell}</td>`;
            });
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';

        return tableHtml;
    });

    return text;
}

        // Cleanup listeners
        window.addEventListener('beforeunload', () => {
            if(unsubscribeMessages) unsubscribeMessages();
            if(unsubscribeConvos) unsubscribeConvos();
        });