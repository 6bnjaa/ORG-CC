const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Conectar a MongoDB Atlas
const uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const AccountSchema = new mongoose.Schema({
    name: String,
    balance: Number,
    initialBalance: Number,
    transactions: [{ amount: Number, description: String }]
});

const Account = mongoose.model('Account', AccountSchema);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('a user connected');

    // Cargar datos desde la base de datos cuando un usuario se conecta
    Account.find({}, (err, accounts) => {
        if (err) {
            console.error(err);
        } else {
            socket.emit('loadData', accounts);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('updateData', (data) => {
        // Actualizar los datos en la base de datos
        data.forEach(account => {
            Account.findOneAndUpdate({ name: account.name }, account, { upsert: true }, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        });

        io.emit('updateData', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
