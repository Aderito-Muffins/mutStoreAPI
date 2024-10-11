const express = require('express');
const connectDB = require('../database/mongodb');
const User = require('../models/user');
const Feedback = require('../models/feedback');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult, check } = require('express-validator');
const router = express.Router();
const twilio = require('twilio');
require('dotenv').config();

const twilioSID = process.env.TWILIO_SID ;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN ;
const twilioClient = twilio(twilioSID, twilioAuthToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER ; // número de telefone do Twilio


// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'eusoufudido'; // Use uma variável de ambiente para segurança

// Conectar ao banco de dados antes de qualquer rota ser chamada
connectDB();

const generateUniqueIdFeedback = async () => {
    let newId;
    let exists = true;

    while (exists) {
        newId = Math.floor(Math.random() * 1000000); // Gera um número aleatório
        const existingApp = await AppModel.findOne({ id: newId });
        exists = existingApp !== null; // Verifica se já existe
    }

    return newId;
};




// Middleware para verificar o token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).send({ error_code: 1, info: "Ruim", msg: "Token necessário" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send({ error_code: 1, info: "Ruim", msg: "Token inválido" });
        req.user = user;
        next();
    });
};

// Rota de boas-vindas
router.get('/', (req, res) => {
    res.status(200).send({
        error_code: 0,
        info: "Bom",
        msg: "Bem-vindo à API de Serviços Muffins"
    });
});

// Rota de login
router.post('/login', [
    body('username')
        .trim()
        .notEmpty().withMessage('O nome de usuário é obrigatório.')
        .isLength({ min: 3 }).withMessage('O nome de usuário deve ter pelo menos 3 caracteres.'),
    body('password')
        .trim()
        .notEmpty().withMessage('A senha é obrigatória.')
        .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            error_code: 1,
            info: "Ruim",
            msg: "Falha na validação",
            errors: errors.array()
        });
    }

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).send({
                error_code: 0,
                info: "Bom",
                msg: "Login realizado com sucesso",
                token: token
            });
        } else {
            return res.status(400).send({
                error_code: 1,
                info: "Ruim",
                msg: "Credenciais inválidas"
            });
        }
    } catch (error) {
        console.error(error); // Log do erro para depuração
        return res.status(500).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao processar a solicitação",
            error: error.message
        });
    }
});

// Rota de registro
router.post('/register', [
    check('name').notEmpty().withMessage('O nome é obrigatório.'),
    check('email').isEmail().withMessage('O email é inválido.'),
    check('username').notEmpty().withMessage('O nome de usuário é obrigatório.'),
    check('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.'),
    check('mobileNumber')
        .matches(/^\+258[0-9]{9}$/).withMessage('O número de telefone deve ser um número mozambicano no formato +258XXXXXXXXX.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro na validação dos dados",
            errors: errors.array()
        });
    }

    const { name, email, username, password, mobileNumber } = req.body;
    
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send({
                error_code: 1,
                info: "Ruim",
                msg: "Nome de usuário já existe"
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({ name, email, username, password: hashedPassword, mobileNumber });
        const savedUser = await newUser.save();
        return res.status(201).send({
            error_code: 0,
            info: "Bom",
            msg: "Usuário criado com sucesso",
            user: savedUser
        });
    } catch (error) {
        return res.status(400).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao adicionar o usuário",
            error: error.message
        });
    }
});

router.post('/forgot-reset', async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
        return res.status(400).send({
            error_code: 1,
            info: "Ruim",
            msg: "Número de telefone necessário"
        });
    }

    try {
        // Verificar se o usuário existe
        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).send({
                error_code: 1,
                info: "Ruim",
                msg: "Usuário não encontrado"
            });
        }

        // Gerar um código de 6 dígitos aleatório
        const resetCode = Math.floor(100000 + Math.random() * 900000);

        // Salvar o código e sua expiração no banco de dados
        user.resetCode = resetCode;
        user.resetCodeExpiry = Date.now() + 3600000; // Expira em 1 hora
        await user.save();

        // Enviar SMS com o Twilio
        await twilioClient.messages.create({
            body: `Seu código de recuperação de senha é: ${resetCode}`,
            from: twilioPhoneNumber,
            to: mobileNumber
        });

        return res.status(200).send({
            error_code: 0,
            info: "Bom",
            msg: "Código de recuperação enviado por SMS"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao processar a solicitação",
            error: error.message
        });
    }
});

router.post('/verify-code', async (req, res) => {
    const { mobileNumber, resetCode } = req.body;

console.log(resetCode)
console.log(mobileNumber)
    if (!mobileNumber || !resetCode) {
        return res.status(400).send({
            error_code: 1,
            info: "Ruim",
            msg: "Número de telefone e código são obrigatórios"
        });
    }

    try {
        // Verificar se o usuário e o código são válidos
        const user = await User.findOne({ mobileNumber });
        if (!user || user.resetCode !== parseInt(resetCode) || user.resetCodeExpiry < Date.now()) {
            return res.status(400).send({
                error_code: 1,
                info: "Ruim",
                msg: "Código inválido ou expirado"
            });
        }

        return res.status(200).send({
            error_code: 0,
            info: "Bom",
            msg: "Código verificado com sucesso"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao processar a solicitação",
            error: error.message
        });
    }
});

