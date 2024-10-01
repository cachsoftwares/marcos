const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Prod = new Schema({
    nome: {
        type: String,
        required: true
    },
    variacao: {
        type: String
    },
    especificidade: {
        type: String
    },
    origem: {
        type: String
    },
    validade: {
        type: String,
        required: true
    },
    estoque: {
        type: Number,
        required: true
    },
    vendidos: {
        type: Number,
        default: 0
    },
    preco_compra: {
        type: Number,
        required: true
    },
    preco_venda: {
        type: Number,
        required: true
    },
    _data: {
        type: Date,
        required: true
    }
})

mongoose.model('prods', Prod)