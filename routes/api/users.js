const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = require('express').Router();
const randtoken = require('rand-token');

const passport = require('../../config/passport');
const errors = require('../../utils/errors');
const methods = require('../../utils/methods');

const User = mongoose.model('User');


    
var refreshTokens = {};
const secret = 'secret';
const expirationTime = 3000;

router.post('/', async function(req, res, next) {
    try {
        const fields = [req.body.username, req.body.password];
        const fieldNames = ['username','password'];
        methods.validateFields(fields, fieldNames);

        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        
        await user.save();
        await res.json();
    }
    catch(err){
        next(err);
    }
});

router.get('/', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try {
                if (!user) {
                    throw new errors.BaseError(info.name,info.message);
                }
                await User.find({}, function(err, users) {
                    res.send(users);
                }).exec();

            } catch(err) {
                next(err);
            }
        }) (req, res, next)
});

router.get('/:username', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try {
                if (!user) {
                    throw new errors.BaseError(info.name,info.message);
                }

                foundUser = await User.findOne({username: req.params.username}).exec();
                if (!foundUser) {
                    throw new errors.BaseError("NotFoundError","No such user");
                }

                await res.send(foundUser);
            } catch(err) {
                next(err);
            }
        })(req, res, next)
});

router.post('/login', async function(req, res, next){
    try {
        const fields = [req.body.username, req.body.password];
        const fieldNames = ['username','password'];
        methods.validateFields(fields, fieldNames);

        var user = await User.findOne({username: req.body.username}).select('+password').exec();

        if (!user || !await user.validatePassword(req.body.password) ){
            throw new errors.BaseError(name='Unauthorized', message="Wrong username or password");
        }

        user.token = await jwt.sign({id:user._id,username:user.username},
            secret, { expiresIn: expirationTime });
        var refreshToken = await randtoken.uid(256);
        refreshTokens[refreshToken] = user;
        
        await res.json({token: user.token, refreshToken: refreshToken});

    }catch(err) {
        next(err);
    }
});

router.post('/logout', async function(req, res, next){
    try {
        const fields = [req.body.refreshToken];
        const fieldNames = ['refreshToken'];
        methods.validateFields(fields, fieldNames);

        if (!refreshTokens[req.body.refreshToken]) {
            throw new errors.BaseError(name='NotFoundError', message="No such refresh token");
        }

        await delete refreshTokens[req.body.refreshToken];
        await res.json({message: "you have logged out"});

    } catch(err) {
        next(err);
    }
    
});

router.post('/refresh', async function(req, res, next){
    try {
        const fields = [req.body.refreshToken];
        const fieldNames = ['refreshToken'];
        methods.validateFields(fields, fieldNames);

        if (!refreshTokens[req.body.refreshToken]) {
            throw new errors.BaseError(name='NotFoundError', message="No such refresh token");
        }

        var user = refreshTokens[req.body.refreshToken];
        user.token = await jwt.sign({id : user._id, username : user.username}, secret, { expiresIn: expirationTime });

        var newRefreshToken = await randtoken.uid(256);
        refreshTokens[newRefreshToken] = user;

        await delete refreshTokens[req.body.refreshToken];
        await res.json({token: user.token, refreshToken: newRefreshToken});
        
    } catch(err) {
        next(err);
    }
    
});

router.post('/logout', async function(req, res, next){
    try {
        const fields = [req.body.refreshToken];
        const fieldNames = ['refreshToken'];
        methods.validateFields(fields, fieldNames);

        if (!refreshTokens[req.body.refreshToken]) {
            throw new errors.BaseError(name='NotFoundError', message="No such refresh token");
        }
        
        await delete refreshTokens[req.body.refreshToken];
        await res.json({message: "you have logged out"});

    } catch(err) {
        next(err);
    }
    
});

router.use(async function(err, req, res, next){
    console.log(err.name);
    await errors.baseErrorHandler(err,res);
});

router.use(async function(req, res, next) {
    await errors.notFoundErrorHandler(req, res);
});

module.exports = router;


