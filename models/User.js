const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema({
    nome: {
        type: String,
        required: true
    },
    ident: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        requierd: true
    },
    mode: {
        type: String,
        default: 'func'
    },
    status: {
        type: String,
        default: 'offline'
    },
    foto: {
        type: String,
        default: 'default.png'
    },
    date: {
        type: String,
        required: true
    },
    _date: {
        type: Date
    }
})

mongoose.model('users', User)