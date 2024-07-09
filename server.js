// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

let accounts = [
    { name: 'Benja', balance: 0, initialBalance: 0, newInitialBalance: null, amount: null, description: '', transactions: [] },
    { name: 'Nacho', balance: 0, initialBalance: 0, newInitialBalance: null, amount: null, description: '', transactions: [] }
];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // Enviar datos iniciales al cliente que se conecta
    socket.emit('initialData', accounts);

    // Manejar solicitud de datos iniciales desde el cliente
    socket.on('requestInitialData', () => {
        socket.emit('initialData', accounts);
    });

    // Actualizar datos y emitir cambios a todos los clientes conectados
    socket.on('updateData', (data) => {
        accounts = data;
        io.emit('updateData', accounts);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
