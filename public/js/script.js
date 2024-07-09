import Vue from 'vue';
import io from 'socket.io-client'; // Importar socket.io-client

// Establecer conexión con el servidor socket.io
const socket = io();

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
        // Cargar datos almacenados localmente al iniciar la aplicación
        this.loadData();

        // Escuchar el evento 'updateData' del servidor
        socket.on('updateData', (data) => {
            // Actualizar los datos en Vue.js cuando se recibe el evento del servidor
            this.accounts = data;
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

            // Actualizar el balance y registrar la transacción
            account.balance -= account.amount;
            account.transactions.push({ amount: account.amount, description: account.description });

            // Limpiar campos después de la transacción
            account.amount = null;
            account.description = '';

            // Guardar los datos actualizados localmente
            this.saveData();

            // Emitir el evento 'updateData' al servidor
            socket.emit('updateData', this.accounts);
        },
        getTotalTransactions(transactions) {
            // Calcular el total de transacciones
            if (!Array.isArray(transactions)) {
                return 0;
            }
            return transactions.reduce((total, transaction) => total + transaction.amount, 0);
        },
        toggleInitialBalanceInput() {
            // Mostrar el formulario para actualizar el saldo inicial
            this.showMainContent = false;
            this.showInitialBalanceInput = true;
        },
        updateInitialBalance(account) {
            // Actualizar el saldo inicial y balance
            if (account.newInitialBalance !== null) {
                account.balance += account.newInitialBalance; // Sumar al balance existente
                account.initialBalance += account.newInitialBalance; // Sumar al saldo inicial
                account.newInitialBalance = null;

                // Ocultar el formulario y mostrar el contenido principal
                this.showMainContent = true;
                this.showInitialBalanceInput = false;

                // Guardar los datos actualizados localmente
                this.saveData();

                // Emitir el evento 'updateData' al servidor
                socket.emit('updateData', this.accounts);
            } else {
                alert('Por favor, ingresa una cantidad válida');
            }
        },
        saveData() {
            // Guardar datos en el almacenamiento local
            localStorage.setItem('accounts', JSON.stringify(this.accounts));
        },
        loadData() {
            // Cargar datos desde el almacenamiento local al iniciar
            const savedAccounts = localStorage.getItem('accounts');
            if (savedAccounts) {
                this.accounts = JSON.parse(savedAccounts);
            }
        },
        saveToFile() {
            // Guardar datos en un archivo de texto
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
            // Eliminar todos los datos
            if (confirm('¿Estás seguro que deseas borrar todos los datos?')) {
                this.accounts.forEach(account => {
                    account.description = '';
                    account.transactions = [];
                });
                this.saveData();

                // Emitir el evento 'updateData' al servidor
                socket.emit('updateData', this.accounts);
            }
        },
        cancelInitialBalanceUpdate() {
            // Cancelar la actualización del saldo inicial
            this.showMainContent = true;
            this.showInitialBalanceInput = false;
        }
    }
});