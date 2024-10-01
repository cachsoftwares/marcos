const local_strategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

require('../models/User');
const User = mongoose.model('users');

module.exports = function(passport) {

    passport.use(new local_strategy({usernameField: 'ident', passwordField: 'senha'}, (ident, senha, done) => {
        User.findOne({ident: ident}).then((user) => {
            if(!user) {
                return done(null, false, {message: 'Esta Conta não Existe'});
            } 

        
            if(senha == user.senha) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Senha Incorreta!'});
            }

        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
    
}