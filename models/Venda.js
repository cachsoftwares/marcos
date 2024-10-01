const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Venda = new Schema({
    prod_id: {
        type: String,
        required: true
    },
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
    quantidade: {
        type: Number,
        required: true
    },
    preco_venda: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    _data: {
        type: String,
        required: true
    }
})

mongoose.model('vendas', Venda)