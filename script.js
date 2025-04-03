const socket = io("https://transparent-numeric-improving-keep.trycloudflare.com");  // Connect to the server
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');

// Slowmode protection variables
let lastMessageTime = 0;
const slowModeDelay = 2000;  // 2 seconds slowmode
const maxMessagesPerMinute = 20; // Limit the number of messages sent per minute
let messageCount = 0;
let messageTimer = null;

// Send message on button click
sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message && canSendMessage()) {
        const sanitizedMessage = sanitizeInput(message);
        if (isMessageAllowed(sanitizedMessage)) {
            socket.emit('sendMessage', sanitizedMessage);
            messageInput.value = '';  // Clear input field
            lastMessageTime = Date.now();  // Update last message time
            messageCount++;
        } else {
            alert("Message contains inappropriate content.");
        }
    }
});

// Function to display a message
function displayMessage(messageData) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <div>${escapeHtml(messageData.msg)}</div>
        <div class="timestamp">${escapeHtml(messageData.timestamp)}</div>
    `;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
}

// Security - Sanitize input to prevent XSS attacks
function sanitizeInput(input) {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
}

// Function to escape HTML entities (for extra safety in display)
function escapeHtml(str) {
    return str.replace(/[&<>"'\/]/g, function(match) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#47;'
        };
        return escapeMap[match];
    });
}

// Slowmode check - prevents spam by ensuring a delay between messages
function canSendMessage() {
    const currentTime = Date.now();
    if (currentTime - lastMessageTime < slowModeDelay) {
        alert('Please wait 2 seconds before sending another message!');
        return false;
    }
    return true;
}

// Rate limiting: prevent excessive messages in a short time
if (!messageTimer) {
    messageTimer = setInterval(() => {
        messageCount = 0;  // Reset message count every minute
    }, 60000);  // 60 seconds
}

function isMessageAllowed(message) {
    // Check message count per minute
    if (messageCount > maxMessagesPerMinute) {
        alert('Too many messages in a short time, please slow down!');
        return false;
    }

    // Add basic filter for inappropriate words (example: block profanities)
    const blockedWords = ["badword1", "badword2", "badword3"];  // Add your list of blocked words here
    for (let word of blockedWords) {
        if (message.toLowerCase().includes(word)) {
            return false;
        }
    }
    
    return true;
}

// Display the connected user count
const connectedUsersElement = document.getElementById('connectedUsers');
socket.on('connectedUsers', (count) => {
    connectedUsersElement.textContent = `Connected Users: ${count}`;
});

socket.on('chat history', (messages) => {
            messages.forEach(displayMessage);
        });

        socket.on('receiveMessage', displayMessage);
