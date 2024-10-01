const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const multer = require('multer')

/* Conf. da Rota */
const router = express.Router()

/* Importando Arquivos */
require('../models/User')
require('../models/Venda')

const User = mongoose.model('users')
const Venda = mongoose.model('vendas')
const { isAuthed } = require('../helpers/funcs')

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/img/users/')
    },
    filename: function (req, file, callback) {

        const extensao = file.originalname.split('.')[1]

        const newName = file.originalname

        callback(null, `${newName}`)
    }
})

var upload = multer({ storage: storage })

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

router.get('/login', (req, res) => {
    User.find({ mode: 'admin' }).lean().then((admin_found) => {
        res.render('user/login', { admin_found: admin_found })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/')
    })
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/user/perfil',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next)
});

router.post('/logout', (req, res) => {
    User.findOne({ ident: req.user.ident }).then((user) => {
        user.status = 'offline';

        user.save().then(() => {
            req.logout((err) => {
                if (err) {
                    console.log('Houve um Erro - ' + err);
                    req.flash('error_msg', 'Houve um Erro');
                    return res.redirect('/user/perfil');
                }

                req.flash('success_msg', 'Conta Fechada');
                res.redirect('/user/login');
            });
        }).catch((err) => {
            console.log('Houve um Erro - ' + err);
            req.flash('error_msg', 'Houve um Erro');
            res.redirect('/');
        });
    });
});

router.get('/perfil', isAuthed, (req, res) => {
    var admin
    if (req.user.mode == 'admin') {
        admin = 'admin'
    }

    User.findOne({ _id: req.user._id }).lean().then((userLogado) => {
        Venda.find().sort({ _data: 'asc' }).lean().then((vendas) => {
            if (req.user.status == 'online') {
                res.render('user/perfil', { userLogado: userLogado, admin: admin, vendas: vendas })
            } else {
                User.findOne({ ident: req.user.ident }).then((user) => {
                    user.status = 'online'

                    user.save().then(() => {
                        res.render('user/perfil', { userLogado: userLogado, admin: admin, vendas: vendas })

                    }).catch((err) => {
                        console.log('Houve um Erro - ' + err)
                        req.flash('error_msg', 'Houve um Erro')
                        res.redirect('/user/login')
                    })
                }).catch((err) => {
                    console.log('Houve um Erro - ' + err)
                    req.flash('error_msg', 'Houve um Erro')
                    res.redirect('/user/login')
                })
            }
        }).catch((err) => {
            console.log('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/venda')
        })
    }).catch((err) => {
        console.error('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/')
    })

})

router.get('/edit/:ident', isAuthed, (req, res) => {
    var admin
    if (req.user.mode == 'admin') {
        admin = 'admin'
    }

    User.findOne({ ident: req.params.ident }).lean().then((user) => {
        res.render('user/user_edit', { user: user, admin: admin })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/user/perfil')
    })
})

router.post('/edit', isAuthed, (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null) {
        erros.push({ texto: 'Nome Inválido' })
    } if (req.body.nome.length < 2) {
        erros.push({ texto: 'Nome muito Curto' })
    } if (req.body.nome.length > 20) {
        erros.push({ texto: 'Nome muito Longo! Máximo 20' })
    }

    if (!req.body.ident || typeof req.body.ident == undefined || typeof req.body.ident == null) {
        erros.push({ texto: 'Telefone | Email Inválido' })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || typeof req.body.senha == null) {
        erros.push({ texto: 'Senha Inválido' })
    } if (req.body.senha.length < 6) {
        erros.push({ texto: 'Senha muito Curta! Mínimo 6' })
    } if (req.body.senha != req.body.conf_senha) {
        erros.push({ texto: 'As Senhas são Diferentes' })
    }

    if (erros.length > 0) {
        req.flash('error_msg', 'Dados Incorretos')
        res.redirect('/user/edit/' + req.user.ident)
    } else {

        User.findOne({ _id: req.body.id }).then((userId) => {
            if (req.body.ident != userId.ident) {
                User.findOne({ ident: req.body.ident }).then((dono) => {
                    if (dono) {
                        User.findOne({ _id: req.body.id }).lean().then((user) => {
                            req.flash('error_msg', 'Este Identificador já Existe. Use Outro')
                            res.render('user/user_edit', { user: user })
                        })
                    } else {
                        User.findOne({ _id: req.body.id }).then((user) => {
                            user.nome = req.body.nome
                            user.ident = req.body.ident
                            user.morada = req.body.morada
                            user.senha = req.body.senha

                            user.save().then(() => {
                                req.flash('success_msg', 'Funcionário Atualizado')
                                res.redirect('/user/perfil')
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve um Erro - ' + err)
                                res.redirect('/user/edit/' + req.user.ident)
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um Erro')
                            console.log('Houve um Erro - ' + err)
                            res.redirect('/user/edit/' + req.user.ident)
                        })
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um Erro')
                    console.log('Houve um Erro - ' + err)
                    res.redirect('/user/edit/' + req.user.ident)
                })
            } else {
                User.findOne({ _id: req.body.id }).then((user) => {

                    user.nome = req.body.nome
                    user.ident = req.body.ident
                    user.senha = req.body.senha

                    user.save().then(() => {
                        req.flash('success_msg', 'Funcionário Atualizado')
                        res.redirect('/user/perfil')
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um Erro - ' + err)
                        res.redirect('/user/perfil')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um Erro')
                    console.log('Houve um Erro - ' + err)
                    res.redirect('/user/perfil')
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um Erro')
            console.log('Houve um Erro - ' + err)
            res.redirect('/user/perfil')
        })
    }
})

router.get('/edit/photo/:ident', isAuthed, (req, res) => {
    var admin
    if (req.user.mode == 'admin') {
        admin = 'admin'
    }

    User.findOne({ ident: req.params.ident }).lean().then((user) => {
        res.render('user/user_editPhoto', { user: user, admin: admin })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/user/perfil')
    })
})

router.post('/edit/photo', isAuthed, upload.single('foto'), (req, res) => {

    User.findOne({ ident: req.body.ident }).then((user) => {
        user.foto = req.body.fotoText || 'default.png'

        user.save().then(() => {
            req.flash('success_msg', 'Foto Atualizada')
            res.redirect('/user/perfil')
        }).catch((err) => {
            console.log('Houve um Erro - ' + err)
            req.flash('error_msg', 'Houve um Erro')
            res.redirect('/user/perfil')
        })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/user/perfil')
    })
})

module.exports = router