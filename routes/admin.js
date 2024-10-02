const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')

/* Conf. da Rota */
const router = express.Router()

/* Importando Arquivos */
require('../models/User')
require('../models/Prod')
require('../models/Relatorio')

const db = require('../config/db')
const User = mongoose.model('users')
const Prod = mongoose.model('prods')
const Relatorio = mongoose.model('relatorios')
const { isAdmin } = require('../helpers/funcs')

function globalDate(how) {
    var day = new Date().getDate()
    if (Number(day) < 10) { day = '0' + day }
    var dayS = new Date().getDay().toString().replace('0', 'Dom').replace('1', 'Seg').replace('2', 'Ter').replace('3', 'Qua').replace('4', 'Qui').replace('5', 'Sex').replace('6', 'Sáb')
    var _month = new Date().getMonth()
    var month = Number(_month + 1)
    var monthS = month.toString().replace('12', 'Dez').replace('11', 'Nov').replace('10', 'Out').replace('9', 'Set').replace('8', 'Ago').replace('7', 'Jul').replace('6', 'Jun').replace('5', 'Mai').replace('4', 'Abr').replace('3', 'Mar').replace('2', 'Fev').replace('1', 'Jan')
    var year = new Date().getFullYear()
    var hour = new Date().getHours()
    var minute = new Date().getMinutes()
    var seconds = new Date().getSeconds()
    var milliseconds = new Date().getMilliseconds()

    if (how == 'hour') {
        var global_date = hour + ':' + minute + ':' + seconds + ':' + milliseconds
    } else if (how == 'vsmall') {
        var global_date = day + ' · ' + month + ' · ' + year
    } else if (how == 'small') {
        var global_date = day + ' · ' + month + ' · ' + year + ' | ' + hour
    } else if (how == 'medium') {
        var global_date = dayS + ' · ' + day + ' · ' + monthS + ' · ' + year + ' | ' + hour + 'h'
    } else if (how == 'large') {
        var global_date = dayS + ' · ' + day + ' · ' + monthS + ' · ' + year + ' | ' + hour + ':' + minute
    } else if (how == 'ident') {
        var global_date = `${hour}${minute}${seconds}${milliseconds}`
    }

    return global_date
}

router.get('/user/cadastro', isAdmin, (req, res) => {
    res.render('admin/user_cad', { admin: 'admin' })
})

router.post('/user/cadastro', isAdmin, (req, res) => {

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null) {
        erros.push({ texto: 'Nome Inválido' })
    } if (req.body.nome.length < 2) {
        erros.push({ texto: 'Nome muito Curto' })
    } if (req.body.nome.length > 30) {
        erros.push({ texto: 'Nome muito Longo! Máximo 30' })
    }

    if (!req.body.ident || typeof req.body.ident == undefined || typeof req.body.ident == null) {
        erros.push({ texto: 'UserName | Telefone | Email Inválido' })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || typeof req.body.senha == null) {
        erros.push({ texto: 'Senha Inválida' })
    } if (req.body.senha.length < 6) {
        erros.push({ texto: 'Senha muito Curta! Mínimo 6' })
    }

    if (erros.length > 0) {
        res.render('admin/user_cad', { erros: erros })
    } else {
        User.findOne({ ident: req.body.ident }).then((user) => {
            if (user) {
                req.flash('error_msg', 'Este Telefone já Existe. Use Outro')
                res.redirect('/admin/user/cadastro')
            } else {

                User.findOne({ ident: req.body.ident }).then((user) => {
                    if (user) {
                        req.flash('error_msg', 'Este Telefone já Existe. Use Outro')
                        res.redirect('/admin/user/cadastro')
                    } else {
                        const user_cad = {
                            nome: req.body.nome,
                            ident: req.body.ident,
                            senha: req.body.senha,
                            date: globalDate('large'),
                            _date: Date.now()
                        }

                        new User(user_cad).save().then(() => {
                            req.flash('success_msg', 'Funcionário Cadastrado')
                            res.redirect('/admin/users')
                        }).catch((err) => {
                            console.log('Houve um Erro - ' + err)
                            req.flash('error_msg', 'Houve um Erro')
                            res.redirect('/admin/user/cadastro')
                        })
                    }
                }).catch((err) => {
                    console.log('Houve um Erro - ' + err)
                    req.flash('error_msg', 'Houve um Erro')
                    res.redirect('/admin/user/cadastro')
                })
            }
        }).catch((err) => {
            console.log('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/admin/user/cadastro')
        })
    }
})

