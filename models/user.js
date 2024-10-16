const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required : true, unique: true},
    username: { type: String, required: true, unique: true },
    password: {type: String, required: true},
    mobileNumber: { type: String, required: true },
    userStatus: { type: Boolean, default: true },
    pagos: { type: [String], default: [] },
    userType: {
        type: String,
        enum: ['admin', 'normal', 'dev'], 
        required: true
      },
    validated:{ type: Number, enum: [0,1,2,3]},
    bi_Url: {type: String, default: ""},
    //0 - aprovado , 1 - Recusado, 2 - Pendente 3 - Nao Pedido
    posted: { type: Date, default: Date.now },
    resetCode: {type: Number },
    resetCodeExpiry: {type: Date  }

})

const User = mongoose.model('User', userSchema)

module.exports = User;