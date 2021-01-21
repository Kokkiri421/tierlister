const mongoose = require('mongoose');
const router = require('express').Router();

const errors = require('../../utils/errors');
const methods = require('../../utils/methods');
const passport = require('../../config/passport');

const Tier = mongoose.model('Tier');
const Tierlist = mongoose.model('Tierlist');

router.post('/', async function(req, res, next) {
    await passport.authenticate('jwt', { session: false },
    async function(err,user,info) {
        try {
            if (!user){
                throw new errors.BaseError(info.name,info.message);
            }

            fields = [req.body.tierlistId, req.body.name];
            fieldNames = ['tierlistId','name'];
            methods.validateFields(fields, fieldNames);
            
            var tierlist = await methods.validateModel(user, Tierlist, 'tierlist', req.body.tierlistId, true);
            var tier = await new Tier();
            tier.name = req.body.name;
            tier.tierlist = tierlist._id;
            tier.owner = user._id;
            
            await tier.save();
            await tierlist.tiers.push(tier._id);
            await tierlist.save();
            await res.send(tier); 

        } catch (err) {
            next(err);
        }

    })(req, res, next)
});

router.get('/', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try{
                if (!user){
                    throw new errors.BaseError(info.name,info.message);
                }

                await Tier.find({}, function(err,tiers){
                    res.send(tiers);
                }).exec();
            }
            catch(err){
                next(err);
            }
        })(req, res, next)
});

router.get('/:id', async function(req, res, next) {
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try {
                if (!user) {
                    throw new errors.BaseError(info.name,info.message);
                }

                var tier = await methods.validateModel(user, Tier, 'tier', req.params.id, false);
                res.send(tier);

            } catch(err) {
                next(err);
            }

        })(req, res, next)
});

router.put('/:id', async function(req, res, next) {
    await passport.authenticate('jwt', { session: false },
    async function(err,user,info) {
        try {
            if (!user) {
                throw new errors.BaseError(info.name,info.message);
            }
            methods.validateFields([req.body.name], ['name']);

            var tier = await methods.validateModel(user, Tier, 'tier', req.params.id, true);
            tier.name = req.body.name;

            await tier.save();
            await res.send(tier); 

        } catch(err) {
            next(err);
        }

    })(req, res, next)
});

router.delete('/:id', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
    async function(err,user,info) {
        try {
            if (!user){
                throw new errors.BaseError(info.name,info.message);
            }
            
            var tier = await methods.validateModel(user, Tier, 'tier', req.params.id, true);

            await tier.remove();
            await res.send("succesfully deleted");

        } catch(err) {
            next(err);
        }

    })(req, res, next)
});

router.put('/replace/:id', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
    async function(err,user,info) {
        try{
            if (!user){
                throw new errors.BaseError(info.name,info.message);
            }
            methods.validateFields([req.body.index], ['index']);

            var tier = await methods.validateModel(user, Tier, 'tier', req.params.id, false);
            var tierlist = await methods.validateModel(user, Tierlist, 'tierlist', tier.tierlist, true);

            var oldIndex = tierlist.tiers
                .indexOf(tierlist.tiers.find(tier => tier._id == req.params.id));
            
            console.log(oldIndex);

            if (oldIndex == -1) {
                throw new errors.BaseError('ValidationError',"Wrong index"); 
            }

            

            if (req.body.index != oldIndex) {
                tierlist.tiers = await methods.moveArrayElement(tierlist.tiers, oldIndex, req.body.index);
                await tierlist.save();
            }

            await res.send(tier);

        } catch(err) {
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