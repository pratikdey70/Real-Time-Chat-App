let socket = io();
let login = document.querySelector('.login');
let chatApplication = document.querySelector('.chat-application');

document.querySelector('.login-btn').addEventListener('click',(ev)=>{
    let username = document.querySelector('.username').value;
    console.log(username)
    if(username.length>0){
        socket.emit('newuser',{
            socketId: socket.id,
            name: username
        })
    }
    else{
        alert('Please enter correct username');
    }
})

socket.on('newuserjoined',({msg})=>{
    console.log(msg);
})

socket.on('updatedetails', ({ msg, username, clients, clientsCount }) => {
    if (clientsCount)
        document.querySelector('.active-users').innerText = clientsCount;
    let allUsers = document.querySelector('.all-users-status');
    allUsers.innerText = '';
    clients.forEach(c => {
        if (c.id != socket.id) {
            let li = document.createElement('li');
            li.innerText = c.name;
            allUsers.appendChild(li);
        }
    });

})

socket.on('useradded',({msg,username,clients, clientsCount})=>{
    console.log(clients);
    document.querySelector('.active-users').innerText = clientsCount;
    login.style.display = 'none';
    chatApplication.style.display = 'block';
    document.querySelector('.current-user').innerText = username;
})

document.querySelector('.send-button').addEventListener('click',()=>{
    let messageInput = document.querySelector('.message-input');
    let message = messageInput.value
    if(message.length > 0){
        messageInput.value = '';
        socket.emit('newmessage',{
            message: message,
            socketId: socket.id
        })
    }
}) 

socket.on('messagerecieved', ({ message, socketId, username, clients, clientCount }) => {
    let chats = document.querySelector('.chats');
    let chat = document.createElement('div');
    document.querySelector('.active-users').innerText = clientCount;

    chat.classList.add('chat');
    // console.log(clients, clientCount);
    console.log(username);
    // chat.innerHTML = `<div class="chat-message">${message}</div>`;
    let chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message');

    if (socketId === socket.id) {
        chatMessage.innerText = `${message}`;
        chatMessage.classList.add('my-chat');
    } else {
        let senderName = clients.find(client => client.id === socketId)?.name || 'Unknown';
        chatMessage.innerText = `${senderName} : ${message}`; // Display sender's name
        chatMessage.classList.add('another-chat');
    }
    chat.appendChild(chatMessage);
    chats.appendChild(chat);
})


socket.on('updateDetailsAll', ({ message, socketId, username, clients, clientsCount }) => {
    // console.log(clients);
    // console.log(clientsCount);
    console.log(username);
    let notify = document.createElement('div');
    notify.classList.add('chat-message');

    if (clientsCount)
        document.querySelector('.active-users').innerText = clientsCount;

    let chats = document.querySelector('.chats');
    let chat = document.createElement('div');
    chat.classList.add('notify');

    let chatNotify = document.createElement('div');
    chatNotify.classList.add('chat-message','notification');
    chatNotify.innerText = message;  // This message already includes the username of the user who left

    chatNotify.style.textAlign = 'center';
    chat.appendChild(chatNotify);
    chats.appendChild(chat);



    let allUsers = document.querySelector('.all-users-status');
    allUsers.innerText = '';
    clients.forEach(c => {
        if (c.id != socket.id) {
            let li = document.createElement('li');
            li.innerText = c.name;
            allUsers.appendChild(li);
        }
    });
})