const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const bidderModel = require('../models/bidders.model');
const sellerModel = require('../models/seller.model');
const config = require('../config/default.json');
const moment=require('moment');
const facebookConfig = require('../config/facebook-login.json');
const reviewModel=require('../models/reviews.model');
var Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha('6LdVh8wUAAAAACNjGKuimXNdTvWOI6ySPQ_9ntBb', '6LdVh8wUAAAAANLiBeI__ch1NzC381x4a2lfw37W');
module.exports = function(app, passport) {


    passport.use('local', new LocalStrategy(async function(email, password, done) {
        try {
            let user = await bidderModel.singleByEmail(email);
            if (user.length == 0)
                return done(null, false);
            user = user[0];
            if (!bcrypt.compareSync(password, user.password))
                return done(null, false);
            return done(null, user);
        } catch (e) {
            return done(e);
        }
    }));

    passport.serializeUser(function(user, done) {
        return done(null, user.id);
    });

    passport.deserializeUser(async function(id, done) {
        var user = await bidderModel.single(id);
        var isSeller = await sellerModel.isSeller(id);
        user[0].isSeller = (isSeller.length > 0);
        return done(null, user[0]);
    });

    // app.post('/login', passport.authenticate('local', { failureRedirect: '/about', successRedirect: '/' }))

    app.post('/login', (req, res, next) => {
        passport.authenticate('local', function(err, user) {
            if (err) return next(err);
            if (!user) {
                req.session.loginModal = true;
                req.session.loginMessage = "Invalid username or password";
                return res.redirect(req.query.url);
            }
            req.logIn(user, function(err) {
                if (err) return next(err);
                const url = req.query.retUrl || '/';
                return res.redirect(url);
            })
        })(req, res, next);

    })

    app.get('/login', (req, res, next)=>{
        res.render('guest/login', {layout: null})
    })

    app.post('/logout', (req, res) => {
        req.logOut();
        res.redirect('/');
    });

    //register
    app.get('/register', recaptcha.middleware.render, (req, res) => {
        res.render('guest/register', {
            captcha: res.recaptcha,
            layout: null
        });
    });
    app.post('/register', recaptcha.middleware.verify, async(req, res) => {
        if (!req.recaptcha.error) {
            let user = await bidderModel.singleByEmail(req.body.email);
            if (user.length > 0) // existed
            {
                req.session.RegisterError = true;
                req.session.registerMessage = "Email alreadly exist";
                return res.redirect("/register");
            } else {
                let hashPassword = bcrypt.hashSync(req.body.password, config.bcrypt.init);
                var name = req.body.name;
                var birthday = req.body.birthday;
                var email = req.body.email;
                var address = req.body.address;
                var password = req.body.password;
                var entity = {
                    'name': name,
                    'birthday': birthday,
                    'email': email,
                    'address': address,
                    'password': hashPassword
                }
                // entity.password = hashPassword;
                await bidderModel.add(entity);
                req.session.loginModal = true;
                res.redirect('/login');
            }
        } else {
            req.flash("message", "recaptcha is incorred");
            res.redirect("back");
        }
    });
    //Check whether email has exists ? 
    app.post('/validateEmail', async(req, res) => {
            let user = await bidderModel.singleByEmail(req.body.email);
            if (user.length == 0)
                return res.json({
                    valid: true
                });
            else
                return res.json({
                    valid: false
                });
        })
        //login with facebook
    passport.use(new FacebookStrategy({
        clientID: facebookConfig.clientID,
        clientSecret: facebookConfig.clientSecret,
        callbackURL: facebookConfig.callbackURL,
        profileFields: ['id', 'emails', 'name']
    }, async function(accessToken, refreshToken, profile, cb) {
        try {
            let user = await bidderModel.singleByFacebookId(profile.id);
            if (user.length == 0) {
                var findByEmail = await bidderModel.singleByEmail(profile.id);
                if (findByEmail.length > 0) { //has account with email
                    user = findByEmail[0];
                    user.facebook_id = profile.id;
                    await bidderModel.patch(user);
                } else { //dont have account with email
                    var entity = {
                        facebook_id: profile.id,
                        name: profile.name.familyName + " " + profile.name.givenName,
                        email: profile.id,
                        birthday: "2000-1-1"
                    };
                    await bidderModel.add(entity);
                }
                user = await bidderModel.singleByFacebookId(profile.id);
            }
            return cb(null, user[0]);
        } catch (e) {
            return cb(e, false);
        }
    }))
    app.get('/login/facebook',
        passport.authenticate('facebook', {
            scope: ["email"]
        }));

    app.get('/login/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/about'
        }),
        function(req, res) {
            if (req.user.password.length == 0)
                req.session.newFBAccount = true;
            res.redirect('/facebook/set-password');
        });
    app.get('/facebook/set-password', isAuth, (req, res) => {
        if (req.session.newFBAccount) {
            delete req.session.newFBAccount;
            return res.render('bidder/update-password', {
                newFBAccount: true
            })
        }
        res.redirect('/');
    })

    app.post('/facebook/set-password', isAuth, async(req, res) => {
        var entity = {};
        entity.id = req.user.id;
        entity.password = bcrypt.hashSync(req.body.newPassword, config.bcrypt.init);
        await bidderModel.patch(entity);
        res.redirect('/');
    })

    app.get('/update-password', isAuth, (req, res) => {
        if (req.user.password.length == 0)
            return res.redirect('/facebook/set-password');
        res.render('bidder/update-password',{layout:'bidder'});
    })

    app.post('/update-password', isAuth, async(req, res) => {
        if (bcrypt.compareSync(req.body.oldPassword, req.user.password)) {
            var entity = req.user;
            entity.password = bcrypt.hashSync(req.body.newPassword, config.bcrypt.init);
            await bidderModel.patch(entity);
            res.redirect('/bidder');
        } else {
            //set update password error on session
            res.redirect('/update-password');
        }
    })

    function isAuth(req, res, next) {
        if (req.user) {
            next();
        } else {
            req.session.loginModal = true;
            res.redirect('/');
        }
    }

    app.get('/profile', isAuth,async (req, res) => {
        birthday= moment(req.user.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD');
        list =await reviewModel.listReviewBidder(req.user.id);
        const total = await bidderModel.totalReviews(req.user.id);
        if (total > 0) {
            point = await bidderModel.pointReviews(req.user.id);
            point = (point / total) * 100;
        } else {
            point = 100;
        }
        res.render('guest/profile', {birthday, point, list});
    })
    app.post('/profile/edit', isAuth, (req, res) => {
        var entity=req.body;
        if(entity.name==='' || entity.birthday==='' || entity.address ===''){
            req.session.hasupdateError = true;
            req.session.errorMessage = "NOT NULL";
        }
        else{
            req.session.hasupdateError = false;
            entity.id=req.user.id;
            delete entity.point;
            bidderModel.patch(entity);
        }
        res.redirect('/profile');
    })
}