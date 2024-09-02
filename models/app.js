const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    appName: { type: String, required: true },
    packageName: { type: String, required: true, unique: true },
    category: { type: String, required: true, default: 'other' },
    description: { type: String, required: true },
    logoUrl: { type: String, required: true },
   // slide: { type: [String], required: true, validate: [Limit, '4 Picture needed'] },
    activateStatus: { type: Boolean, default: true },
    version:{type: String, required: true, default: "v1.0.0"},
    price:{type: Number, required: true, default: 0},
    posted: {type: Date,default: Date.now}
})

// function Limit(val){
//     return val.length === 4
// }

const App = mongoose.model('App', appSchema)

module.exports = App;