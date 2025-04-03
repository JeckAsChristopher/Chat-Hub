const socket = io("https://transparent-numeric-improving-keep.trycloudflare.com");  // Connect to the server
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');

// Slowmode protection variables
let lastMessageTime = 0;
const slowModeDelay = 2000;  // 2 seconds slowmode

// Send message on button click
sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message && canSendMessage()) {
        socket.emit('sendMessage', sanitizeInput(message));
        messageInput.value = '';  // Clear input field
        lastMessageTime = Date.now();  // Update last message time
    }
});

// Listen for chat history (messages) from the server
socket.on('chat history', (messages) => {
    messages.forEach((messageData) => {
        displayMessage(messageData);
    });
});

// Listen for new messages from the server
socket.on('receiveMessage', (messageData) => {
    displayMessage(messageData);
});

// Typing indicator event
messageInput.addEventListener('input', () => {
    socket.emit('typing');
});

// Listen for typing status
socket.on('typing', () => {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.textContent = 'Someone is typing...';
});

socket.on('stopTyping', () => {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.textContent = '';
});

// Function to display a message
function displayMessage(messageData) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <div>${messageData.msg}</div>
        <div class="timestamp">${messageData.timestamp}</div>
    `;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
}

// Security - Sanitize input to prevent XSS attacks
function sanitizeInput(input) {
    const element = document.createElement('div');
    if (input) {
        element.innerText = input;
        element.textContent = input;
    }
    return element.innerHTML;
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
