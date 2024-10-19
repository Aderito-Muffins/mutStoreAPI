const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    msisdn: { type: String, required: true },
    appId: { type: String, required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    thirdPartyReference: { type: String },
    transactionReference: { type: String, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
