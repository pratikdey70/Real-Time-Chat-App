const path = require('path');
const express = require('express');
const app = express();
const {createServer} = require('http');
const {Server} = require('socket.io');
const { Socket } = require('dgram');
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const PORT = 4444;

app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



// emit: emit se event ko send karte hai 
// on: on se event ko listen karte hangingPunctuation: 

let userMap = {};

io.on("connection", (socket) => {
    // console.log(io);
    // console.log(io.engine.clientsCount);
    // console.log(socket.id);

    console.log('User connected:', socket.id);    

    socket.on('newuserdisplay', async ()=>{

        let sockets = await io.fetchSockets();
        let newUserMap={}
        let clients = [];

        let connectedUsername = userMap[socket.id] || 'Unknown User';

        sockets.forEach(s => {
            if (userMap[s.id]) {
                newUserMap[s.id] = userMap[s.id];
                clients.push({ id: s.id, name: userMap[s.id] });
            }
        });

        socket.broadcast.emit('newuserjoined',{
            message: `${connectedUsername} has joined`,
            clients,
            clientsCount: clients.length,
            username: connectedUsername 
        })

        console.log('New user joined:', connectedUsername, 'Current clients:', clients);
    })

    // console.log("One User tried to connect");
    socket.on('newuser', async ({socketId, name})=>{
        userMap[socketId] = name;

        // method 1 to fecth users data
        let clients = [];
        // io.sockets.sockets.forEach( c=> clients.push(c.id));
        // console.log("Current Clients:" , clients);
        let sockets = await io.fetchSockets();
        sockets.forEach(socket=>{
            // console.log(socket.id);
            if(userMap[socket.id]){
                // console.log(socket.id, userMap[socket.id]);
                clients.push({id:socket.id, name: userMap[socket.id]})
            }
        })
        console.log("Clients to chat with", clients);

        socket.emit('useradded',{
            msg: "User added successfully",
            username: userMap[socket.id],
            clients,
            clientsCount: clients.length
        });

        // method 2 to fecth users data
        socket.broadcast.emit('updatedetails',{
            msg: "New users are added!",
            clients,
            clientsCount: clients.length
        })
    })

    socket.on('newmessage',({message, socketId})=>{
        // console.log(message,socketId);
        let clients = [];
        io.sockets.sockets.forEach( c=> clients.push({
            "name": userMap[c.id],
            "id":c.id,
            clientCount: io.engine.clientsCount
        }));
        console.log("Current clients:", clients);
        io.emit('messagerecieved',{
            message,
            username: userMap[socketId],
            socketId: socket.id,
            clients,
            clientCount: io.engine.clientsCount
        });
    })

    socket.on('disconnect',async ()=>{
        console.log('User disconnected:', socket.id);

        let sockets = await io.fetchSockets();
        let newUserMap={}
        let clients = [];

        let disconnectedUsername = userMap[socket.id] || 'Unknown User';

        sockets.forEach(socket=>{
            if(userMap[socket.id]){
                newUserMap[socket.id] = userMap[socket.id];
                clients.push({id: socket.id,name: userMap[socket.id]});
            }
        })
        userMap = newUserMap;
        io.emit('updateDetailsAll',{
            message: `❗${disconnectedUsername} has left the chat!`,
            clients,
            clientsCount: clients.length,
            username: disconnectedUsername 
        })
    })
});



httpServer.listen(PORT, () => {
    console.log(`http://localhost:` + PORT);
});