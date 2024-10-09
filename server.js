const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Configurando o timeout do servidor
server.setTimeout(300000, () => { // 5 minutos
    console.log('Request has timed out.');
});

// Iniciando o servidor
server.listen(port, (err) => {
    if (err) {
        console.error('Error starting the server:', err);
        return;
    }
    console.log(`Server is running on port ${port}`);
});

// Tratamento de erros do servidor
server.on('error', (error) => {
    console.error('Server error:', error);
});
