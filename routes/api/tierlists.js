const mongoose = require('mongoose');
const router = require('express').Router();

const errors = require('../../utils/errors');
const passport = require('../../config/passport');
const methods = require('../../utils/methods');

const Tierlist = mongoose.model('Tierlist');

router.post('/', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err, user, info) {
            try {
                if (!user){
                    throw new errors.BaseError(info.name,info.message);
                }
            
                methods.validateFields([req.body.name], ['name']);

                var tierlist = new Tierlist();
                tierlist.name = req.body.name;
                tierlist.owner = user;

                await tierlist.save();
                user.tierlists.push(tierlist._id);
                await user.save();
                await res.json();

            }catch(err) { 
                next(err);
            }
        })( req, res, next)
});

router.get('/', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try {
                if (!user){
                    throw new errors.BaseError(info.name,info.message);
                }

                await Tierlist.find({}, function(err,tierlists){
                    res.send(tierlists);
                }).exec();

            }catch(err){ 
                next(err);
            }
        })(req, res, next)
});

router.get('/:id', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try {
                if (!user) {
                    throw new errors.BaseError(info.name,info.message);
                }

                var tierlist = await methods.validateModel(user, Tierlist, 'tierlist', req.params.id, false);

                await res.send(tierlist);

            } catch(err) {
                next(err);
            }
        })(req, res, next)
});

router.put('/:id', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try{
                if (!user) {
                    throw new errors.BaseError(info.name,info.message);
                }
                methods.validateFields([req.body.name], ['name']);

                var tierlist = await methods.validateModel(user, Tierlist, 'tierlist', req.params.id, true);
                tierlist.name = req.body.name;
                await tierlist.save();
                res.send(tierlist);
            }
            catch(err){
                next(err);
            }
        })(req, res, next)
});

router.delete('/:id', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try{
                if (!user){
                    throw new errors.BaseError(info.name,info.message);
                }
                
                var tierlist = await methods.validateModel(user, Tierlist, 'tierlist', req.params.id, true);
                await tierlist.remove();

                res.send("succesfully deleted");
            }
            catch(err){
                next(err);
            }
        })(req, res, next)
});

router.use(async function(err, req, res, next){
    console.log(err.name);
    await errors.baseErrorHandler(err,res);
});

router.use(async function(req, res, next) {
    await errors.notFoundErrorHandler(req, res);
});

module.exports = router;