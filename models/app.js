const { boolean } = require('joi');
const mongoose = require('mongoose');

// Definição do esquema para o modelo de aplicativo
const appSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true, // Corrigido para 'unique' (minúsculo)
    },
    icon: {
        type: String, // URL da imagem armazenada na nuvem do Google
        required: true
    },
    nome: {
        type: String,
        required: true
    },
    developerName: {
        type: String,
        required: true
    },
    appFilePath: {
        type: String,
        required: true
    },
    imagePaths: {
        type: [String], // Array de URLs para as imagens de captura de tela
        required: true
    },
    preco: {
        type: Number, // Preço do aplicativo
        required: true
    },
    description: {
        type: String,
        required: true
    },
    politics: {
        type: String,
        required: true
    },
    payments: {
        isEmola: {type: Boolean, required: true, default: false},
        isMpesa: {type: Boolean, required: true, default: false},
        isBankCard: {type: Boolean, required: true, default: false}
    },
    isApproved: { // Corrigido para 'isApproved' (maiúsculo)
        type: Boolean, // Corrigido para 'Boolean' (maiúsculo)
        required: true,
        default: false
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
const AppModel = mongoose.model('App', appSchema);

module.exports = AppModel;
