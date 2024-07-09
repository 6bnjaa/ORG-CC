const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('updateData', (data) => {
        // Emitir el evento solo a otros clientes
        socket.broadcast.emit('updateData', data);
    });
});

// No es necesario especificar el puerto cuando se despliega en Vercel

server.listen(() => {
    console.log('Server is running');
});