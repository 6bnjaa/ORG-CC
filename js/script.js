new Vue({
    el: '#app',
    data: {
        accounts: [],        // Arreglo de cuentas
        newAccountName: '',  // Nombre de la nueva cuenta
        showMainContent: true,
        showInitialBalanceInput: false,
        showAddAccountDialog: false
    },
    created() {
        // Establecer conexión con el servidor Socket.IO
        const socket = io();

        // Escuchar datos iniciales desde el servidor
        socket.on('initialData', (data) => {
            this.accounts = data;
        });

        // Escuchar actualizaciones de datos desde el servidor
        socket.on('updateData', (data) => {
            this.accounts = data;
        });

        // Solicitar datos iniciales al servidor cuando se conecte
        socket.emit('requestInitialData');
    },
    methods: {
        addAccount() {
            if (!this.newAccountName.trim()) {
                alert('Por favor, ingresa un nombre válido para la cuenta.');
                return;
            }

            // Verificar si ya existe una cuenta con el mismo nombre
            if (this.accounts.some(account => account.name === this.newAccountName)) {
                alert('Ya existe una cuenta con ese nombre.');
                return;
            }

            // Crear nueva cuenta y agregarla al array de cuentas
            const newAccount = {
                name: this.newAccountName,
                balance: 0,
                initialBalance: 0,
                newInitialBalance: null,
                amount: null,
                description: '',
                transactions: []
            };

            this.accounts.push(newAccount);
            this.saveData(); // Emitir cambios al servidor

            // Limpiar el nombre de la nueva cuenta después de agregarla
            this.newAccountName = '';
            this.showAddAccountDialog = false; // Ocultar el diálogo después de agregar
        },
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
        updateInitialBalance(account) {
            if (account.newInitialBalance !== null) {
                account.balance += account.newInitialBalance; // Sumar al balance existente
                account.initialBalance += account.newInitialBalance; // Sumar al saldo inicial
                account.newInitialBalance = null;
                this.saveData(); // Emitir cambios al servidor
            } else {
                alert('Por favor, ingresa una cantidad válida');
            }
        },
        saveData() {
            // Emitir cambios al servidor
            this.$socket.emit('updateData', this.accounts);
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
        cancelInitialBalanceUpdate(account) {
            account.newInitialBalance = null;
            this.showMainContent = true;
            this.showInitialBalanceInput = false;
        },
        toggleInitialBalanceInput() {
            this.showMainContent = false;
            this.showInitialBalanceInput = true;
        },
        cancelAddAccount() {
            this.showAddAccountDialog = false;
            this.newAccountName = '';
        },
        getTotalTransactions(transactions) {
            if (!Array.isArray(transactions)) {
                return 0;
            }
            return transactions.reduce((total, transaction) => total + transaction.amount, 0);
        }
    }
});