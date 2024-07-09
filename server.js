// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const dataFilePath = path.join(__dirname, 'data.json'); // Archivo para almacenar los datos

let accounts = loadAccounts(); // Cargar datos al iniciar el servidor

// Función para cargar datos desde el archivo JSON
function loadAccounts() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading accounts:', err.message);
        return [];
    }
}

// Función para guardar datos en el archivo JSON
function saveAccounts(accountsData) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(accountsData, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving accounts:', err.message);
    }
}

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('a user connected');

    // Enviar datos iniciales al cliente que se conecta
    socket.emit('initialData', accounts);

    // Manejar solicitud de datos iniciales desde el cliente
    socket.on('requestInitialData', () => {
        socket.emit('initialData', accounts);
    });

    // Actualizar datos y emitir cambios a todos los clientes conectados
    socket.on('updateData', (data) => {
        accounts = data;
        io.emit('updateData', accounts); // Emitir cambios a todos los clientes
        saveAccounts(accounts); // Guardar cambios en el archivo
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});