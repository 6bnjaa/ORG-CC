const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Evento de conexión de socket.io
io.on('connection', (socket) => {
    console.log('a user connected');

    // Manejar la desconexión de un usuario
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // Manejar la actualización de datos desde el cliente
    socket.on('updateData', (data) => {
        // Emitir el evento 'updateData' a todos los clientes, incluido el que lo envió
        io.emit('updateData', data);
    });
});

// Configuración del puerto del servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});