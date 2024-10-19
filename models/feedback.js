const { boolean } = require('joi');
const mongoose = require('mongoose');

// Definição do esquema para o modelo de aplicativo
const appSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true, // Corrigido para 'unique' (minúsculo)
    },
    appId: {

        type: Number,
        required: true,
    },

    username: { type: String, required: true },

    comment: {
        type: String,
        required: true
    },
    createdAt: { // Data de criação do aplicativo
        type: Date,
        default: Date.now // Define a data atual por padrão
    },
    updatedAt: { // Data da última atualização do aplicativo
        type: Date,
        default: Date.now // Define a data atual por padrão
    }
});

// Middleware para atualizar a data 'updatedAt' antes de salvar
appSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Criação do modelo a partir do esquema
const Feedback = mongoose.model('Feedback', appSchema);

module.exports = Feedback;