router.post('/comment/app', authenticateToken, async (req, res) => {
    try {
      const { appId, comment } = req.body;
  
      // Gerar um ID único (deve ser numérico se o modelo exige)
      const uniqueID = await generateUniqueIdFeedback(); // Certifique-se de que isso retorna um número
      const email = req.user.email;
  
      // Cria o objeto de feedback
      const makeFeedback = new Feedback({
        uniqueID,   // Use a variável correta
        appId,
        comment,
        email       // Adiciona o email do usuário ao feedback
      });
  
      // Salva o feedback no banco de dados
      await makeFeedback.save();
  
      // Retorna uma resposta de sucesso
      res.json({
        code: 0,
        message: 'Feedback salvo com sucesso!',
        data: makeFeedback
      });
  
    } catch (error) {
      // Tratar erros e retornar uma resposta apropriada
      console.error(error);
      res.status(500).json({
        code: 1,
        message: 'Erro ao salvar o feedback',
        error: error.message
      });
    }
  });
  

router.post('/reset-password', async (req, res) => {
    const { mobileNumber, resetCode, newPassword } = req.body;
    console.log(mobileNumber)
    console.log(resetCode)
    console.log(newPassword)

    if (!mobileNumber || !resetCode || !newPassword) {
        return res.status(400).send({
            error_code: 1,
            info: "Ruim",
            msg: "Todos os campos são obrigatórios"
        });
    }

    try {
        // Verificar se o usuário existe e se o código é válido
        const user = await User.findOne({ mobileNumber });
        if (!user || user.resetCode !== parseInt(resetCode) || user.resetCodeExpiry < Date.now()) {
            return res.status(400).send({
                error_code: 1,
                info: "Ruim",
                msg: "Código inválido ou expirado"
            });
        }

        // Atualizar a senha do usuário
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' }); 
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        user.password = hashedPassword;
        user.resetCode = null; // Limpar o código de recuperação
        user.resetCodeExpiry = null;
        await user.save();

        return res.status(200).send({
            error_code: 0,
            info: "Bom",
            msg: "Senha redefinida com sucesso",
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao processar a solicitação",
            error: error.message
        });
    }
});



// Rota para listar usuário por email
router.get('/list/email', authenticateToken, async (req, res) => {
    const { email } = req.query;
    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(200).send({
                error_code: 0,
                info: "Bom",
                msg: "Usuário encontrado",
                user: user
            });
        } else {
            return res.status(404).send({
                error_code: 1,
                info: "Ruim",
                msg: "Usuário não encontrado"
            });
        }
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao recuperar o usuário",
            error: error.message
        });
    }
});

// Rota para listar todos os usuários
router.get('/list-all', authenticateToken, async (req, res) => {
    try {
        const users = await User.find();
        const listUserData = users.map(user => ({
            id: user._id,
            fullName: user.name,
            username: user.username,
            email: user.email,
            mobileNumber: user.mobileNumber,
            activateStatus: user.activateStatus
        }));
        return res.status(200).send({
            error_code: 0,
            info: "Bom",
            msg: "Usuários listados",
            users: listUserData
        });
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao recuperar usuários",
            error: error.message
        });
    }
});

// Rota para alterar o status do usuário
router.put('/change-status', authenticateToken, async (req, res) => {
    const { email, status } = req.body;
    if (status !== true && status !== false) {
        return res.status(400).send({
            error_code: 1,
            info: "Ruim",
            msg: "Valor de status não suportado"
        });
    }
    try {
        const user = await User.findOne({ email });
        if (user) {
            user.activateStatus = status;
            const updatedUser = await user.save();
            return res.status(200).send({
                error_code: 0,
                info: "Bom",
                msg: "Status atualizado",
                user: updatedUser
            });
        } else {
            return res.status(404).send({
                error_code: 1,
                info: "Ruim",
                msg: "Usuário não encontrado"
            });
        }
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao processar a solicitação",
            error: error.message
        });
    }
});

// Rota para alterar a senha do usuário
router.put('/change-psw', authenticateToken, async (req, res) => {
    const { email, new_pass } = req.body;
    if (!new_pass || new_pass.length < 6) {
        return res.status(400).send({
            error_code: 1,
            info: "Ruim",
            msg: "A nova senha deve ter pelo menos 6 caracteres."
        });
    }

    try {
        const hashedPassword = bcrypt.hashSync(new_pass, 10);
        const user = await User.findOne({ email });
        if (user) {
            user.password = hashedPassword;
            const updatedUser = await user.save();
            return res.status(200).send({
                error_code: 0,
                info: "Bom",
                msg: "Senha atualizada",
                user: updatedUser
            });
        } else {
            return res.status(404).send({
                error_code: 1,
                info: "Ruim",
                msg: "Usuário não encontrado"
            });
        }
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao processar a solicitação",
            error: error.message
        });
    }
});

module.exports = router;
