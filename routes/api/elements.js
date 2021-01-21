const mongoose = require('mongoose');
const router = require('express').Router();

const errors = require('../../utils/errors');
const passport = require('../../config/passport');
const methods = require('../../utils/methods');
const { populate } = require('../../models/Tier');

const Element = mongoose.model('Element');
const Tier = mongoose.model('Tier');

router.post('/', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try{
                if (!user) { 
                    throw new errors.BaseError(info.name,info.message);
                }

                fields = [req.body.name, req.body.imageURL, req.body.tierId];
                fieldNames = ['name','imageURL','tierId'];
                methods.validateFields(fields, fieldNames);

                var tier = await methods.validateModel(user, Tier, 'tier', req.body.tierId, true);

                var element = new Element();
                element.name = req.body.name;
                element.imageURL = req.body.imageURL;
                element.tier = req.body.tierId;
                element.owner = user._id;

                await element.save();
                await tier.elements.push(element._id);
                await tier.save();
                await res.json();

            } catch(err) {
                next(err);
            }
        }) (req, res, next)
});

router.get('/', async function(req, res, next) {
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try {
                if (!user) {
                    throw new errors.BaseError(info.name,info.message);
                }  
                await Element.find({}, function(err, elements) {
                    res.send(elements);
                }).exec();

            } catch(err) {
                next(err);
            }
        }) (req, res, next)
});

router.get('/:id', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
        async function(err,user,info) {
            try {
                if (!user) {
                    throw new errors.BaseError(info.name,info.message);
                }

                var element = await methods.validateModel(user, Element, 'element', req.params.id, false);
                res.send(element);
                
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
            
            var element = await methods.validateModel(user, Element, 'element', req.params.id, true);
            var tier = await methods.validateModel(user, Tier, 'tier', element.tier, true);
    
            await element.remove();
            res.send(tier.elements);

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
            
            fields = [req.body.name || req.body.imageURL];
            fieldNames = ['name or imageURL'];
            methods.validateFields(fields, fieldNames);

            var element = await methods.validateModel(user, Element, 'element', req.params.id, true);

            if (req.body.name) {
                element.name = req.body.name;
            }
            if (req.body.imageURL) {
                element.imageURL = req.body.imageURL;
            }

            await element.save();
            await res.send(element); 

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

            fields = [req.body.index];
            fieldNames = ['index'];
            methods.validateFields(fields, fieldNames);

            var element = await methods.validateModel(user, Element, 'element', req.params.id, true);
            var tier = await methods.validateModel(user, Tier, 'tier', element.tier, true);

            var oldIndex = tier.elements
                .indexOf(tier.elements.find(element => element._id == req.params.id));

            if (oldIndex == -1) {
                throw new errors.BaseError('ValidationError', "Wrong index"); 
            }

            if (req.body.index != oldIndex) {
                tier.elements = await methods.moveArrayElement(tier.elements, oldIndex, req.body.index);
                await tier.save();
            }
            await res.send(tier.elements);

        } catch(err) {
            next(err);
        }

    })(req, res, next)
});

router.put('/changetier/:id', async function(req, res, next){
    await passport.authenticate('jwt', { session: false },
    async function(err,user,info) {
        try{
            if (!user){
                throw new errors.BaseError(info.name,info.message);
            }

            fields = [req.body.tierId];
            fieldNames = ['tierId'];
            methods.validateFields(fields, fieldNames);

            var element = await methods.validateModel(user, Element, 'element', req.params.id, true);
            var oldTier = await methods.validateModel(user, Tier, 'tier', element.tier, true);
            var newTier = await methods.validateModel(user, Tier, 'tier', req.body.tierId, true);
            if (!newTier.equals(oldTier)) {
                
                
                await newTier.elements.push(element);
                await oldTier.elements.pull(element);
                element.tier = newTier._id;
                await element.save();
                await newTier.save();
                await oldTier.save();

                
                
                
                await res.json({newTier: newTier.elements, oldTier: oldTier.elements});

            } else {
                
                throw new errors.BaseError('ValidationError', "Old tier and new tier are the same. Use /replace/ instead"); 
            }
            

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