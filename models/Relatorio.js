const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Relatorio = new Schema({
    user_ident: {
        type: String,
        required: true
    },
    user_nome: {
        type: String,
        required: true
    },
    user_foto: {
        type: String,
        required: true
    },
    num: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    quantidade: {
        type: Number,
        required: true
    },
    _data: {
        type: String,
        required: true
    }
})

mongoose.model('relatorios', Relatorio)