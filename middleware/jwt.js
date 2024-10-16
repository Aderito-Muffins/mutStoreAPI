const jwt = require('jsonwebtoken'); // Certifique-se de que o jwt está importado
const JWT_SECRET = process.env.JWT_SECRET || 'eusoufudido';
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).send({ 
            error_code: 1, 
            info: "Ruim", 
            msg: "Token necessário" 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ 
                error_code: 1, 
                info: "Ruim", 
                msg: "Token inválido" 
            });
        }
        req.user = user; // Adiciona o usuário ao req para ser usado nas próximas operações
        next(); // Passa para a próxima função se o token for válido
    });
};

module.exports = authenticateToken;