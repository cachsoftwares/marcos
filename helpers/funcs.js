module.exports = {
    isAuthed: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }

        req.flash('error_msg', 'Deves Entrar com a Sua Conta');
        res.redirect('/user/login');
    },

    isAdmin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.mode == "admin") {
            return next();
        }

        console.log('Área restrita');
        console.log(req.user);
        res.redirect('/');
    }
}