    class Chatbox {
        constructor() {
            this.args = {
                openButton: document.querySelector('.chatbox__button'),
                chatBox: document.querySelector('.chatbox__support'),
                sendButton: document.querySelector('.send__button'),
                speakButton: document.querySelector('.speak__button') 
            };

            this.state = false;
            this.messages = [];
            this.speakEnabled = true; // Flag to enable or disable speaking
            this.display();
            this.synth = window.speechSynthesis;
        }

        display() {
            const { openButton, chatBox, sendButton, speakButton } = this.args;

            openButton.addEventListener('click', () => this.toggleState(chatBox));

            sendButton.addEventListener('click', () => this.onSendButton(chatBox));

            speakButton.addEventListener('click', () => this.toggleSpeak()); 

            const inputField = chatBox.querySelector('input');
            inputField.addEventListener("keyup", ({ key }) => {
                if (key === "Enter") {
                    this.onSendButton(chatBox);
                }
            });
        }

        toggleState(chatbox) {
            this.state = !this.state;

        
            if (this.state) {
                chatbox.classList.add('chatbox--active');
            } else {
                chatbox.classList.remove('chatbox--active');
            }
        }

        onSendButton(chatbox) {
            const textField = chatbox.querySelector('input');
            let text = textField.value.trim();
            if (text === "") {
                return;
            }

            let userMessage = { name: "User", message: text };
            this.messages.push(userMessage);

            fetch('https://deep-learning-bqwr.onrender.com/predict', {
                method: 'POST',
                body: JSON.stringify({ message: text }),
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                let samMessage = { name: "Sam", message: data.answer };
                this.messages.push(samMessage);
                textField.value = '';
                this.updateChatTextWithTypingAnimation(chatbox, samMessage.message); // Call the function for typing animation
                if (this.speakEnabled) {
                    this.speak(samMessage.message); // Speak the response if enabled
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.updateChatText(chatbox);
                textField.value = '';
            });
        }

        toggleSpeak() {
            this.speakEnabled = !this.speakEnabled; 
        }

        updateChatTextWithTypingAnimation(chatbox, message) {
            const typingSpeed = 50;
            let index = 0;

            const typingInterval = setInterval(() => {
                if (index < message.length) {
                    const currentMessage = message.substring(0, index + 1);
                    this.messages[this.messages.length - 1].message = currentMessage; // Update the last message in the array
                    this.updateChatText(chatbox); // Update the chat with the partially typed message
                    index++;
                } else {
                    clearInterval(typingInterval); // Stop the typing animation when the message is fully typed
                }
            }, typingSpeed);
        }

        updateChatText(chatbox) {
            var html = '';
            this.messages.slice().reverse().forEach(function(item, index) {
                if (item.name === "Sam") {
                    html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
                } else {
                    html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
                }
            });

            const chatmessage = chatbox.querySelector('.chatbox__messages');
            chatmessage.innerHTML = html;
        }

        speak(message) {
            const utterance = new SpeechSynthesisUtterance(message);
            this.synth.speak(utterance);
        }
    }

    const chatbox = new Chatbox();


    chatbox.toggleState(document.querySelector('.chatbox__support'))