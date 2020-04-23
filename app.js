//Require Modules
const express = require('express');
const categoryModel = require('./models/category.model');
const adminModel = require('./models/admin_manager.model');
const bidderModel = require('./models/bidders.model');
const sellerModel = require('./models/seller.model')
const exphbs = require('express-handlebars');
const express_handlebars_sections = require('express-handlebars-sections');
const session = require('express-session')
const moment = require('moment');
const passport = require('passport');
const morgan = require('morgan');
//Express instance
const app = express();
const PORT = process.env.PORT | 3000;
//View engine
app.engine('hbs', exphbs({
    helpers: {
        section: express_handlebars_sections(),
        formatName: (name) => name.toLowerCase().split(' ').join(''),
        maskName: (name) => "*****" + name.substr(Math.max(name.length - 4, 0), 4),
        formatTime: (date) => moment(date, "YYYY-MM-DD-HH-mm-ss").format("HH:mm:ss DD/MM/YYYY")
    }
}));
app.set('view engine', 'hbs');
//Middleware
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
    // app.use(morgan('dev'))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'))
app.use(async(req, res, next) => {
    var data = await categoryModel.parentCategory();
    var bidder = await bidderModel.manager();
    var seller = await sellerModel.manager();
    for (parent of data) {
        let children = await categoryModel.childCategory(parent.id);
        parent.hasChild = children.length;
        parent.children = children
    }

    res.locals.cate = {
        parent: data
    };


    res.locals.manager={
        bidder: bidder,
        seller: seller
    }
    res.locals.url = req.url;
    //Check logged in
    res.locals.isAuthenticated = false;
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        res.locals.isAuthenticated = true;
    }
    next();
})
app.use(async(req, res, next) => {
    var data = [];
    data = await adminModel.parentManager();
    for (parent of data) {
        let children = await adminModel.childManager(parent.id)
        parent.hasChild = children.length;
        parent.children = children;
    }
    res.locals.admin = { parent: data }
        //login error
    if (req.session.loginModal) {
        res.locals.loginModal = true;
        if (typeof(req.session.loginMessage) != 'undefined') {
            res.locals.loginMessage = req.session.loginMessage;
            res.locals.hasMsg = (req.session.loginMessage.length > 0);
            delete req.session.loginMessage;
        }
        delete req.session.loginModal;
    }



    //register error
    if (req.session.hasRegisterError) {
        res.locals.loginModal = true;
        if (typeof(req.session.errorMessage) != 'undefined') {
            res.locals.errorMessage = req.session.errorMessage;
            res.locals.hasMsg = (req.session.errorMessage.length > 0);
            delete req.session.errorMessage;
        }
        res.locals.errorMessage = req.session.errorMessage;
        delete req.session.hasRegisterError;
    }
    next();
})

//acount task
require('./middlewares/passport.mdw')(app, passport);
//User route
require('./middlewares/routes.mdw')(app);


app.use(function(err, req, res, next) {
    console.log(err);
    // res.render('errors');
});

//Listen at PORT
app.listen(PORT, () => {
    console.log(`Listening Port: ${PORT}`);
});