router.get('/users', isAdmin, (req, res) => {
    User.find({ mode: 'admin' }).sort({ date: 'asc' }).lean().then((admins) => {
        User.find({ mode: 'admin' }).countDocuments().lean().then((admins_count) => {
            User.find({ mode: 'func' }).sort({ date: 'desc' }).lean().then((users) => {
                User.find({ mode: 'func' }).countDocuments().lean().then((users_count) => {
                    User.find({ mode: 'func', status: 'online' }).countDocuments().lean().then((users_online_count) => {
                        res.render('admin/users', { admin: 'admin', users: users, users_count: users_count, admins: admins, admins_count: admins_count, users_online_count: users_online_count })
                    }).catch((err) => {
                        console.error('Houve um Erro - ' + err)
                        req.flash('error_msg', 'Houve um Erro')
                        res.redirect('/user/perfil')
                    })
                }).catch((err) => {
                    console.error('Houve um Erro - ' + err)
                    req.flash('error_msg', 'Houve um Erro')
                    res.redirect('/user/perfil')
                })
            }).catch((err) => {
                console.error('Houve um Erro - ' + err)
                req.flash('error_msg', 'Houve um Erro')
                res.redirect('/user/perfil')
            })
        }).catch((err) => {
            console.error('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/user/perfil')
        })
    }).catch((err) => {
        console.error('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/user/perfil')
    })
})

router.post('/user/delete/:ident', isAdmin, (req, res) => {
    User.deleteOne({ ident: req.params.ident }).then(() => {
        req.flash('success_msg', 'Usário Deletado')
        res.redirect('/admin/users')
    }).catch((err) => {
        console.error('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/admin/users')
    })
})

router.post('/cadastro/admin/:ident', isAdmin, (req, res) => {
    User.findOne({ ident: req.params.ident }).then((user) => {
        user.mode = 'admin'

        user.save().then(() => {
            req.flash('success_msg', 'Privilégios de Admin Adicionados')
            res.redirect('/admin/users')
        }).catch((err) => {
            console.error('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/admin/users')
        })
    }).catch((err) => {
        console.error('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/admin/users')
    })
})

router.post('/delete/admin/:ident', isAdmin, (req, res) => {
    if (req.params.ident == 'admin_exclusivo_ident') {
        console.log('Tentativa de Remover Admin Exclusivo!!!')
        console.log(req.user)
        res.redirect('/')
    } else {
        User.findOne({ ident: req.params.ident }).then((user) => {
            user.mode = 'func'

            user.save().then(() => {
                req.flash('success_msg', 'Privilégios de Admin Removidos')
                res.redirect('/admin/users')
            }).catch((err) => {
                console.error('Houve um Erro - ' + err)
                req.flash('error_msg', 'Houve um Erro')
                res.redirect('/admin/users')
            })
        }).catch((err) => {
            console.error('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/admin/users')
        })
    }
})

router.get('/estoque', isAdmin, (req, res) => {
    Prod.find().sort({ nome: 'asc' }).lean().then((prods) => {
        res.render('admin/estoque', { prods: prods, admin: 'admin' })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/user/perfil')
    })
})

router.post('/pesquisa', isAdmin, (req, res) => {
    Prod.find({ nome: { $regex: req.body.pesquisa, $options: 'i' } }).sort({ nome: 'asc' }).lean().then((prods) => {
        res.render('admin/estoque', { prods: prods })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/user/perfil')
    })
})

router.get('/estoque/adicionar/:id', isAdmin, (req, res) => {
    Prod.findOne({ _id: req.params.id }).lean().then((prod) => {
        res.render('admin/estoque_add', { prod: prod, admin: 'admin' })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/admin/estoque')
    })
})

router.post('/estoque/adicionar/:id', isAdmin, (req, res) => {
    Prod.findOne({ _id: req.params.id }).then((prod) => {
        prod.estoque += Number(req.body.estoque)

        prod.save().then(() => {
            console.log('Estoque de ' + req.body.estoque + ' adicionado ao Produto ' + req.params.id)
            res.redirect('/admin/estoque')
        }).catch((err) => {
            console.log('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/admin/estoque')
        })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/admin/estoque')
    })
})

router.get('/produto/cadastro', isAdmin, (req, res) => {
    res.render('admin/prod_cad', { admin: 'admin' })
})

router.post('/produto/cadastro', isAdmin, (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null) {
        erros.push({ texto: "Nome Inválido!" })
    } if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome muito Curto!" })
    } if (req.body.nome.length > 20) {
        erros.push({ texto: "Nome muito Longo! Máximo 20" })
    }

    const regexData = /^(?:20\d\d-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31))$/;

    if (!req.body.validade || typeof req.body.validade == undefined || typeof req.body.validade == null) {
        erros.push({ texto: "Validade Inválida!" })
    } if (regexData.test(req.body.validade) == false) {
        erros.push({ texto: "Validade Inválida! Formato aceitável 'aaaa-mm-dd'" })
    }

    if (!req.body.estoque || typeof req.body.estoque == undefined || typeof req.body.estoque == null) {
        erros.push({ texto: "Estoque Inválido!" })
    } if (isNaN(req.body.estoque)) {
        erros.push({ texto: "Estoque Inválido! Use um Número" })
    }

    if (!req.body.preco_compra || typeof req.body.preco_compra == undefined || typeof req.body.preco_compra == null) {
        erros.push({ texto: "Preço de Compra Inválido!" })
    }

    if (!req.body.preco_venda || typeof req.body.preco_venda == undefined || typeof req.body.preco_venda == null) {
        erros.push({ texto: "Preço de Venda Inválido!" })
    }

    if (erros.length > 0) {
        const prod_clone = {
            nome: req.body.nome,
            variacao: req.body.variacao,
            especificidade: req.body.especificidade,
            origem: req.body.origem,
            validade: req.body.validade,
            preco_compra: req.body.preco_compra,
            preco_venda: req.body.preco_venda,
            estoque: req.body.estoque,
        }
        res.render('admin/prod_cad', { erros: erros, prod_clone: prod_clone })
    } else {
        const prod_cad = {
            nome: req.body.nome.toUpperCase(),
            variacao: req.body.variacao,
            especificidade: req.body.especificidade,
            origem: req.body.origem,
            validade: req.body.validade,
            preco_compra: req.body.preco_compra,
            preco_venda: req.body.preco_venda,
            estoque: req.body.estoque,
            _data: Date.now()
        }

        new Prod(prod_cad).save().then(() => {
            req.flash('success_msg', 'Produto Cadastrado')
            res.redirect('/admin/estoque')
        }).catch((err) => {
            console.error('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/admin/produto/cadastro')
        })
    }
})

