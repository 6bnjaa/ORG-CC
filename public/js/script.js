const socket = io(); // Establecer conexión con el servidor socket.io

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
        socket.on('loadData', (data) => {
            this.accounts = data;
        });

        socket.on('updateData', (data) => {
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

            account.balance -= account.amount;
            account.transactions.push({ amount: account.amount, description: account.description });
            account.amount = null;
            account.description = '';
            socket.emit('updateData', this.accounts); // Emitir el evento 'updateData' al servidor
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
                account.balance += account.newInitialBalance;
                account.initialBalance += account.newInitialBalance;
                account.newInitialBalance = null;
                this.showMainContent = true;
                this.showInitialBalanceInput = false;
                socket.emit('updateData', this.accounts); // Emitir el evento 'updateData' al servidor
            } else {
                alert('Por favor, ingresa una cantidad válida');
            }
        }
    }
});