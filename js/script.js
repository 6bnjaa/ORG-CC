// js/script.js

// Inicializar Socket.IO
const socket = io();

// Vue.js
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
        this.loadData();
        this.setupSocketListeners();
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
            this.saveData();

            // Emitir evento para actualizar datos
            socket.emit('updateData', this.accounts);
        },
        updateInitialBalance(account) {
            if (account.newInitialBalance !== null) {
                account.balance += account.newInitialBalance; // Sumar al balance existente
                account.initialBalance += account.newInitialBalance; // Sumar al saldo inicial
                account.newInitialBalance = null;
                this.showMainContent = true;
                this.showInitialBalanceInput = false;
                this.saveData();

                // Emitir evento para actualizar datos
                socket.emit('updateData', this.accounts);
            } else {
                alert('Por favor, ingresa una cantidad válida');
            }
        },
        saveData() {
            localStorage.setItem('accounts', JSON.stringify(this.accounts));
        },
        loadData() {
            const savedAccounts = localStorage.getItem('accounts');
            if (savedAccounts) {
                this.accounts = JSON.parse(savedAccounts);
            }
        },
        setupSocketListeners() {
            // Escuchar evento del servidor para actualizar datos
            socket.on('updateData', (data) => {
                this.accounts = data;  // Actualizar datos locales
            });
        },
        cancelInitialBalanceUpdate() {
            this.showMainContent = true;
            this.showInitialBalanceInput = false;
        }
    }
});
