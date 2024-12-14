document.addEventListener('DOMContentLoaded', () => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .configureLogging(signalR.LogLevel.Information)
        .build();

    const chatMessages = document.getElementById("chatMessages");
    const userInput = document.getElementById("userInput");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const botSelect = document.getElementById("botSelect");
    function saveMessageToLocalStorage(user, message) {
        let messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        messages.push({
            user: user,
            message: message,
            timestamp: new Date().toISOString()
        });
        if (messages.length > 100) {
            messages = messages.slice(-100);
        }

        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
    function loadMessagesFromLocalStorage() {
        const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        chatMessages.innerHTML = '';

        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.innerHTML = `<strong>${msg.user}:</strong> ${msg.message}`;
            chatMessages.appendChild(messageElement);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    connection.on("ReceiveMessage", (user, message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>${user}:</strong> ${message}`;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        saveMessageToLocalStorage(user, message);
    });

    function loadBotNames() {
        connection.invoke("GetBotNames")
            .then(botNames => {
                botSelect.innerHTML = '<option value="">Оберіть бота</option>';
                botNames.forEach(botName => {
                    const option = document.createElement('option');
                    option.value = botName;
                    option.textContent = botName;
                    botSelect.appendChild(option);
                });
            })
            .catch(err => console.error("Помилка завантаження ботів:", err));
    }

    botSelect.addEventListener('change', (e) => {
        const selectedBot = e.target.value;
        const defaultMessage = `${selectedBot}, привіт!`;

        if (selectedBot) {
            sendMessageWithUser(selectedBot, defaultMessage);
            e.target.value = ''; 
        }
    });
    const clearHistoryButton = document.createElement('button');
    clearHistoryButton.textContent = 'Очистити історію';
    clearHistoryButton.classList.add('clear-history-btn');
    clearHistoryButton.addEventListener('click', () => {
        localStorage.removeItem('chatMessages');
        chatMessages.innerHTML = '';
    });
    document.querySelector('.chat-input').appendChild(clearHistoryButton);
    connection.start()
        .then(() => {
            sendButton.disabled = false;
            loadBotNames(); 
            loadMessagesFromLocalStorage(); 
            console.log("SignalR Connected.");
        })
        .catch(err => {
            console.error(err);
            sendButton.disabled = true;
        });
    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    function sendMessageWithUser(user, message) {
        if (user && message) {
            connection.invoke("SendMessage", user, message)
                .catch(err => console.error(err));

            messageInput.value = '';
        }
    }

    function sendMessage() {
        const user = userInput.value.trim() || 'Анонім';
        const message = messageInput.value.trim();

        sendMessageWithUser(user, message);
    }
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
        userInput.value = savedUsername;
    }
    userInput.addEventListener('change', (e) => {
        localStorage.setItem('chatUsername', e.target.value);
    });
});