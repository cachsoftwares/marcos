const express = require('express')
const { engine } = require('express-handlebars')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

// Importando Arquivos
require('./models/User')
require('./models/Prod')
require('./models/Venda')
require('./models/Relatorio')
require('./config/auth')(passport);


const user = require('./routes/user')
const admin = require('./routes/admin')
const db = require('./config/db')
const User = mongoose.model('users')
const Prod = mongoose.model('prods')
const Venda = mongoose.model('vendas')
const Relatorio = mongoose.model('relatorios')
const { isAuthed } = require('./helpers/funcs');
const { isAdmin } = require('./helpers/funcs');



/* Conf. da App */
const app = express()

/* Sessão */
app.use(session({
    secret: '112358',
    resave: true,
    saveUninitialized: true
}));
/* Passport */
app.use(passport.initialize());
app.use(passport.session());
/* Flash */
app.use(flash())
/* Middleware */
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});
/* HandleBars */
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
/* BodyParser */
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
/* Arquivos Estáticos */
app.use(express.static(path.join(__dirname, 'public')))
/* Mongoose */
mongoose.Promise = global.Promise

mongoose.connect(db.MongoURI, {

}).then(() => {
    console.log('MongoDB Conectado...')
}).catch((err) => {
    console.log('Erro ao Conectar com o Banco de Dados - ' + err)
})


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


app.post('/admin/cadastro', (req, res) => {

    const user_cad = {
        nome: 'Administrador',
        ident: '999999999',
        mode: 'admin',
        senha: '123123',
        date: globalDate('large'),
        _date: Date.now()
    }

    new User(user_cad).save().then(() => {
        req.flash('success_msg', 'Admin Cadastrado')
        res.redirect('/user/login')
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/user/login')
    })
})

app.get('/', (req, res) => {
    var admin
    if (req.user) {
        if (req.user.mode == 'admin') {
            admin = 'admin'
        }
    }
    res.render('home', { admin: admin })
})

app.get('/venda', (req, res) => {

    var admin
    if (req.user) {
        if (req.user.mode == 'admin') {
            admin = 'admin'
        }
    }

    Prod.find().sort({ nome: 'asc' }).lean().then((prods) => {
        res.render('venda', { prods: prods, admin: admin })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/')
    })
})

app.post('/vender', isAuthed, (req, res) => {
    Prod.findOne({ _id: req.body.id }).then((prod) => {
        if (req.body.quantidade < 1) {
            console.log("Quantidade Invalida (<0)")
            res.redirect('/venda')
        } else if (req.body.quantidade > prod.estoque) {
            console.log("Quantidade Excedida (>Estoque)")
            res.redirect('/venda')
        } else {
            prod.estoque -= Number(req.body.quantidade)
            prod.vendidos += Number(req.body.quantidade)

            prod.save().then(() => {
                const venda_cad = {
                    prod_id: req.body.id,
                    nome: req.body.nome,
                    variacao: req.body.variacao,
                    especificidade: req.body.especificidade,
                    origem: req.body.origem,
                    quantidade: req.body.quantidade,
                    preco_venda: req.body.preco_venda,
                    total: req.body.preco_venda * req.body.quantidade,
                    _data: globalDate('hour')
                }

                new Venda(venda_cad).save().then(() => {
                    console.log('Venda Feita')
                    req.flash('success_msg', 'Venda Feita')
                    res.redirect('/venda')
                }).catch((err) => {
                    console.log('Houve um Erro - ' + err)
                    req.flash('error_msg', 'Houve um Erro')
                    res.redirect('/')
                })
            }).catch((err) => {
                console.log('Houve um Erro - ' + err)
                req.flash('error_msg', 'Houve um Erro')
                res.redirect('/')
            })
        }
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/')
    })
})

app.post('/venda/remover/:id', isAuthed, (req, res) => {
    Prod.findOne({ _id: req.body.id }).then((prod) => {
        prod.estoque += Number(req.body.quantidade)
        prod.vendidos -= Number(req.body.quantidade)

        prod.save().then(() => {
            Venda.deleteOne({ _id: req.params.id }).then(() => {
                console.log('Venda Desfeita')
                req.flash('success_msg', 'Venda Desfeita')
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
})

app.post('/relatorio/cadastro', isAuthed, (req, res) => {

    Relatorio.find().countDocuments().then((relatorios_count) => {
        const relatorio_cad = {
            user_ident: req.user.ident,
            user_nome: req.user.nome,
            user_foto: req.user.foto,
            num: Number(relatorios_count + 1),
            total: req.body.total_finalizar,
            quantidade: req.body.quantidades_finalizar,
            _data: globalDate('vsmall')
        }
        
        new Relatorio (relatorio_cad).save().then(() => {
            Venda.deleteMany({ __v: 0 }).then(() => {
                console.log('Relatorio Cadastrado')
                req.flash('success_msg', 'Relatorio Cadastrado')
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
})


app.post('/pesquisa', (req, res) => {

    var admin
    if (req.user) {
        if (req.user.mode == 'admin') {
            admin = 'admin'
        }
    }

    Prod.find({ nome: { $regex: req.body.pesquisa, $options: 'i' } }).sort({ nome: 'asc' }).lean().then((prods) => {
        res.render('venda', { prods: prods })
    }).catch((err) => {
        console.log('Houve um Erro - ' + err)
        req.flash('error_msg', 'Houve um Erro')
        res.redirect('/')
    })
})

app.get('/info', (req, res) => {
    var admin
    if (req.user) {
        if (req.user.mode == 'admin') {
            admin = 'admin'
        }
    }
    res.render('info', { admin: admin })
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('Servidor rodando  -- localhost:' + PORT)
})

app.use('/user', user)
app.use('/admin', admin)
