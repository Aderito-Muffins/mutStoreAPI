const express = require('express');
const connectDB = require('../database/mongodb');
const User = require('../models/user');
const router = express.Router();

// Conectar ao banco de dados antes de qualquer rota ser chamada
connectDB()

// Rota de boas-vindas
router.get('/', (req, res) => {
    res.status(200).send({
        error_code: 0,
        info: "Good",
        msg: "Welcome to Muffins Services API"
    });
});

// Rota de login
router.post('/login', async (req, res) => {
    const { email, pass } = req.body;
    try {
        const user = await User.findOne({ email, pass });
        if (user) {
            return res.status(200).send({
                error_code: 0,
                info: "Good",
                msg: "Login Successful",
                user: user
            });
        } else {
            return res.status(400).send({
                error_code: 1,
                info: "Bad",
                msg: "Invalid credentials"
            });
        }
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Bad",
            msg: "Error processing request",
            error: error.message
        });
    }
});

// Rota de registro
router.post('/register', async (req, res) => {
    const { fullname, email, username, perfilUrl, pass } = req.body;
    try {
        const newUser = new User({ fullName: fullname, email, username, perfilUrl, pass });
        const savedUser = await newUser.save();
        return res.status(201).send({
            error_code: 0,
            info: "Good",
            msg: "User Added Successfully",
            user: savedUser
        });
    } catch (error) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Error adding user",
            error: error.message
        });
    }
});

// Rota para listar usuário por email
router.get('/list/email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(200).send({
                error_code: 0,
                info: "Good",
                msg: "User Found",
                user: user
            });
        } else {
            return res.status(404).send({
                error_code: 1,
                info: "Bad",
                msg: "User not found"
            });
        }
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Bad",
            msg: "Error retrieving user",
            error: error.message
        });
    }
});

// Rota para listar todos os usuários
router.get('/list-all', async (req, res) => {
    try {
        const users = await User.find();
        const listUserData = users.map(user => ({
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            perfilUrl: user.perfilUrl,
            activateStatus: user.activateStatus,
            posted: user.posted
        }));
        return res.status(200).send({
            error_code: 0,
            info: "Good",
            msg: "Users Listed",
            users: listUserData
        });
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Bad",
            msg: "Error retrieving users",
            error: error.message
        });
    }
});

// Rota para alterar o status do usuário
router.put('/change-status', async (req, res) => {
    const { email, status } = req.body;
    if (status !== true && status !== false) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Unsupported Value of Status"
        });
    }
    try {
        const user = await User.findOne({ email });
        if (user) {
            user.activateStatus = status;
            const updatedUser = await user.save();
            return res.status(200).send({
                error_code: 0,
                info: "Good",
                msg: "Status Updated",
                user: updatedUser
            });
        } else {
            return res.status(404).send({
                error_code: 1,
                info: "Bad",
                msg: "User not found"
            });
        }
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Bad",
            msg: "Error processing request",
            error: error.message
        });
    }
});

// Rota para alterar a senha do usuário
router.put('/change-psw', async (req, res) => {
    const { email, new_pass } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            user.pass = new_pass;
            const updatedUser = await user.save();
            return res.status(200).send({
                error_code: 0,
                info: "Good",
                msg: "Password Updated",
                user: updatedUser
            });
        } else {
            return res.status(404).send({
                error_code: 1,
                info: "Bad",
                msg: "User not found"
            });
        }
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Bad",
            msg: "Error processing request",
            error: error.message
        });
    }
});

module.exports = router;
