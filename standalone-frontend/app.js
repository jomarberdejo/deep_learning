class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        };

        this.state = false;
        this.messages = [];
        this.display();
    }

    display() {
        const { openButton, chatBox, sendButton } = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox));

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        const inputField = chatBox.querySelector('input');
        inputField.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
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

        fetch('http://127.0.0.1:5000/predict', {
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
            this.updateChatText(chatbox);
        })
        .catch(error => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
            textField.value = '';
        });
    }

    updateChatText(chatbox) {
        
 var html = '';
 this.messages.slice().reverse().forEach(function(item, index) {
     if (item.name === "Sam")
     {
         html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
     }
     else
     {
         html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
     }
   });

 const chatmessage = chatbox.querySelector('.chatbox__messages');
 chatmessage.innerHTML = html;
    }
}

const chatbox = new Chatbox();