router.post('/prod/delete/:id', isAdmin, (req, res) => {
    Prod.deleteOne({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Produto Deletado')
        res.redirect('/admin/estoque')
    }).catch((err) => {
        console.error('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/admin/estoque')
    })
})

router.get('/prod/edit/:id', isAdmin, (req, res) => {
    Prod.findOne({ _id: req.params.id }).lean().then((prod) => {
        res.render('admin/prod_edit', { prod: prod, admin: 'admin' })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/admin/estoque')
    })
})

router.post('/produto/edit/:id', isAdmin, (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null) {
        erros.push({ texto: "Nome Inválido!" })
    } if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome muito Curto!" })
    } if (req.body.nome.length > 20) {
        erros.push({ texto: "Nome muito Longo! Máximo 20" })
    }

    const regexData = /^(?:20\d\d-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31))$/;

    if (!req.body.validade || typeof req.body.validade == undefined || typeof req.body.validade == null) {
        erros.push({ texto: "Validade Inválida!" })
    } if (regexData.test(req.body.validade) == false) {
        erros.push({ texto: "Validade Inválida! Formato aceitável 'aaaa-mm-dd'" })
    }

    if (!req.body.estoque || typeof req.body.estoque == undefined || typeof req.body.estoque == null) {
        erros.push({ texto: "Estoque Inválido!" })
    } if (isNaN(req.body.estoque)) {
        erros.push({ texto: "Estoque Inválido! Use um Número" })
    }

    if (!req.body.preco_compra || typeof req.body.preco_compra == undefined || typeof req.body.preco_compra == null) {
        erros.push({ texto: "Preço de Compra Inválido!" })
    }

    if (!req.body.preco_venda || typeof req.body.preco_venda == undefined || typeof req.body.preco_venda == null) {
        erros.push({ texto: "Preço de Venda Inválido!" })
    }

    if (erros.length > 0) {
        const prod = {
            nome: req.body.nome,
            variacao: req.body.variacao,
            especificidade: req.body.especificidade,
            origem: req.body.origem,
            validade: req.body.validade,
            preco_compra: req.body.preco_compra,
            preco_venda: req.body.preco_venda,
            estoque: req.body.estoque,
        }
        res.render('admin/prod_edit', { erros: erros, prod: prod })
    } else {
        Prod.findOne({ _id: req.params.id }).then((prod) => {

            prod.nome = req.body.nome.toUpperCase()
            prod.variacao = req.body.variacao
            prod.especificidade = req.body.especificidade
            prod.origem = req.body.origem
            prod.validade = req.body.validade
            prod.preco_compra = req.body.preco_compra
            prod.preco_venda = req.body.preco_venda
            prod.estoque = req.body.estoque
            prod._data = Date.now()

            prod.save().then(() => {
                req.flash('success_msg', 'Produto Atualizado')
                res.redirect('/admin/estoque')
            }).catch((err) => {
                console.error('Houve um Erro - ' + err)
                req.flash('error_msg', 'Houve um Erro')
                res.redirect('/admin/estoque')
            })
        }).catch((err) => {
            console.error('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/admin/estoque')
        })
    }
})

router.get('/estatistica', isAdmin, (req, res) => {
    Prod.find().sort({ vendidos: 'desc' }).limit(5).lean().then((prods) => {
        Relatorio.find().sort({ num: 'asc' }).lean().then((relatorios) => {
            res.render('admin/estatistica', { admin: 'admin', prods: prods, relatorios: relatorios })
        }).catch((err) => {
            console.error('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/user/perfil')
        })
    }).catch((err) => {
        console.error('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/user/perfil')
    })
})

router.post('/relatorio/empy', isAdmin, (req, res) => {
    Relatorio.deleteMany({ __v: 0 }).then(() => {
        Prod.updateMany({ __v: 0 }, { $set: { vendidos: 0 } }).then(() => {
            console.error('Dados Resetados')
            req.flash('success_msg', 'Dados Resetados')
            res.redirect('/admin/estatistica')
        }).catch((err) => {
            console.error('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/admin/estatistica')
        })
    }).catch((err) => {
        console.error('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/admin/estatistica')
    })
})

module.exports = router