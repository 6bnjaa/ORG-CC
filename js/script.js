
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

        // Establecer conexión con el servidor Socket.IO
        const socket = io();
        
        // Escuchar eventos desde el servidor
        socket.on('updateData', (data) => {
            this.accounts = data; // Actualizar datos recibidos desde el servidor
        });

        // Método para emitir eventos al servidor
        this.$socket = socket;
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
                this.saveData();
            } else {
                alert('Por favor, ingresa una cantidad válida');
            }
        },
        saveData() {
            localStorage.setItem('accounts', JSON.stringify(this.accounts));
            this.$socket.emit('updateData', this.accounts); // Enviar datos actualizados al servidor
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
                this.saveData();
            }
        },
        cancelInitialBalanceUpdate() {
            this.showMainContent = true;
            this.showInitialBalanceInput = false;
        }
    }
});