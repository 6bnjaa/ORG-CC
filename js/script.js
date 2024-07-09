// index.js

// Importar Socket.IO si no está disponible globalmente
// import io from 'socket.io-client';

new Vue({
    el: '#app',
    data: {
        accounts: [
            { name: 'Benja', balance: 0, initialBalance: 0, newInitialBalance: null, amount: null, description: '', transactions: [] },
            { name: 'Nacho', balance: 0, initialBalance: 0, newInitialBalance: null, amount: null, description: '', transactions: [] }
        ],
        showMainContent: true,
        showInitialBalanceInput: false
    },
    created() {
        // Establecer conexión con el servidor Socket.IO
        const socket = io();
        
        // Escuchar eventos desde el servidor
        socket.on('updateData', (data) => {
            this.accounts = data; // Actualizar datos recibidos desde el servidor
        });

        // Método para emitir eventos al servidor
        this.$socket = socket;

        // Solicitar datos iniciales al servidor cuando se conecte
        this.$socket.emit('requestInitialData');

        // Escuchar datos iniciales desde el servidor
        this.$socket.on('initialData', (data) => {
            this.accounts = data;
            this.saveDataLocally(); // Guardar datos locales al recibir datos iniciales
        });
    },
    methods: {
        subtractBalance(account) {
            if (account.amount <= 0 || account.amount === null) {
                alert('Por favor, ingresa una cantidad válida');
                return;
            }

            if (!account.description) {
                account.description = 'Monto';
            }

            if (account.amount > account.balance) {
                alert('No puedes restar más del saldo disponible');
                return;
            }

            account.balance -= account.amount;
            account.transactions.push({ amount: account.amount, description: account.description });
            account.amount = null;
            account.description = '';
            this.saveData(); // Emitir cambios al servidor
        },
        getTotalTransactions(transactions) {
            if (!Array.isArray(transactions)) {
                return 0;
            }
            return transactions.reduce((total, transaction) => total + transaction.amount, 0);
        },
        toggleInitialBalanceInput() {
            this.showMainContent = false;
            this.showInitialBalanceInput = true;
        },
        updateInitialBalance(account) {
            if (account.newInitialBalance !== null) {
                account.balance += account.newInitialBalance; // Sumar al balance existente
                account.initialBalance += account.newInitialBalance; // Sumar al saldo inicial
                account.newInitialBalance = null;
                this.showMainContent = true;
                this.showInitialBalanceInput = false;
                this.saveData(); // Emitir cambios al servidor
            } else {
                alert('Por favor, ingresa una cantidad válida');
            }
        },
        saveData() {
            this.$socket.emit('updateData', this.accounts); // Emitir datos actualizados al servidor
        },
        saveDataLocally() {
            localStorage.setItem('accounts', JSON.stringify(this.accounts)); // Guardar datos localmente en localStorage
        },
        loadData() {
            const savedAccounts = localStorage.getItem('accounts');
            if (savedAccounts) {
                this.accounts = JSON.parse(savedAccounts);
            }
        },
        saveToFile() {
            let data = '';
            this.accounts.forEach(account => {
                data += `${account.name}:\n`;
                data += `----------------\n`;
                data += `Gastos:\n`;
                account.transactions.forEach(transaction => {
                    data += `   -${transaction.description}: ${transaction.amount}\n`;
                });
                data += `----------------\n`;
                data += `Saldo restante: ${account.balance}\n\n`;
            });

            const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
            saveAs(blob, `gastos_${new Date().toISOString().slice(0, 10)}.txt`);
        },
        deleteAllData() {
            if (confirm('¿Estás seguro que deseas borrar todos los datos?')) {
                this.accounts.forEach(account => {
                    account.description = '';
                    account.transactions = [];
                });
                this.saveData(); // Emitir cambios al servidor
            }
        },
        cancelInitialBalanceUpdate() {
            this.showMainContent = true;
            this.showInitialBalanceInput = false;
        }
    }
});